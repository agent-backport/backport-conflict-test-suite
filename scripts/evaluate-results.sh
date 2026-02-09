#!/bin/bash

# evaluate-results.sh
# Collects evaluation metrics for backport agent performance across test scenarios
#
# Usage:
#   ./scripts/evaluate-results.sh [options]
#
# Options:
#   --pr-numbers FILE    Path to pr-numbers.txt (default: ./pr-numbers.txt)
#   --output FILE        Output evaluation report (default: ./EVALUATION.md)
#   --format FORMAT      Output format: markdown|json|both (default: markdown)
#   --verbose            Show detailed progress information
#   --help               Show this help message
#
# Requirements:
#   - gh CLI installed and authenticated
#   - git with access to repository
#   - jq for JSON processing
#
# Metrics Collected:
#   - Success rate per scenario
#   - Resolution quality (diff vs solution branch)
#   - Semantic understanding indicators
#   - Confidence levels from agent comments
#   - Test pass/fail status

set -euo pipefail

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PR_NUMBERS_FILE="${REPO_ROOT}/pr-numbers.txt"
OUTPUT_FILE="${REPO_ROOT}/EVALUATION.md"
OUTPUT_FORMAT="markdown"
VERBOSE=false
TARGET_BRANCH="release-v1.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Temporary files
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1" >&2
    fi
}

show_help() {
    head -n 25 "$0" | grep "^#" | sed 's/^# \?//'
    exit 0
}

check_requirements() {
    log_info "Checking requirements..."

    if ! command -v gh &> /dev/null; then
        log_error "gh CLI is not installed"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed (required for JSON processing)"
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        log_error "gh CLI is not authenticated"
        exit 1
    fi

    log_success "All requirements satisfied"
}

find_backport_pr() {
    local source_pr="$1"
    log_verbose "Looking for backport PR created from #${source_pr}"

    # Search for PR comments mentioning backport completion
    local backport_pr
    backport_pr=$(gh pr view "$source_pr" --json comments --jq '.comments[].body' 2>/dev/null | \
        grep -oE "backport.*#[0-9]+" | grep -oE "#[0-9]+" | head -n1 | tr -d '#' || echo "")

    if [[ -n "$backport_pr" ]]; then
        log_verbose "Found backport PR: #${backport_pr}"
        echo "$backport_pr"
    else
        log_verbose "No backport PR found for #${source_pr}"
        echo ""
    fi
}

get_pr_status() {
    local pr_number="$1"
    gh pr view "$pr_number" --json state,mergeable,merged --jq '{state,mergeable,merged}' 2>/dev/null || echo '{"state":"UNKNOWN","mergeable":"UNKNOWN","merged":false}'
}

extract_confidence_level() {
    local pr_number="$1"
    log_verbose "Extracting confidence level from PR #${pr_number}"

    # Look for confidence indicators in comments
    local confidence
    confidence=$(gh pr view "$pr_number" --json comments --jq '.comments[].body' 2>/dev/null | \
        grep -oiE "confidence:? ?(high|medium|low|[0-9]{1,3}%?)" | head -n1 || echo "")

    if [[ -n "$confidence" ]]; then
        echo "$confidence"
    else
        echo "unknown"
    fi
}

calculate_diff_score() {
    local backport_branch="$1"
    local solution_branch="$2"

    log_verbose "Comparing ${backport_branch} with ${solution_branch}"

    # Check if solution branch exists
    if ! git rev-parse --verify "origin/${solution_branch}" &> /dev/null 2>&1; then
        log_verbose "Solution branch ${solution_branch} does not exist"
        echo "N/A"
        return
    fi

    # Calculate diff stats
    local diff_stats
    diff_stats=$(git diff --shortstat "origin/${backport_branch}" "origin/${solution_branch}" 2>/dev/null || echo "")

    if [[ -z "$diff_stats" ]]; then
        # Perfect match
        echo "100"
    elif [[ "$diff_stats" =~ ([0-9]+)\ file ]]; then
        local files_changed="${BASH_REMATCH[1]}"
        # Simple scoring: penalize each changed file
        # Adjust scoring based on your needs
        local score=$((100 - files_changed * 10))
        if [[ $score -lt 0 ]]; then
            score=0
        fi
        echo "$score"
    else
        echo "0"
    fi
}

check_tests_passing() {
    local pr_number="$1"
    log_verbose "Checking test status for PR #${pr_number}"

    # Get check runs status
    local checks_status
    checks_status=$(gh pr view "$pr_number" --json statusCheckRollup --jq '.statusCheckRollup[].conclusion' 2>/dev/null | sort -u | tr '\n' ',' || echo "")

    if [[ "$checks_status" == *"FAILURE"* ]]; then
        echo "failing"
    elif [[ "$checks_status" == *"SUCCESS"* ]]; then
        echo "passing"
    elif [[ -z "$checks_status" ]]; then
        echo "none"
    else
        echo "pending"
    fi
}

