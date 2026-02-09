/**
 * Data formatting utilities
 */

/**
 * Format user object for API response
 * Removes sensitive fields
 * @param {Object} user - User object
 * @returns {Object} Formatted user object
 */
function formatUserResponse(user) {
  const { password, ...publicData } = user;
  return {
    ...publicData,
    displayName: user.name || user.email.split('@')[0]
  };
}

/**
 * Format date to ISO string
 * @param {Date} date - Date object
 * @returns {string} ISO formatted date string
 */
function formatDate(date) {
  return date.toISOString();
}

/**
 * Format error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
function formatError(error) {
  return {
    error: true,
    message: error.message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

module.exports = {
  formatUserResponse,
  formatDate,
  formatError,
  truncateText
};
