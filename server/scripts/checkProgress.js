const fs = require('fs');
const path = require('path');

// Check validation progress
function checkProgress() {
  try {
    const jsonPath = path.join(__dirname, '../../combined_ideas.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const ideas = data.ideas || [];
    const total = ideas.length;
    
    // Count validated ideas
    const validated = ideas.filter(idea => 
      idea.validation && idea.saturation
    ).length;
    
    // Count ideas with validation status
    const verified = ideas.filter(idea => 
      idea.validation?.status === 'verified'
    ).length;
    
    const unverified = ideas.filter(idea => 
      idea.validation?.status === 'unverified'
    ).length;
    
    const pending = ideas.filter(idea => 
      idea.validation?.status === 'pending'
    ).length;
    
    // Get saturation distribution
    const highSaturation = ideas.filter(idea => 
      idea.saturation?.level === 'high'
    ).length;
    
    const mediumSaturation = ideas.filter(idea => 
      idea.saturation?.level === 'medium'
    ).length;
    
    const lowSaturation = ideas.filter(idea => 
      idea.saturation?.level === 'low'
    ).length;
    
    // Get validation metadata
    const validationMeta = data.metadata?.validation || {};
    
    // Calculate progress
    const progress = total > 0 ? (validated / total) * 100 : 0;
    const remaining = total - validated;
    
    // Display progress
    console.log('\n📊 Validation Progress Report\n');
    console.log('═'.repeat(60));
    console.log(`Total Ideas:        ${total.toLocaleString()}`);
    console.log(`Validated:          ${validated.toLocaleString()} (${progress.toFixed(2)}%)`);
    console.log(`Remaining:           ${remaining.toLocaleString()}`);
    console.log('─'.repeat(60));
    console.log('\n📈 Validation Status:');
    console.log(`   ✅ Verified:       ${verified.toLocaleString()}`);
    console.log(`   ⚠️  Pending:       ${pending.toLocaleString()}`);
    console.log(`   ❌ Unverified:     ${unverified.toLocaleString()}`);
    console.log('\n📊 Saturation Levels:');
    console.log(`   🔴 High:           ${highSaturation.toLocaleString()}`);
    console.log(`   🟡 Medium:         ${mediumSaturation.toLocaleString()}`);
    console.log(`   🟢 Low:            ${lowSaturation.toLocaleString()}`);
    
    if (validationMeta.processed) {
      console.log('\n⏱️  Last Updated:');
      console.log(`   ${new Date(validationMeta.processed).toLocaleString()}`);
      console.log(`   Processed: ${validationMeta.validatedIdeas || 0} ideas`);
      console.log(`   Skipped: ${validationMeta.skippedIdeas || 0} ideas`);
      console.log(`   Errors: ${validationMeta.errors || 0}`);
    }
    
    // Show progress bar
    const barLength = 50;
    const filled = Math.floor((progress / 100) * barLength);
    const empty = barLength - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    console.log('\n📊 Progress Bar:');
    console.log(`   [${bar}] ${progress.toFixed(2)}%`);
    console.log('═'.repeat(60));
    
    // Estimate time remaining (rough estimate)
    if (validated > 0 && validationMeta.processed) {
      const elapsed = Date.now() - new Date(validationMeta.processed).getTime();
      const rate = validated / (elapsed / 1000 / 60); // ideas per minute
      if (rate > 0) {
        const remainingMinutes = remaining / rate;
        console.log(`\n⏱️  Estimated time remaining: ~${Math.ceil(remainingMinutes)} minutes`);
        console.log(`   Rate: ~${Math.round(rate)} ideas/minute`);
      }
    }
    
    // Show sample of recent validations
    const recentValidated = ideas
      .filter(idea => idea.validation && idea.saturation)
      .slice(-5);
    
    if (recentValidated.length > 0) {
      console.log('\n📋 Recently Validated Ideas:');
      recentValidated.forEach((idea, idx) => {
        const name = (idea.name || idea.title || '').substring(0, 40);
        const status = idea.validation?.status || 'unknown';
        const competitors = idea.saturation?.competitorCount || 0;
        const level = idea.saturation?.level || 'unknown';
        console.log(`   ${idx + 1}. ${name.padEnd(45)} | ${status.padEnd(10)} | ${competitors} competitors | ${level}`);
      });
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error checking progress:', error.message);
  }
}

// Run check
checkProgress();

