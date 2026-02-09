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

/**
 * Format phone number for display (v1.0)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Format preferences object (v2.0)
 * @param {Object} preferences - User preferences
 * @returns {Object} Formatted preferences with metadata
 */
function formatPreferences(preferences) {
  return {
    ...preferences,
    lastUpdated: new Date().toISOString(),
    version: '2.0'
  };
}

module.exports = {
  formatUserResponse,
  formatDate,
  formatError,
  truncateText,
  formatPhoneNumber,
  formatPreferences
};
