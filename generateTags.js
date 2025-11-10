const fs = require('fs');
const path = require('path');

// Configuration
const SAMPLE_MODE = process.argv.includes('--sample');
const SAMPLE_SIZE = 10;
const BATCH_SIZE = 100;

// Read the combined_ideas.json file
const jsonPath = path.join(__dirname, 'combined_ideas.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`📊 Total ideas in file: ${data.ideas.length}`);
if (SAMPLE_MODE) {
  console.log(`🧪 Running in SAMPLE MODE (processing first ${SAMPLE_SIZE} ideas)`);
} else {
  console.log(`🚀 Starting AI tag generation for ALL ideas...`);
}
console.log(`\n`);

// Enhanced AI-based tag generation function
function generateIntelligentTags(idea) {
  const { name, description, painPoints } = idea;
  
  // Combine all text for analysis
  const fullText = `${name} ${description} ${painPoints.join(' ')}`.toLowerCase();
  
  // Extract key terms from name (usually most important)
  const nameTerms = extractKeyTerms(name);
  
  // Extract key terms from description
  const descTerms = extractKeyTerms(description);
  
  // Extract key terms from pain points
  const painTerms = painPoints.flatMap(pp => extractKeyTerms(pp));
  
  // Combine all terms with weights (name is most important)
  const allTerms = [
    ...nameTerms.map(t => ({ term: t, weight: 3 })),
    ...descTerms.map(t => ({ term: t, weight: 2 })),
    ...painTerms.map(t => ({ term: t, weight: 1 }))
  ];
  
  // Score terms by frequency and importance
  const termScores = {};
  allTerms.forEach(({ term, weight }) => {
    termScores[term] = (termScores[term] || 0) + weight;
  });
  
  // Get top-scoring terms
  const topTerms = Object.entries(termScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);
  
  // Map to intelligent tags
  const tags = new Set();
  
  // First, check for specific technology/business categories
  const categoryTags = detectCategories(fullText, name, description);
  categoryTags.forEach(tag => tags.add(tag));
  
  // Extract domain-specific terms from name (most important, no numbers)
  const nameWords = name.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !isCommonWord(w) && !/\d/.test(w)); // Longer words are more meaningful, no numbers
  
  // Add key terms from name as tags (prioritize these, but skip generic ones)
  const meaningfulNameWords = nameWords.filter(w => 
    !['based', 'system', 'platform', 'tool', 'service', 'application', 'app', 'manager', 'tracker', 'analyzer', 'wizard'].includes(w)
  );
  
  for (const word of meaningfulNameWords.slice(0, 2)) {
    if (tags.size >= 5) break;
    if (isMeaningfulTerm(word) && !isCommonWord(word)) {
      const capitalized = capitalizeTerm(word);
      // Double-check: skip if contains numbers
      if (capitalized && !/\d/.test(capitalized) && !Array.from(tags).some(t => t.toLowerCase() === capitalized.toLowerCase())) {
        tags.add(capitalized);
      }
    }
  }
  
  // Then add domain-specific tags from top-scoring terms
  for (const term of topTerms) {
    if (tags.size >= 5) break;
    
    // Skip if it's already a category tag or too short
    if (term.length < 4) continue;
    
    // Skip common words
    if (isCommonWord(term)) continue;
    
    // Skip if it's part of a category tag we already have
    const termLower = term.toLowerCase();
    const hasSimilarTag = Array.from(tags).some(tag => 
      tag.toLowerCase().includes(termLower) || termLower.includes(tag.toLowerCase())
    );
    if (hasSimilarTag) continue;
    
    const capitalized = capitalizeTerm(term);
    // Double-check: skip if contains numbers
    if (capitalized && capitalized.length >= 4 && !/\d/.test(capitalized) && !tags.has(capitalized)) {
      tags.add(capitalized);
    }
  }
  
  // Ensure we have 3-5 tags by adding more from description if needed
  if (tags.size < 3) {
    const descWords = description.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 5 && !isCommonWord(w) && !/\d/.test(w));
    
    for (const word of descWords.slice(0, 5 - tags.size)) {
      if (tags.size >= 5) break;
      const capitalized = capitalizeTerm(word);
      // Double-check: skip if contains numbers
      if (capitalized && !/\d/.test(capitalized) && !Array.from(tags).some(t => t.toLowerCase() === capitalized.toLowerCase())) {
        tags.add(capitalized);
      }
    }
  }
  
  // Convert to sorted array and limit to 5
  return Array.from(tags).slice(0, 5).sort();
}

