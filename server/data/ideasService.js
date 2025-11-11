const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

// Cache for 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

let ideasData = null;
let ideasIndex = null;

// Load ideas from JSON file
function loadIdeas() {
  if (ideasData) {
    return ideasData;
  }

  try {
    // Try root combined_ideas.json first, then public/combined_ideas.json
    let jsonPath = path.join(__dirname, '../../combined_ideas.json');
    if (!fs.existsSync(jsonPath)) {
      jsonPath = path.join(__dirname, '../../public/combined_ideas.json');
    }
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Ideas file not found at ${jsonPath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    ideasData = {
      ideas: data.ideas || [],
      metadata: data.metadata || {},
      stats: calculateStats(data.ideas || [])
    };

    // Build index for fast search
    buildIndex(ideasData.ideas);
    
    console.log(`✅ Loaded ${ideasData.ideas.length} ideas from ${jsonPath}`);
    return ideasData;
  } catch (error) {
    console.error('❌ Error loading ideas:', error);
    console.error('Error details:', error.message);
    return {
      ideas: [],
      metadata: {},
      stats: null
    };
  }
}

// Build search index
function buildIndex(ideas) {
  ideasIndex = {
    byId: new Map(),
    byTag: new Map(),
    byCategory: new Map(),
    searchIndex: []
  };

  ideas.forEach((idea, index) => {
    // Index by ID - use idea.id if present, otherwise use index + 1
    const ideaId = idea.id !== undefined ? idea.id : (index + 1);
    ideasIndex.byId.set(ideaId, idea);

    // Index by tags
    if (idea.tags && Array.isArray(idea.tags)) {
      idea.tags.forEach(tag => {
        if (!ideasIndex.byTag.has(tag)) {
          ideasIndex.byTag.set(tag, []);
        }
        ideasIndex.byTag.get(tag).push(idea);
      });
    }

    // Index by category
    if (idea.category) {
      if (!ideasIndex.byCategory.has(idea.category)) {
        ideasIndex.byCategory.set(idea.category, []);
      }
      ideasIndex.byCategory.get(idea.category).push(idea);
    }

    // Build search index
    const searchText = [
      idea.name || '',
      idea.title || '',
      idea.description || '',
      (idea.tags || []).join(' ')
    ].join(' ').toLowerCase();

    const searchId = idea.id !== undefined ? idea.id : (index + 1);
    ideasIndex.searchIndex.push({
      id: searchId,
      text: searchText,
      idea: idea
    });
  });

  console.log(`✅ Built index for ${ideas.length} ideas`);
}

// Calculate statistics
function calculateStats(ideas) {
  const tagCount = new Map();
  let ideasWithTags = 0;

  ideas.forEach(idea => {
    if (idea.tags && idea.tags.length > 0) {
      ideasWithTags++;
      idea.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    }
  });

  return {
    totalIdeas: ideas.length,
    uniqueTags: tagCount.size,
    ideasWithTags: ideasWithTags,
    totalTags: Array.from(tagCount.values()).reduce((a, b) => a + b, 0)
  };
}

// Get all ideas with pagination and filters
function getIdeas(filters = {}) {
  const data = loadIdeas();
  let results = [...data.ideas];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(idea => {
      const searchText = [
        idea.name || '',
        idea.title || '',
        idea.description || '',
        (idea.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return searchText.includes(searchLower);
    });
  }

  // Tag filter
  if (filters.tag) {
    results = results.filter(idea => 
      idea.tags && idea.tags.includes(filters.tag)
    );
  }

  // Category filter
  if (filters.category) {
    results = results.filter(idea => 
      idea.category === filters.category
    );
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.itemsPerPage || 25;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    ideas: results.slice(start, end),
    total: results.length,
    page: page,
    totalPages: Math.ceil(results.length / limit),
    itemsPerPage: limit
  };
}

// Get single idea by ID
function getIdeaById(id) {
  const data = loadIdeas();
  const idNum = parseInt(id);
  
  if (ideasIndex && ideasIndex.byId) {
    const idea = ideasIndex.byId.get(idNum);
    if (idea) return idea;
  }
  
  // Fallback: search in ideas array
  return data.ideas.find((idea, index) => {
    const ideaId = idea.id !== undefined ? idea.id : (index + 1);
    return ideaId === idNum;
  }) || null;
}

// Get all tags
function getTags() {
  const data = loadIdeas();
  const tagSet = new Set();
  
  data.ideas.forEach(idea => {
    if (idea.tags && Array.isArray(idea.tags)) {
      idea.tags.forEach(tag => tagSet.add(tag));
    }
  });

  return Array.from(tagSet).sort();
}

// Get tags filtered by search
function getFilteredTags(search = '') {
  const tags = getTags();
  if (!search) return tags;
  
  const searchLower = search.toLowerCase();
  return tags.filter(tag => tag.toLowerCase().includes(searchLower));
}

// Get statistics
function getStats() {
  const data = loadIdeas();
  return data.stats || calculateStats(data.ideas);
}

// Find similar ideas
function findSimilarIdeas(idea, limit = 10) {
  const data = loadIdeas();
  const internalValidator = require('../services/internalValidator');
  
  const ideaId = idea.id !== undefined ? idea.id : null;
  
  return data.ideas
    .map((otherIdea, index) => ({
      idea: otherIdea,
      otherIndex: index,
      score: internalValidator.calculateSimilarity(idea, otherIdea)
    }))
    .filter(result => {
      const otherId = result.idea.id !== undefined ? result.idea.id : (result.otherIndex + 1);
      return result.score > 0.3 && otherId !== ideaId;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.idea);
}

// Export all ideas
function exportAllIdeas() {
  const data = loadIdeas();
  return data.ideas;
}

module.exports = {
  loadIdeas,
  getIdeas,
  getIdeaById,
  getTags,
  getFilteredTags,
  getStats,
  findSimilarIdeas,
  exportAllIdeas,
  getIndex: () => ideasIndex
};

