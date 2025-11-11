const fs = require('fs');
const path = require('path');
const ideasService = require('../data/ideasService');
const validationAggregator = require('../services/validationAggregator');
const internalValidator = require('../services/internalValidator');

// Configuration
const BATCH_SIZE = 100;
const SAMPLE_MODE = process.argv.includes('--sample');
const SAMPLE_SIZE = 10;

// Load ideas
const data = ideasService.loadIdeas();
const allIdeas = data.ideas;

console.log(`📊 Total ideas to process: ${allIdeas.length}`);
if (SAMPLE_MODE) {
  console.log(`🧪 Running in SAMPLE MODE (processing first ${SAMPLE_SIZE} ideas)`);
} else {
  console.log(`🚀 Starting enrichment for ALL ideas...`);
}
console.log(`\n`);

// Process ideas
const ideasToProcess = SAMPLE_MODE ? allIdeas.slice(0, SAMPLE_SIZE) : allIdeas;
let processed = 0;
let enriched = 0;

async function enrichIdea(idea, index) {
  try {
    // Skip if already enriched
    if (idea.saturation && idea.validation) {
      return idea;
    }

    // Perform internal validation
    const internalResult = internalValidator.validateInternally(idea, allIdeas);

    // Calculate saturation from internal validation
    const saturationCalculator = require('../services/saturationCalculator');
    const saturation = saturationCalculator.calculateFromSources([internalResult]);

    // Create validation object
    const validation = {
      status: internalResult.similarIdeas > 0 ? 'verified' : 'unverified',
      sources: [internalResult],
      aggregatedScore: {
        totalCompetitors: internalResult.similarIdeas || 0,
        avgSimilarity: internalResult.similarityScore || 0,
        confidence: 0.3, // Internal validation has lower confidence
        sourcesCount: 1
      }
    };

    // Determine category if not present
    let category = idea.category;
    if (!category) {
      // Simple category detection based on tags
      const tags = (idea.tags || []).map(t => t.toLowerCase());
      if (tags.some(t => ['ai', 'saas', 'api', 'web', 'mobile', 'cloud'].includes(t))) {
        category = 'tech';
      } else if (tags.some(t => ['healthcare', 'health', 'medical'].includes(t))) {
        category = 'healthcare';
      } else if (tags.some(t => ['education', 'learning', 'course'].includes(t))) {
        category = 'education';
      } else if (tags.some(t => ['finance', 'financial', 'payment'].includes(t))) {
        category = 'finance';
      } else if (tags.some(t => ['e-commerce', 'ecommerce', 'retail'].includes(t))) {
        category = 'retail';
      } else if (tags.some(t => ['food', 'restaurant'].includes(t))) {
        category = 'food';
      } else if (tags.some(t => ['travel', 'trip'].includes(t))) {
        category = 'travel';
      } else if (tags.some(t => ['real estate', 'property'].includes(t))) {
        category = 'real-estate';
      } else if (tags.some(t => ['gaming', 'game'].includes(t))) {
        category = 'gaming';
      } else {
        category = 'other';
      }
    }

    // Update idea
    return {
      ...idea,
      category: category,
      saturation: saturation,
      validation: validation
    };
  } catch (error) {
    console.error(`Error enriching idea ${index}:`, error);
    return idea;
  }
}

async function processBatch(startIndex, endIndex) {
  const batch = ideasToProcess.slice(startIndex, endIndex);
  const enrichedBatch = await Promise.all(
    batch.map((idea, idx) => enrichIdea(idea, startIndex + idx))
  );

  // Update ideas in data
  enrichedBatch.forEach((enrichedIdea, idx) => {
    const originalIndex = startIndex + idx;
    if (SAMPLE_MODE) {
      allIdeas[originalIndex] = enrichedIdea;
    } else {
      allIdeas[originalIndex] = enrichedIdea;
    }
  });

  processed += batch.length;
  enriched += enrichedBatch.filter(idea => idea.saturation && idea.validation).length;

  if (SAMPLE_MODE || processed % BATCH_SIZE === 0) {
    console.log(`✅ Processed ${processed}/${ideasToProcess.length} ideas (${enriched} enriched)`);
  }
}

async function main() {
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < ideasToProcess.length; i += BATCH_SIZE) {
    const endIndex = Math.min(i + BATCH_SIZE, ideasToProcess.length);
    await processBatch(i, endIndex);
  }

  // Update metadata
  data.metadata.enrichment = {
    processed: new Date().toISOString(),
    totalIdeas: processed,
    enrichedIdeas: enriched,
    sampleMode: SAMPLE_MODE
  };

  // Save updated data
  if (!SAMPLE_MODE) {
    const jsonPath = path.join(__dirname, '../../combined_ideas.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n✅ Enrichment complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total ideas processed: ${processed}`);
    console.log(`   - Ideas enriched: ${enriched}`);
    console.log(`   - Time taken: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log(`\n💾 Updated file: ${jsonPath}`);
  } else {
    console.log(`\n📊 Sample Results Summary:`);
    console.log(`   - Ideas processed: ${processed}`);
    console.log(`   - Ideas enriched: ${enriched}`);
    console.log(`\n💡 Review the results above. If they look good, run without --sample to process all ${allIdeas.length} ideas.`);
  }
}

main().catch(error => {
  console.error('❌ Error during enrichment:', error);
  process.exit(1);
});

