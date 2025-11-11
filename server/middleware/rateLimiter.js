const NodeCache = require('node-cache');

// Rate limiter cache (1 hour TTL)
const rateLimitCache = new NodeCache({ stdTTL: 3600 });

// Rate limiter middleware
function rateLimiter(options = {}) {
  const {
    windowMs = 60 * 60 * 1000, // 1 hour
    maxRequests = 100,
    message = 'Too many requests, please try again later'
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Get current request count
    const requests = rateLimitCache.get(key) || { count: 0, resetTime: now + windowMs };
    
    // Reset if window expired
    if (now > requests.resetTime) {
      requests.count = 0;
      requests.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (requests.count >= maxRequests) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((requests.resetTime - now) / 1000)
      });
    }
    
    // Increment count
    requests.count++;
    rateLimitCache.set(key, requests);
    
    // Add headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requests.count));
    res.setHeader('X-RateLimit-Reset', new Date(requests.resetTime).toISOString());
    
    next();
  };
}

module.exports = rateLimiter;

