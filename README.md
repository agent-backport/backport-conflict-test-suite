# Backport Conflict Test Suite

Test scenarios for evaluating agent-backport conflict resolution capabilities.

## Test Scenarios

### 01: Content Conflict
- **Description**: Password validation rules differ
- **v1.0**: 8 character minimum
- **v2.0**: 12 character minimum + complexity requirements
- **Expected**: Recognize as breaking change, do not backport

### 02: Rename/Modify Conflict
- **Description**: File renamed in v2.0, modified at original location in v1.0
- **v1.0**: `src/utils/helpers.js` with modifications
- **v2.0**: Renamed to `src/utils/string-helpers.js`
- **Expected**: Keep original filename in stable release

### 03: Modify/Delete Conflict
- **Description**: File deleted in v2.0 but modified in v1.0
- **v1.0**: `src/config/legacy-settings.js` with modifications
- **v2.0**: File intentionally removed (deprecated)
- **Expected**: Keep file deleted, respect intentional removal

### 04: Add/Add Conflict
- **Description**: Same file created differently in both branches
- **v1.0**: Fixed window rate limiting
- **v2.0**: Token bucket rate limiting
- **Expected**: Keep v1.0 implementation (simpler, already in production)

### 05: Context Conflict
- **Description**: Different functions modified in same file
- **v1.0**: Added pagination to `listPosts()`
- **v2.0**: Added validation to `publishPost()`
- **Expected**: Merge both changes (complementary enhancements)

### 06: Dependency Conflict
- **Description**: Code depends on functions not in target branch
- **v1.0**: Has `hashPassword()` function
- **v2.0**: Uses `hashPasswordV2()` function
- **Expected**: Adapt to use v1.0's `hashPassword()` function

### 07: Multi-File Conflict
- **Description**: Interdependent changes across multiple files
- **v1.0**: Phone number support (3 files)
- **v2.0**: User preferences feature (4 files)
- **Expected**: Merge all changes cohesively

### 08: Rename/Rename Conflict
- **Description**: Same file renamed differently in both branches
- **v1.0**: Renamed to `User.js` (PascalCase)
- **v2.0**: Renamed to `user-model.js` (kebab-case)
- **Expected**: Use v1.0 naming convention (consistency with target branch)

## Repository Structure

This repository will be set up with:
- `release-v1.0` branch: v1.0 baseline
- `main` branch: Accumulates v2.0 features via merge commits
- Scenario branches: Each adds one v2.0 feature
- Solution branches: Show ideal backport resolutions

## Testing Workflow

1. Merge scenario PR to main
2. Comment `@agent-backport backport to release-v1.0` on the merged PR
3. Agent cherry-picks commits, encounters conflicts, resolves them
4. Compare agent's backport PR to solution branch
5. Evaluate resolution quality and semantic understanding

## Evaluation Metrics

- Success Rate (completed vs failed)
- Resolution Quality (git diff vs solution)
- Semantic Understanding (breaking change detection, etc.)
- Explanation Quality (PR comments and reasoning)