// Extract key terms from text
function extractKeyTerms(text) {
  if (!text) return [];
  
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
  ]);
  
  // Extract words (alphanumeric, at least 3 chars, no numbers)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word) && !/\d/.test(word));
  
  // Extract meaningful phrases (2-3 word combinations)
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i + 1]}`;
    if (twoWord.length >= 6) phrases.push(twoWord);
    if (i < words.length - 2) {
      const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (threeWord.length >= 9) phrases.push(threeWord);
    }
  }
  
  return [...words, ...phrases];
}

// Detect category tags based on content
function detectCategories(fullText, name, description) {
  const tags = new Set();
  
  // Technology categories
  if (matches(fullText, ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'deep learning', 'chatbot', 'nlp'])) {
    tags.add('AI');
  }
  if (matches(fullText, ['automate', 'automation', 'automatic', 'workflow'])) {
    tags.add('Automation');
  }
  if (matches(fullText, ['api', 'rest', 'graphql', 'integration', 'webhook'])) {
    tags.add('API');
  }
  if (matches(fullText, ['mobile', 'ios', 'android', 'app', 'smartphone', 'tablet'])) {
    tags.add('Mobile');
  }
  if (matches(fullText, ['web', 'website', 'browser', 'frontend', 'backend'])) {
    tags.add('Web');
  }
  if (matches(fullText, ['cloud', 'aws', 'azure', 'gcp', 's3', 'serverless'])) {
    tags.add('Cloud');
  }
  if (matches(fullText, ['database', 'sql', 'nosql', 'data storage'])) {
    tags.add('Database');
  }
  if (matches(fullText, ['security', 'encryption', 'authentication', 'cybersecurity', 'breach', 'hack'])) {
    tags.add('Security');
  }
  if (matches(fullText, ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'web3'])) {
    tags.add('Blockchain');
  }
  
  // Business categories
  if (matches(fullText, ['saas', 'software as a service', 'subscription'])) {
    tags.add('SaaS');
  }
  if (matches(fullText, ['ecommerce', 'e-commerce', 'online store', 'shopping', 'marketplace'])) {
    tags.add('E-Commerce');
  }
  if (matches(fullText, ['marketing', 'seo', 'sem', 'advertising', 'branding'])) {
    tags.add('Marketing');
  }
  if (matches(fullText, ['analytics', 'data analysis', 'insights', 'metrics', 'dashboard'])) {
    tags.add('Analytics');
  }
  if (matches(fullText, ['crm', 'customer relationship', 'sales'])) {
    tags.add('CRM');
  }
  
  // Industry categories
  if (matches(fullText, ['health', 'medical', 'patient', 'doctor', 'wellness', 'fitness'])) {
    tags.add('Healthcare');
  }
  if (matches(fullText, ['education', 'learning', 'course', 'training', 'student', 'teacher'])) {
    tags.add('Education');
  }
  if (matches(fullText, ['finance', 'financial', 'payment', 'banking', 'investment', 'trading'])) {
    tags.add('Finance');
  }
  if (matches(fullText, ['real estate', 'property', 'housing', 'rental'])) {
    tags.add('Real Estate');
  }
  if (matches(fullText, ['travel', 'trip', 'booking', 'hotel', 'flight'])) {
    tags.add('Travel');
  }
  if (matches(fullText, ['food', 'restaurant', 'recipe', 'cooking', 'dining'])) {
    tags.add('Food');
  }
  if (matches(fullText, ['game', 'gaming', 'player', 'entertainment'])) {
    tags.add('Gaming');
  }
  
  // Functionality categories
  if (matches(fullText, ['social', 'community', 'network', 'sharing'])) {
    tags.add('Social');
  }
  if (matches(fullText, ['communication', 'messaging', 'chat', 'email'])) {
    tags.add('Communication');
  }
  if (matches(fullText, ['productivity', 'task', 'project management', 'organization'])) {
    tags.add('Productivity');
  }
  if (matches(fullText, ['design', 'ui', 'ux', 'visual', 'graphic'])) {
    tags.add('Design');
  }
  if (matches(fullText, ['development', 'coding', 'programming', 'developer', 'devops'])) {
    tags.add('Development');
  }
  if (matches(fullText, ['content', 'blog', 'writing', 'publishing', 'media'])) {
    tags.add('Content');
  }
  
  // Platform/Type
  if (matches(fullText, ['platform', 'marketplace', 'ecosystem'])) {
    tags.add('Platform');
  }
  if (matches(fullText, ['tool', 'utility', 'helper', 'assistant'])) {
    tags.add('Tool');
  }
  
  // Specific technologies (only if explicitly mentioned, not as part of other words)
  if (/\b(linux|unix|gnome|kde|desktop environment)\b/.test(fullText)) {
    tags.add('Linux');
  }
  if (/\b(rust|rustlang)\b/.test(fullText) && !/\b(trust|rusty|rustic|crust|thrust)\b/.test(fullText)) {
    tags.add('Rust');
  }
  if (/\b(python|django|flask)\b/.test(fullText)) {
    tags.add('Python');
  }
  if (/\b(javascript|node\.?js|react|vue|angular)\b/.test(fullText)) {
    tags.add('JavaScript');
  }
  if (/\b(slack|workspace)\b/.test(fullText)) {
    tags.add('Slack');
  }
  if (/\b(aws|amazon web services|s3|cloudfront)\b/.test(fullText)) {
    tags.add('AWS');
  }
  
  return Array.from(tags);
}

// Helper function to check if text matches any keywords
function matches(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

// Capitalize term properly
function capitalizeTerm(term) {
  if (!term || term.length < 2) return null;
  
  // Skip terms with numeric values
  if (/\d/.test(term)) {
    return null;
  }
  
  // Handle acronyms (all caps, 2-4 chars)
  if (term.length <= 4 && term === term.toUpperCase() && /^[A-Z]+$/.test(term)) {
    return term;
  }
  
  // Handle hyphenated terms
  if (term.includes('-')) {
    return term.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join('-');
  }
  
  // Handle multi-word terms
  if (term.includes(' ')) {
    return term.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
  
  // Single word - capitalize first letter
  return term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
}

// Check if term is meaningful (not too common)
function isMeaningfulTerm(term) {
  if (term.length < 3) return false;
  
  // Check if it's a meaningful noun/adjective (basic heuristic)
  return /^[a-z]+$/.test(term) || term.includes(' ') || term.includes('-');
}

// Check if word is too common to be a tag
function isCommonWord(word) {
  const commonWords = new Set([
    'that', 'this', 'with', 'from', 'would', 'could', 'should', 'about', 'after', 'before',
    'during', 'through', 'under', 'over', 'above', 'below', 'between', 'among', 'within', 'without',
    'into', 'onto', 'upon', 'toward', 'towards', 'around', 'across', 'along', 'beside', 'beyond',
    'near', 'far', 'here', 'there', 'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whom',
    'user', 'users', 'system', 'systems', 'service', 'services', 'application', 'applications',
    'platform', 'platforms', 'tool', 'tools', 'software', 'website', 'websites', 'online', 'digital',
    'provide', 'provides', 'help', 'helps', 'allow', 'allows', 'enable', 'enables', 'create', 'creates',
    'manage', 'manages', 'track', 'tracks', 'monitor', 'monitors', 'analyze', 'analyzes', 'process', 'processes',
    'based', 'project', 'projects', 'solution', 'solutions', 'method', 'methods', 'way', 'ways', 'approach',
    'manager', 'tracker', 'analyzer', 'wizard', 'enhancer', 'generator', 'builder', 'creator', 'maker'
  ]);
  
  return commonWords.has(word.toLowerCase());
}

// Process ideas (sample mode or all)
const ideasToProcess = SAMPLE_MODE ? data.ideas.slice(0, SAMPLE_SIZE) : data.ideas;
const startIndex = 0;
const endIndex = SAMPLE_MODE ? SAMPLE_SIZE : data.ideas.length;

let processed = 0;
let totalTags = 0;
const sampleResults = [];

for (let i = startIndex; i < endIndex; i++) {
  const idea = data.ideas[i];
  const oldTags = [...(idea.tags || [])];
  const newTags = generateIntelligentTags(idea);
  
  // Replace existing tags
  data.ideas[i].tags = newTags;
  totalTags += newTags.length;
  
  // Store sample results for display
  if (SAMPLE_MODE && i < SAMPLE_SIZE) {
    sampleResults.push({
      name: idea.name,
      oldTags,
      newTags
    });
  }
  
  processed++;
  
  // Progress update every 1000 ideas (or every idea in sample mode)
  if (SAMPLE_MODE || processed % 1000 === 0) {
    if (SAMPLE_MODE) {
      console.log(`✅ [${processed}/${SAMPLE_SIZE}] ${idea.name.substring(0, 50)}...`);
      console.log(`   Old: [${oldTags.join(', ')}]`);
      console.log(`   New: [${newTags.join(', ')}]\n`);
    } else {
      console.log(`✅ Processed ${processed}/${data.ideas.length} ideas...`);
    }
  }
}

if (SAMPLE_MODE) {
  console.log(`\n📊 Sample Results Summary:`);
  console.log(`   - Ideas processed: ${processed}`);
  console.log(`   - Total tags generated: ${totalTags}`);
  console.log(`   - Average tags per idea: ${(totalTags / processed).toFixed(2)}`);
  console.log(`\n💡 Review the results above. If they look good, run without --sample to process all ${data.ideas.length} ideas.`);
} else {
  // Update metadata
  data.metadata.tagProcessing = {
    processed: new Date().toISOString(),
    aiTagsGenerated: processed,
    totalTags: totalTags,
    averageTagsPerIdea: (totalTags / processed).toFixed(2),
    minTagCount: 3,
    maxTagCount: 5
  };
  
  // Write updated JSON
  const outputPath = path.join(__dirname, 'combined_ideas.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`\n✅ Completed!`);
  console.log(`📊 Statistics:`);
  console.log(`   - Total ideas processed: ${processed}`);
  console.log(`   - Total tags generated: ${totalTags}`);
  console.log(`   - Average tags per idea: ${(totalTags / processed).toFixed(2)}`);
  console.log(`\n💾 Updated file: ${outputPath}`);
}