evaluate_scenario() {
    local scenario_num="$1"
    local source_pr="$2"

    log_info "Evaluating scenario ${scenario_num} (PR #${source_pr})"

    local result_file="${TEMP_DIR}/scenario-${scenario_num}.json"

    # Find backport PR
    local backport_pr
    backport_pr=$(find_backport_pr "$source_pr")

    # Get scenario metadata
    local scenario_branch="scenario-${scenario_num}-"
    scenario_branch+=$(git branch -r | grep "origin/scenario-${scenario_num}-" | head -n1 | sed 's/.*scenario-[0-9]\+-//' || echo "unknown")

    local solution_branch="solution-${scenario_num}-${scenario_branch#*-}"

    # Initialize result
    local success="false"
    local resolution_quality="0"
    local confidence="unknown"
    local tests_passing="unknown"
    local pr_state="unknown"
    local notes=""

    if [[ -n "$backport_pr" ]]; then
        success="true"

        # Get PR status
        local pr_status
        pr_status=$(get_pr_status "$backport_pr")
        pr_state=$(echo "$pr_status" | jq -r '.state')

        # Extract confidence
        confidence=$(extract_confidence_level "$backport_pr")

        # Calculate quality score
        local backport_branch
        backport_branch=$(gh pr view "$backport_pr" --json headRefName --jq '.headRefName' 2>/dev/null || echo "")

        if [[ -n "$backport_branch" ]]; then
            resolution_quality=$(calculate_diff_score "$backport_branch" "$solution_branch")
        fi

        # Check tests
        tests_passing=$(check_tests_passing "$backport_pr")

        log_success "Scenario ${scenario_num}: Backport completed (PR #${backport_pr})"
    else
        success="false"
        notes="No backport PR found"
        log_warning "Scenario ${scenario_num}: No backport PR found"
    fi

    # Save result as JSON
    cat > "$result_file" <<EOF
{
  "scenario": "$scenario_num",
  "source_pr": "$source_pr",
  "backport_pr": "$backport_pr",
  "success": $success,
  "resolution_quality": "$resolution_quality",
  "confidence": "$confidence",
  "tests_passing": "$tests_passing",
  "pr_state": "$pr_state",
  "solution_branch": "$solution_branch",
  "notes": "$notes"
}
EOF

    log_verbose "Result saved to $result_file"
}

generate_markdown_report() {
    local results_dir="$1"
    local output_file="$2"

    log_info "Generating markdown report..."

    local total=0
    local successful=0
    local quality_sum=0
    local quality_count=0

    # Header
    cat > "$output_file" <<'EOF'
# Backport Agent Evaluation Results

Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Summary

EOF

    # Collect aggregate metrics
    for result_file in "$results_dir"/scenario-*.json; do
        if [[ -f "$result_file" ]]; then
            ((total++))
            local success
            success=$(jq -r '.success' "$result_file")
            if [[ "$success" == "true" ]]; then
                ((successful++))
            fi

            local quality
            quality=$(jq -r '.resolution_quality' "$result_file")
            if [[ "$quality" != "N/A" ]] && [[ "$quality" =~ ^[0-9]+$ ]]; then
                quality_sum=$((quality_sum + quality))
                ((quality_count++))
            fi
        fi
    done

    local success_rate=0
    if [[ $total -gt 0 ]]; then
        success_rate=$((successful * 100 / total))
    fi

    local avg_quality="N/A"
    if [[ $quality_count -gt 0 ]]; then
        avg_quality=$((quality_sum / quality_count))
    fi

    # Summary stats
    cat >> "$output_file" <<EOF
- **Total Scenarios:** $total
- **Successful Backports:** $successful
- **Success Rate:** ${success_rate}%
- **Average Resolution Quality:** ${avg_quality}$(if [[ "$avg_quality" != "N/A" ]]; then echo "%"; fi)

## Per-Scenario Results

| Scenario | Source PR | Backport PR | Success | Quality | Confidence | Tests | Notes |
|----------|-----------|-------------|---------|---------|------------|-------|-------|
EOF

    # Add per-scenario rows
    for i in $(seq 1 8); do
        local padded_i=$(printf "%02d" "$i")
        local result_file="${results_dir}/scenario-${padded_i}.json"
        if [[ -f "$result_file" ]]; then
            local scenario source_pr backport_pr success quality confidence tests notes

            scenario=$(jq -r '.scenario' "$result_file")
            source_pr=$(jq -r '.source_pr' "$result_file")
            backport_pr=$(jq -r '.backport_pr // "N/A"' "$result_file")
            success=$(jq -r '.success' "$result_file")
            quality=$(jq -r '.resolution_quality // "N/A"' "$result_file")
            confidence=$(jq -r '.confidence // "unknown"' "$result_file")
            tests=$(jq -r '.tests_passing // "unknown"' "$result_file")
            notes=$(jq -r '.notes // ""' "$result_file")

            local success_icon="❌"
            if [[ "$success" == "true" ]]; then
                success_icon="✅"
            fi

            local quality_display="$quality"
            if [[ "$quality" =~ ^[0-9]+$ ]]; then
                quality_display="${quality}%"
            fi

            echo "| ${scenario} | #${source_pr} | $(if [[ "$backport_pr" != "N/A" ]]; then echo "#${backport_pr}"; else echo "N/A"; fi) | ${success_icon} | ${quality_display} | ${confidence} | ${tests} | ${notes} |" >> "$output_file"
        fi
    done

    # Failure patterns section
    cat >> "$output_file" <<'EOF'

## Failure Patterns Analysis

EOF

    local has_failures=false
    for result_file in "$results_dir"/scenario-*.json; do
        if [[ -f "$result_file" ]]; then
            local success
            success=$(jq -r '.success' "$result_file")
            if [[ "$success" == "false" ]]; then
                has_failures=true
                local scenario notes
                scenario=$(jq -r '.scenario' "$result_file")
                notes=$(jq -r '.notes // "No details available"' "$result_file")
                echo "- **Scenario ${scenario}:** ${notes}" >> "$output_file"
            fi
        fi
    done

    if [[ "$has_failures" == "false" ]]; then
        echo "No failures detected. All scenarios completed successfully." >> "$output_file"
    fi

    # Recommendations section
    cat >> "$output_file" <<'EOF'

## Recommendations

EOF

    if [[ $success_rate -lt 70 ]]; then
        cat >> "$output_file" <<'EOF'
### Critical Issues
- Success rate below 70% indicates significant problems with backport automation
- Review agent prompts and conflict resolution logic
- Consider additional training scenarios
EOF
    fi

    if [[ "$avg_quality" != "N/A" ]] && [[ $avg_quality -lt 80 ]]; then
        cat >> "$output_file" <<'EOF'

### Resolution Quality
- Average resolution quality below 80% suggests semantic understanding gaps
- Review solution branches to understand expected resolutions
- Improve agent's context awareness and decision-making logic
EOF
    fi

    cat >> "$output_file" <<'EOF'

### Next Steps
1. Review failed scenarios in detail
2. Analyze differences between agent output and solution branches
3. Update prompts based on common failure patterns
4. Re-run evaluation after improvements
5. Consider adding new scenarios for edge cases discovered

---

*Generated by `evaluate-results.sh` - Automated backport agent evaluation*
EOF

    log_success "Markdown report generated: $output_file"
}

