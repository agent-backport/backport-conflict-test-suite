/**
 * Admin API endpoints (v2.0)
 * Requires v2.0 authentication features
 */

const { hashPasswordV2 } = require('./auth');
const { getUserById, updateUser } = require('./users');

/**
 * Reset user password (admin function)
 * @param {number} userId - User ID
 * @param {string} newPassword - New password
 * @returns {Object} Updated user
 */
function resetUserPassword(userId, newPassword) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Use v2.0 password hashing
  const hashedPassword = hashPasswordV2(newPassword);

  updateUser(userId, {
    passwordHash: hashedPassword,
    passwordResetAt: new Date().toISOString(),
    requirePasswordChange: true
  });

  return getUserById(userId);
}

/**
 * Bulk update user roles (admin function)
 * @param {Array} userIds - Array of user IDs
 * @param {string} role - New role to assign
 * @returns {Array} Updated users
 */
function bulkUpdateRoles(userIds, role) {
  const validRoles = ['user', 'moderator', 'admin'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  return userIds.map(userId => {
    const user = getUserById(userId);
    if (user) {
      updateUser(userId, { role, roleUpdatedAt: new Date().toISOString() });
      return getUserById(userId);
    }
    return null;
  }).filter(Boolean);
}

module.exports = {
  resetUserPassword,
  bulkUpdateRoles
};
