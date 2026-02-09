/**
 * Input validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (v2.0 requirements)
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
function validatePassword(password) {
  // v2.0: Minimum 12 characters, must contain uppercase, lowercase, and number
  if (password.length < 12) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate numeric ID
 * @param {any} id - ID to validate
 * @returns {boolean} True if valid numeric ID
 */
function validateId(id) {
  return Number.isInteger(id) && id > 0;
}

/**
 * Validate preference value (v2.0)
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 * @returns {boolean} True if valid
 */
function validatePreferenceValue(key, value) {
  const validThemes = ['light', 'dark', 'auto'];
  const validLanguages = ['en', 'es', 'fr', 'de', 'ja'];

  if (key === 'theme') {
    return validThemes.includes(value);
  }

  if (key === 'language') {
    return validLanguages.includes(value);
  }

  if (key === 'notifications' || key === 'privacy') {
    return typeof value === 'object' && value !== null;
  }

  return true;
}

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateId,
  validatePreferenceValue
};
