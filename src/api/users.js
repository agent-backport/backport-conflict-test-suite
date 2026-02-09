const { validateEmail, validatePassword } = require('../utils/validation');
const { formatUserResponse } = require('../utils/formatting');

/**
 * User API endpoints
 * Handles user creation, retrieval, and management
 */

const users = new Map();
let nextId = 1;

/**
 * Create a new user
 * @param {Object} userData - User data including email and password
 * @returns {Object} Created user object
 */
function createUser(userData) {
  const { email, password, name } = userData;

  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 12 characters with uppercase, lowercase, and number');
  }

  const user = {
    id: nextId++,
    email,
    name,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  users.set(user.id, user);
  return formatUserResponse(user);
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Object|null} User object or null if not found
 */
function getUserById(id) {
  const user = users.get(id);
  return user ? formatUserResponse(user) : null;
}

/**
 * Update user information
 * @param {number} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated user or null if not found
 */
function updateUser(id, updates) {
  const user = users.get(id);
  if (!user) return null;

  const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
  users.set(id, updatedUser);
  return formatUserResponse(updatedUser);
}

/**
 * Delete user by ID
 * @param {number} id - User ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteUser(id) {
  return users.delete(id);
}

/**
 * List all users with optional filtering
 * @param {Object} filters - Filter criteria
 * @returns {Array} Array of user objects
 */
function listUsers(filters = {}) {
  let userList = Array.from(users.values());

  if (filters.status) {
    userList = userList.filter(u => u.status === filters.status);
  }

  // v2.0: Add preferences to user listing if requested
  if (filters.includePreferences) {
    const { getPreferences } = require('./preferences');
    userList = userList.map(u => ({
      ...formatUserResponse(u),
      preferences: getPreferences(u.id)
    }));
    return userList;
  }

  return userList.map(formatUserResponse);
}

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  listUsers
};
