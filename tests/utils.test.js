/**
 * Utility tests
 */

const validation = require('../src/utils/validation');
const formatting = require('../src/utils/formatting');
const helpers = require('../src/utils/helpers');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log('✓', message);
  } else {
    testsFailed++;
    console.error('✗', message);
  }
}

console.log('\n=== Running Utility Tests ===\n');

// Email validation tests
assert(validation.validateEmail('test@example.com') === true, 'Valid email accepted');
assert(validation.validateEmail('invalid') === false, 'Invalid email rejected');
assert(validation.validateEmail('test@') === false, 'Incomplete email rejected');

// Password validation tests (v2.0 - 12 char minimum)
assert(validation.validatePassword('SecurePass123') === true, 'Strong password accepted');
assert(validation.validatePassword('weak') === false, 'Weak password rejected');
assert(validation.validatePassword('NoNumber') === false, 'Password without number rejected');
assert(validation.validatePassword('nonumber123') === false, 'Password without uppercase rejected');

// Input sanitization tests
const sanitized = validation.sanitizeInput('<script>alert("xss")</script>');
assert(!sanitized.includes('<script>'), 'XSS tags sanitized');

// Formatting tests
const user = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  password: 'secret'
};
const formatted = formatting.formatUserResponse(user);
assert(formatted.password === undefined, 'Password removed from response');
assert(formatted.displayName === 'Test User', 'Display name added');

// Text truncation
const long = 'a'.repeat(150);
const truncated = formatting.truncateText(long, 100);
assert(truncated.length === 100, 'Text truncated to correct length');
assert(truncated.endsWith('...'), 'Truncated text has ellipsis');

// Helper function tests
assert(helpers.toTitleCase('hello world') === 'Hello World', 'Title case conversion works');
assert(helpers.isEmpty({}) === true, 'Empty object detected');
assert(helpers.isEmpty({a: 1}) === false, 'Non-empty object detected');

const cloned = helpers.deepClone({a: 1, b: {c: 2}});
assert(cloned.b.c === 2, 'Deep clone preserves nested values');

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}\n`);

process.exit(testsFailed > 0 ? 1 : 0);
