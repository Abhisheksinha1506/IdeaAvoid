const NodeCache = require('node-cache');

// Create cache instances
const validationCache = new NodeCache({ stdTTL: 86400 }); // 24 hours
const searchCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

// Get from cache
function get(key, cacheType = 'validation') {
  const cache = cacheType === 'validation' ? validationCache : searchCache;
  return cache.get(key);
}

// Set in cache
function set(key, value, ttl = null, cacheType = 'validation') {
  const cache = cacheType === 'validation' ? validationCache : searchCache;
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

// Delete from cache
function del(key, cacheType = 'validation') {
  const cache = cacheType === 'validation' ? validationCache : searchCache;
  cache.del(key);
}

// Clear all cache
function clear(cacheType = 'all') {
  if (cacheType === 'all' || cacheType === 'validation') {
    validationCache.flushAll();
  }
  if (cacheType === 'all' || cacheType === 'search') {
    searchCache.flushAll();
  }
}

// Get cache stats
function getStats(cacheType = 'all') {
  const stats = {};
  if (cacheType === 'all' || cacheType === 'validation') {
    stats.validation = validationCache.getStats();
  }
  if (cacheType === 'all' || cacheType === 'search') {
    stats.search = searchCache.getStats();
  }
  return stats;
}

module.exports = {
  get,
  set,
  del,
  clear,
  getStats
};

