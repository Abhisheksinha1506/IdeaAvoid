const validationAggregator = require('./validationAggregator');
const cacheService = require('./cacheService');

// Validate idea with caching
async function validateIdea(idea) {
  // Check cache first
  const cacheKey = `validation_${idea.id || idea.name || idea.title}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Perform validation
  const result = await validationAggregator.validateIdea(idea);

  // Cache result
  cacheService.set(cacheKey, result, 86400); // Cache for 24 hours

  return result;
}

// Validate idea without cache (force refresh)
async function validateIdeaFresh(idea) {
  // Clear cache for this idea before validating
  const cacheKey = `validation_${idea.id || idea.name || idea.title}`;
  cacheService.del(cacheKey);
  
  // Also clear Google cache
  const googleCacheKey = `google_${idea.name || idea.title || idea.description}`;
  const googleValidator = require('./googleValidator');
  if (googleValidator.clearCache) {
    googleValidator.clearCache(googleCacheKey);
  }
  
  // Set flag to bypass Google cache
  process.env.FORCE_REFRESH = 'true';
  
  try {
    const result = await validationAggregator.validateIdea(idea);
    return result;
  } finally {
    // Clean up flag
    delete process.env.FORCE_REFRESH;
  }
}

module.exports = {
  validateIdea,
  validateIdeaFresh
};

