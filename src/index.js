/**
 * Main application entry point
 */

const userApi = require('./api/users');
const postApi = require('./api/posts');
const auth = require('./api/auth');
const { getDatabaseConfig } = require('./config/database');

console.log('Backport Conflict Test Suite - v1.0');
console.log('Database config:', getDatabaseConfig());

/**
 * Initialize application
 */
function initialize() {
  console.log('Application initialized successfully');
  return {
    userApi,
    postApi,
    auth
  };
}

/**
 * Run sample operations
 */
function runSample() {
  try {
    // Create a sample user
    const user = userApi.createUser({
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'Test User'
    });
    console.log('Created user:', user);

    // Create a sample post
    const post = postApi.createPost({
      title: 'Sample Post',
      content: 'This is a sample post content',
      authorId: user.id
    });
    console.log('Created post:', post);

    // Create session
    const token = auth.createSession(user.id);
    console.log('Session token:', token.substring(0, 10) + '...');

  } catch (error) {
    console.error('Error running sample:', error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  const app = initialize();
  runSample();
}

module.exports = { initialize };
