const internalValidator = require('./internalValidator');
const googleValidator = require('./googleValidator');
const saturationCalculator = require('./saturationCalculator');
const ideasService = require('../data/ideasService');

// Aggregate validation results from all sources
async function aggregateValidation(idea, allIdeas) {
  const results = {
    sources: [],
    aggregatedScore: null,
    status: 'pending'
  };

  // Internal validation (can be disabled via INTERNAL_VALIDATION_ENABLED=false)
  if (process.env.INTERNAL_VALIDATION_ENABLED !== 'false') {
    try {
      const internalResult = internalValidator.validateInternally(idea, allIdeas);
      results.sources.push(internalResult);
    } catch (error) {
      console.error('Error in internal validation:', error);
    }
  } else {
    console.log('ℹ️ Internal validation disabled via INTERNAL_VALIDATION_ENABLED=false');
  }

  // Google validation (if enabled)
  if (process.env.GOOGLE_SEARCH_ENABLED !== 'false') {
    try {
      console.log(`🔍 Running Google validation for: ${idea.name || idea.title || 'Unknown'}`);
      // Check if this is a force refresh (bypass cache)
      const bypassCache = process.env.FORCE_REFRESH === 'true';
      const googleResult = await googleValidator.validateWithGoogle(idea, bypassCache);
      console.log(`✅ Google validation result:`, {
        enabled: googleResult.enabled,
        competitorCount: googleResult.competitorCount,
        totalResults: googleResult.totalResults,
        hasError: !!googleResult.error
      });
      if (googleResult.enabled !== false) {
        results.sources.push(googleResult);
      } else {
        console.warn('⚠️ Google validation returned enabled=false, skipping');
      }
    } catch (error) {
      console.error('❌ Error in Google validation:', error);
      console.error('Error stack:', error.stack);
    }
  } else {
    console.log('ℹ️ Google validation disabled via GOOGLE_SEARCH_ENABLED=false');
  }

  // Calculate aggregated score
  results.aggregatedScore = calculateAggregatedScore(results.sources);

  // Determine validation status
  results.status = determineStatus(results.aggregatedScore);

  // Calculate saturation metrics
  const saturation = saturationCalculator.calculateSaturation(
    results.aggregatedScore,
    results.sources
  );

  return {
    validation: results,
    saturation: saturation
  };
}

// Calculate aggregated score from all sources
function calculateAggregatedScore(sources) {
  if (sources.length === 0) {
    return {
      totalCompetitors: 0,
      confidence: 0,
      sourcesCount: 0
    };
  }

  let totalCompetitors = 0;
  let totalSimilarity = 0;
  let similarityCount = 0;
  let confidence = 0;

  sources.forEach(source => {
    if (source.source === 'internal_database') {
      totalCompetitors += source.similarIdeas || 0;
      if (source.similarityScore) {
        totalSimilarity += source.similarityScore;
        similarityCount++;
      }
      confidence += 0.3; // Internal validation has lower confidence
    } else if (source.source === 'google') {
      totalCompetitors += source.competitorCount || 0;
      confidence += 0.7; // Google validation has higher confidence
    }
  });

  const avgSimilarity = similarityCount > 0 ? totalSimilarity / similarityCount : 0;
  confidence = Math.min(confidence, 1.0);

  return {
    totalCompetitors: totalCompetitors,
    avgSimilarity: avgSimilarity,
    confidence: confidence,
    sourcesCount: sources.length
  };
}

// Determine validation status
function determineStatus(aggregatedScore) {
  if (aggregatedScore.totalCompetitors === 0) {
    return 'unverified';
  } else if (aggregatedScore.totalCompetitors > 0 && aggregatedScore.confidence > 0.5) {
    return 'verified';
  } else {
    return 'pending';
  }
}

// Validate single idea
async function validateIdea(idea) {
  // Load all ideas for internal validation (if available)
  let allIdeas = [];
  try {
    if (ideasService) {
      const data = ideasService.loadIdeas();
      allIdeas = data.ideas || [];
    }
  } catch (error) {
    console.warn('⚠️  Could not load ideas for internal validation:', error.message);
    // Continue with empty array - will only use Google validation
  }
  
  // Aggregate validation from all sources
  const result = await aggregateValidation(idea, allIdeas);
  
  return result;
}

module.exports = {
  aggregateValidation,
  calculateAggregatedScore,
  determineStatus,
  validateIdea
};