generate_json_report() {
    local results_dir="$1"
    local output_file="$2"

    log_info "Generating JSON report..."

    local results_json="${output_file%.md}.json"

    echo "{" > "$results_json"
    echo '  "evaluation_timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",' >> "$results_json"
    echo '  "scenarios": [' >> "$results_json"

    local first=true
    for result_file in "$results_dir"/scenario-*.json; do
        if [[ -f "$result_file" ]]; then
            if [[ "$first" == "false" ]]; then
                echo "    ," >> "$results_json"
            fi
            cat "$result_file" | sed 's/^/    /' >> "$results_json"
            first=false
        fi
    done

    echo "" >> "$results_json"
    echo '  ]' >> "$results_json"
    echo "}" >> "$results_json"

    log_success "JSON report generated: $results_json"
}

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --pr-numbers)
                PR_NUMBERS_FILE="$2"
                shift 2
                ;;
            --output)
                OUTPUT_FILE="$2"
                shift 2
                ;;
            --format)
                OUTPUT_FORMAT="$2"
                shift 2
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                show_help
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                ;;
        esac
    done

    cd "$REPO_ROOT"

    log_info "Starting evaluation..."
    log_info "Repository: $REPO_ROOT"
    log_info "PR numbers file: $PR_NUMBERS_FILE"
    log_info "Output: $OUTPUT_FILE"
    log_info "Format: $OUTPUT_FORMAT"
    echo "" >&2

    check_requirements
    echo "" >&2

    # Check PR numbers file exists
    if [[ ! -f "$PR_NUMBERS_FILE" ]]; then
        log_error "PR numbers file not found: $PR_NUMBERS_FILE"
        log_info "Run create-test-prs.sh first to generate test PRs"
        exit 1
    fi

    # Evaluate each scenario
    while IFS=: read -r scenario_num source_pr; do
        if [[ -n "$scenario_num" ]] && [[ -n "$source_pr" ]]; then
            evaluate_scenario "$scenario_num" "$source_pr"
            echo "" >&2
        fi
    done < "$PR_NUMBERS_FILE"

    # Generate reports
    if [[ "$OUTPUT_FORMAT" == "markdown" ]] || [[ "$OUTPUT_FORMAT" == "both" ]]; then
        generate_markdown_report "$TEMP_DIR" "$OUTPUT_FILE"
    fi

    if [[ "$OUTPUT_FORMAT" == "json" ]] || [[ "$OUTPUT_FORMAT" == "both" ]]; then
        generate_json_report "$TEMP_DIR" "$OUTPUT_FILE"
    fi

    echo "" >&2
    log_success "Evaluation complete!"
}

main "$@"
