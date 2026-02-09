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
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate ID format (numeric string)
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ID format
 */
function validateId(id) {
  return /^\d+$/.test(id);
}

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateId
};
