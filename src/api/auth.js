const crypto = require('crypto');

/**
 * Authentication utilities
 * Handles password hashing and session management
 */

const sessions = new Map();

/**
 * Hash password using SHA-256 (v1 algorithm)
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + 'salt_v1')
    .digest('hex');
}

/**
 * Create authentication session
 * @param {number} userId - User ID
 * @returns {string} Session token
 */
function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  return token;
}

/**
 * Validate session token
 * @param {string} token - Session token
 * @returns {Object|null} Session data or null if invalid
 */
function validateSession(token) {
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session;
}

/**
 * Invalidate session
 * @param {string} token - Session token
 * @returns {boolean} True if session was deleted
 */
function logout(token) {
  return sessions.delete(token);
}

module.exports = {
  hashPassword,
  createSession,
  validateSession,
  logout
};
