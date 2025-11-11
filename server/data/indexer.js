const natural = require('natural');

// Build full-text search index
function buildSearchIndex(ideas) {
  const index = {
    byId: new Map(),
    byTag: new Map(),
    byCategory: new Map(),
    searchIndex: []
  };

  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  ideas.forEach((idea, idx) => {
    // Index by ID
    index.byId.set(idea.id || idx + 1, idea);

    // Index by tags
    if (idea.tags && Array.isArray(idea.tags)) {
      idea.tags.forEach(tag => {
        if (!index.byTag.has(tag)) {
          index.byTag.set(tag, []);
        }
        index.byTag.get(tag).push(idea);
      });
    }

    // Index by category
    if (idea.category) {
      if (!index.byCategory.has(idea.category)) {
        index.byCategory.set(idea.category, []);
      }
      index.byCategory.get(idea.category).push(idea);
    }

    // Build searchable text
    const searchText = [
      idea.name || '',
      idea.title || '',
      idea.description || '',
      (idea.tags || []).join(' '),
      (idea.painPoints || []).join(' ')
    ].join(' ').toLowerCase();

    // Add to TF-IDF
    tfidf.addDocument(searchText);

    // Store in search index
    index.searchIndex.push({
      id: idea.id || idx + 1,
      text: searchText,
      idea: idea
    });
  });

  return {
    index: index,
    tfidf: tfidf
  };
}

// Search using TF-IDF
function search(searchQuery, searchIndex, tfidf, limit = 10) {
  const query = searchQuery.toLowerCase();
  const scores = [];

  searchIndex.searchIndex.forEach((item, idx) => {
    const score = tfidf.tfidf(query, idx);
    if (score > 0) {
      scores.push({
        idea: item.idea,
        score: score
      });
    }
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.idea);
}

module.exports = {
  buildSearchIndex,
  search
};

