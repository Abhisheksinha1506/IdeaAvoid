const stringSimilarity = require('string-similarity');
const natural = require('natural');

// Calculate similarity between two ideas
function calculateSimilarity(idea1, idea2) {
  let score = 0;
  let weight = 0;

  // Name similarity (highest weight)
  if (idea1.name && idea2.name) {
    const nameScore = stringSimilarity.compareTwoStrings(
      idea1.name.toLowerCase(),
      idea2.name.toLowerCase()
    );
    score += nameScore * 0.4;
    weight += 0.4;
  }

  // Description similarity
  if (idea1.description && idea2.description) {
    const descScore = stringSimilarity.compareTwoStrings(
      idea1.description.toLowerCase(),
      idea2.description.toLowerCase()
    );
    score += descScore * 0.3;
    weight += 0.3;
  }

  // Tag overlap
  const tagScore = calculateTagOverlap(idea1.tags || [], idea2.tags || []);
  score += tagScore * 0.2;
  weight += 0.2;

  // Keyword matching
  const keywordScore = calculateKeywordMatch(idea1, idea2);
  score += keywordScore * 0.1;
  weight += 0.1;

  return weight > 0 ? score / weight : 0;
}

// Calculate tag overlap
function calculateTagOverlap(tags1, tags2) {
  if (tags1.length === 0 && tags2.length === 0) return 0;
  if (tags1.length === 0 || tags2.length === 0) return 0;

  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

// Calculate keyword match
function calculateKeywordMatch(idea1, idea2) {
  const text1 = `${idea1.name || ''} ${idea1.description || ''}`.toLowerCase();
  const text2 = `${idea2.name || ''} ${idea2.description || ''}`.toLowerCase();

  // Extract keywords using TF-IDF-like approach
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);

  if (keywords1.length === 0 && keywords2.length === 0) return 0;
  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Extract keywords from text
function extractKeywords(text) {
  // Remove stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
  ]);

  // Tokenize and filter
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text) || [];
  
  return tokens
    .filter(token => token.length >= 3 && !stopWords.has(token.toLowerCase()))
    .map(token => token.toLowerCase())
    .slice(0, 20); // Top 20 keywords
}

// Find similar ideas in database
function findSimilarIdeas(idea, allIdeas, limit = 10) {
  const ideaId = idea.id !== undefined ? idea.id : null;
  
  const similarities = allIdeas
    .map((otherIdea, index) => ({
      idea: otherIdea,
      otherIndex: index,
      score: calculateSimilarity(idea, otherIdea)
    }))
    .filter(result => {
      const otherId = result.idea.id !== undefined ? result.idea.id : (result.otherIndex + 1);
      return result.score > 0.3 && otherId !== ideaId;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return similarities.map(result => ({
    idea: result.idea,
    score: result.score
  }));
}

// Validate idea internally
function validateInternally(idea, allIdeas) {
  const similarIdeas = findSimilarIdeas(idea, allIdeas, 10);
  
  const similarCount = similarIdeas.length;
  const avgSimilarity = similarIdeas.length > 0
    ? similarIdeas.reduce((sum, s) => sum + s.score, 0) / similarIdeas.length
    : 0;

  return {
    source: 'internal_database',
    similarIdeas: similarCount,
    similarityScore: avgSimilarity,
    competitors: similarIdeas.slice(0, 5).map(s => ({
      name: s.idea.name || s.idea.title,
      score: s.score
    })),
    lastChecked: new Date().toISOString()
  };
}

module.exports = {
  calculateSimilarity,
  calculateTagOverlap,
  calculateKeywordMatch,
  findSimilarIdeas,
  validateInternally
};

