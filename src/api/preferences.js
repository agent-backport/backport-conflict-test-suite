/**
 * User preferences API (v2.0)
 * Manages user-specific settings and preferences
 */

const { getUserById } = require('./users');
const { validatePreferenceValue } = require('../utils/validation');
const { formatPreferences } = require('../utils/formatting');

const userPreferences = new Map();

/**
 * Get user preferences
 * @param {number} userId - User ID
 * @returns {Object} User preferences object
 */
function getPreferences(userId) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  return userPreferences.get(userId) || {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false
    }
  };
}

/**
 * Update user preferences
 * @param {number} userId - User ID
 * @param {Object} preferences - Preferences to update
 * @returns {Object} Updated preferences
 */
function updatePreferences(userId, preferences) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const current = getPreferences(userId);

  // Validate each preference value
  for (const [key, value] of Object.entries(preferences)) {
    if (!validatePreferenceValue(key, value)) {
      throw new Error(`Invalid preference value for ${key}`);
    }
  }

  const updated = { ...current, ...preferences };
  userPreferences.set(userId, updated);

  return formatPreferences(updated);
}

/**
 * Reset preferences to defaults
 * @param {number} userId - User ID
 * @returns {Object} Default preferences
 */
function resetPreferences(userId) {
  userPreferences.delete(userId);
  return getPreferences(userId);
}

module.exports = {
  getPreferences,
  updatePreferences,
  resetPreferences
};
