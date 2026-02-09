/**
 * Simple rate limiting middleware (v1.0 implementation)
 * Fixed window counter approach
 */

const requestCounts = new Map();

/**
 * Simple fixed window rate limiter
 * @param {string} userId - User identifier
 * @returns {boolean} Whether request is allowed
 */
function checkRateLimit(userId) {
  const now = Date.now();
  const windowStart = Math.floor(now / 60000) * 60000; // 1 minute windows
  const key = `${userId}:${windowStart}`;

  const count = requestCounts.get(key) || 0;

  if (count >= 50) { // 50 requests per minute for v1.0
    return false;
  }

  requestCounts.set(key, count + 1);

  // Cleanup old entries
  for (const [k] of requestCounts) {
    const [, timestamp] = k.split(':');
    if (parseInt(timestamp) < now - 120000) { // 2 minutes old
      requestCounts.delete(k);
    }
  }

  return true;
}

/**
 * Get current request count
 * @param {string} userId - User identifier
 * @returns {number} Request count in current window
 */
function getRequestCount(userId) {
  const now = Date.now();
  const windowStart = Math.floor(now / 60000) * 60000;
  const key = `${userId}:${windowStart}`;
  return requestCounts.get(key) || 0;
}

module.exports = {
  checkRateLimit,
  getRequestCount
};
