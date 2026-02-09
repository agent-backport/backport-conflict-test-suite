/**
 * API tests
 */

const userApi = require('../src/api/users');
const postApi = require('../src/api/posts');
const auth = require('../src/api/auth');

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

console.log('\n=== Running API Tests ===\n');

// Test user creation
try {
  const user = userApi.createUser({
    email: 'test@example.com',
    password: 'SecurePass123',
    name: 'Test User'
  });
  assert(user.id === 1, 'User created with correct ID');
  assert(user.email === 'test@example.com', 'User has correct email');
  assert(user.displayName === 'Test User', 'User has display name');
} catch (error) {
  assert(false, `User creation failed: ${error.message}`);
}

// Test invalid email
try {
  userApi.createUser({
    email: 'invalid-email',
    password: 'SecurePass123',
    name: 'Test'
  });
  assert(false, 'Should reject invalid email');
} catch (error) {
  assert(true, 'Invalid email rejected correctly');
}

// Test weak password
try {
  userApi.createUser({
    email: 'test2@example.com',
    password: 'weak',
    name: 'Test'
  });
  assert(false, 'Should reject weak password');
} catch (error) {
  assert(true, 'Weak password rejected correctly');
}

// Test post creation
try {
  const post = postApi.createPost({
    title: 'Test Post',
    content: 'Test content',
    authorId: 1
  });
  assert(post.id === 1, 'Post created with correct ID');
  assert(post.published === false, 'Post is unpublished by default');
} catch (error) {
  assert(false, `Post creation failed: ${error.message}`);
}

// Test post publishing
try {
  const published = postApi.publishPost(1);
  assert(published.published === true, 'Post published successfully');
  assert(published.publishedAt !== null, 'Post has published timestamp');
} catch (error) {
  assert(false, `Post publishing failed: ${error.message}`);
}

// Test authentication
try {
  const token = auth.createSession(1);
  assert(token.length > 0, 'Session token created');

  const session = auth.validateSession(token);
  assert(session.userId === 1, 'Session validates correctly');

  const loggedOut = auth.logout(token);
  assert(loggedOut === true, 'Logout successful');

  const invalid = auth.validateSession(token);
  assert(invalid === null, 'Logged out session is invalid');
} catch (error) {
  assert(false, `Authentication test failed: ${error.message}`);
}

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}\n`);

process.exit(testsFailed > 0 ? 1 : 0);
