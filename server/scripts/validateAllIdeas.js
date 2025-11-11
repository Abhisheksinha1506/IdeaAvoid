require('dotenv').config();
const fs = require('fs');
const path = require('path');
const validationService = require('../services/validationService');
const ideasService = require('../data/ideasService');

// Configuration
const BATCH_SIZE = 100; // Process 100 ideas at a time (internal validation is fast)
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches
const SAMPLE_MODE = process.argv.includes('--sample');
const SAMPLE_SIZE = 5;
const SKIP_EXISTING = process.argv.includes('--skip-existing'); // Skip ideas that already have validation
const INTERNAL_ONLY = process.argv.includes('--internal-only'); // Only use internal validation (no Google)

// Load ideas
console.log('📊 Loading ideas from combined_ideas.json...');
const data = ideasService.loadIdeas();
const allIdeas = data.ideas;

console.log(`📊 Total ideas: ${allIdeas.length}`);
if (SAMPLE_MODE) {
  console.log(`🧪 Running in SAMPLE MODE (processing first ${SAMPLE_SIZE} ideas)`);
} else {
  console.log(`🚀 Starting validation for ALL ideas...`);
  if (INTERNAL_ONLY) {
    console.log(`⚡ Using INTERNAL validation only (fast, no Google search)`);
    const estimatedMinutes = Math.ceil(allIdeas.length / BATCH_SIZE * DELAY_BETWEEN_BATCHES / 1000 / 60);
    console.log(`⏱️  Estimated time: ~${estimatedMinutes} minutes`);
  } else {
    console.log(`⚠️  Using FULL validation (internal + Google search)`);
    console.log(`⚠️  This will take a VERY long time! Estimated: ${Math.ceil(allIdeas.length / BATCH_SIZE * DELAY_BETWEEN_BATCHES / 1000 / 60 / 60)} hours`);
    console.log(`💡 Tip: Use --internal-only for faster validation`);
  }
}
if (SKIP_EXISTING) {
  console.log(`⏭️  Skipping ideas that already have validation data`);
}
console.log(`\n`);

// Process ideas
const ideasToProcess = SAMPLE_MODE ? allIdeas.slice(0, SAMPLE_SIZE) : allIdeas;
let processed = 0;
let validated = 0;
let skipped = 0;
let errors = 0;

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Validate single idea
async function validateIdea(idea, index) {
  try {
    // Skip if already validated and SKIP_EXISTING is true
    if (SKIP_EXISTING && idea.validation && idea.saturation) {
      skipped++;
      return idea;
    }

    console.log(`[${index + 1}/${ideasToProcess.length}] Validating: ${(idea.name || idea.title || '').substring(0, 50)}...`);
    
    // Perform validation
    // If internal-only mode, temporarily disable Google search
    const originalGoogleEnabled = process.env.GOOGLE_SEARCH_ENABLED;
    if (INTERNAL_ONLY) {
      process.env.GOOGLE_SEARCH_ENABLED = 'false';
    }
    
    const result = await validationService.validateIdea(idea);
    
    // Restore original setting
    if (INTERNAL_ONLY) {
      process.env.GOOGLE_SEARCH_ENABLED = originalGoogleEnabled;
    }
    
    // Update idea with validation and saturation data
    const updatedIdea = {
      ...idea,
      validation: result.validation,
      saturation: result.saturation
    };
    
    validated++;
    console.log(`  ✅ Validated: ${result.validation.status}, ${result.saturation.competitorCount} competitors, ${result.saturation.level} saturation`);
    
    return updatedIdea;
  } catch (error) {
    console.error(`  ❌ Error validating idea ${index}:`, error.message);
    errors++;
    return idea; // Return original idea if validation fails
  }
}

// Process batch
async function processBatch(startIndex, endIndex) {
  const batch = ideasToProcess.slice(startIndex, endIndex);
  const validatedBatch = await Promise.all(
    batch.map((idea, idx) => validateIdea(idea, startIndex + idx))
  );

  // Update ideas in data
  validatedBatch.forEach((validatedIdea, idx) => {
    const originalIndex = startIndex + idx;
    allIdeas[originalIndex] = validatedIdea;
  });

  processed += batch.length;

  // Save progress periodically (every batch)
  if (!SAMPLE_MODE) {
    // Update metadata with current progress
    data.metadata.validation = {
      processed: new Date().toISOString(),
      totalIdeas: processed,
      validatedIdeas: validated,
      skippedIdeas: skipped,
      errors: errors,
      sampleMode: SAMPLE_MODE,
      inProgress: true
    };
    
    // Save progress to file
    const jsonPath = path.join(__dirname, '../../combined_ideas.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  }

  if (SAMPLE_MODE || processed % BATCH_SIZE === 0) {
    const progress = ((processed / ideasToProcess.length) * 100).toFixed(2);
    console.log(`\n📊 Progress: ${processed}/${ideasToProcess.length} (${progress}%) - ${validated} validated, ${skipped} skipped, ${errors} errors\n`);
  }
}

// Main function
async function main() {
  const startTime = Date.now();

  // Process in batches with delays
  for (let i = 0; i < ideasToProcess.length; i += BATCH_SIZE) {
    const endIndex = Math.min(i + BATCH_SIZE, ideasToProcess.length);
    await processBatch(i, endIndex);
    
    // Delay between batches (except for the last batch)
    if (endIndex < ideasToProcess.length) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...\n`);
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  // Update metadata (mark as complete)
  data.metadata.validation = {
    processed: new Date().toISOString(),
    totalIdeas: processed,
    validatedIdeas: validated,
    skippedIdeas: skipped,
    errors: errors,
    sampleMode: SAMPLE_MODE,
    inProgress: false,
    completed: true
  };

  // Save updated data
  if (!SAMPLE_MODE) {
    const jsonPath = path.join(__dirname, '../../combined_ideas.json');
    console.log(`\n💾 Saving updated data to ${jsonPath}...`);
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`\n✅ Validation complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Total ideas processed: ${processed}`);
    console.log(`   - Ideas validated: ${validated}`);
    console.log(`   - Ideas skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);
    console.log(`   - Time taken: ${((Date.now() - startTime) / 1000 / 60).toFixed(2)} minutes`);
    console.log(`\n💾 Updated file: ${jsonPath}`);
  } else {
    console.log(`\n📊 Sample Results Summary:`);
    console.log(`   - Ideas processed: ${processed}`);
    console.log(`   - Ideas validated: ${validated}`);
    console.log(`   - Ideas skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);
    console.log(`\n💡 Review the results above. If they look good, run without --sample to process all ${allIdeas.length} ideas.`);
    console.log(`💡 Use --skip-existing to skip ideas that already have validation data.`);
  }
}

// Handle errors
main().catch(error => {
  console.error('❌ Error during validation:', error);
  process.exit(1);
});

