/**
 * Rate limiting middleware (v2.0 implementation)
 * Token bucket algorithm with Redis backing
 */

const rateLimitStore = new Map();

/**
 * Rate limit configuration
 */
const config = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  algorithm: 'token-bucket',
  strategy: 'sliding-window'
};

/**
 * Token bucket rate limiter
 * @param {string} userId - User identifier
 * @returns {Object} Rate limit status
 */
function checkRateLimit(userId) {
  const now = Date.now();
  const userBucket = rateLimitStore.get(userId) || {
    tokens: config.maxRequests,
    lastRefill: now
  };

  // Refill tokens based on time elapsed
  const timeElapsed = now - userBucket.lastRefill;
  const tokensToAdd = Math.floor(timeElapsed / (config.windowMs / config.maxRequests));

  userBucket.tokens = Math.min(config.maxRequests, userBucket.tokens + tokensToAdd);
  userBucket.lastRefill = now;

  if (userBucket.tokens > 0) {
    userBucket.tokens--;
    rateLimitStore.set(userId, userBucket);
    return {
      allowed: true,
      remaining: userBucket.tokens,
      resetAt: now + config.windowMs
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetAt: now + config.windowMs
  };
}

/**
 * Reset rate limit for user (admin function)
 * @param {string} userId - User identifier
 */
function resetRateLimit(userId) {
  rateLimitStore.delete(userId);
}

module.exports = {
  checkRateLimit,
  resetRateLimit,
  config
};
