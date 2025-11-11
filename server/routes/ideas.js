const express = require('express');
const router = express.Router();
// Note: Ideas data is loaded client-side from /combined_ideas.json
// Server-side ideasService is optional and only used for validation
let ideasService = null;
try {
  ideasService = require('../data/ideasService');
} catch (error) {
  console.warn('⚠️  Ideas service not available - ideas data is client-side only');
}
const XLSX = require('xlsx');

// Get paginated ideas with filters
// NOTE: This endpoint is optional - ideas are loaded client-side
router.get('/', (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Ideas data is loaded client-side. Use /combined_ideas.json instead.',
      message: 'Ideas are served from the public folder on the client side.'
    });
  }
  
  try {
    const filters = {
      search: req.query.search || '',
      tag: req.query.tag || '',
      category: req.query.category || '',
      page: parseInt(req.query.page) || 1,
      itemsPerPage: parseInt(req.query.itemsPerPage) || 25
    };

    const result = ideasService.getIdeas(filters);
    res.json(result);
  } catch (error) {
    console.error('Error getting ideas:', error);
    res.status(500).json({ error: 'Failed to get ideas' });
  }
});

// Get single idea by ID
// NOTE: This endpoint is optional - ideas are loaded client-side
router.get('/:id', (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Ideas data is loaded client-side. Use /combined_ideas.json instead.',
      message: 'Ideas are served from the public folder on the client side.'
    });
  }
  
  try {
    const idea = ideasService.getIdeaById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    res.json(idea);
  } catch (error) {
    console.error('Error getting idea:', error);
    res.status(500).json({ error: 'Failed to get idea' });
  }
});

// Search ideas
// NOTE: This endpoint is optional - ideas are loaded client-side
router.post('/search', (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Ideas data is loaded client-side. Use /combined_ideas.json instead.',
      message: 'Ideas are served from the public folder on the client side.'
    });
  }
  
  try {
    const { query, filters = {} } = req.body;
    const searchFilters = {
      ...filters,
      search: query || ''
    };
    const result = ideasService.getIdeas(searchFilters);
    res.json(result);
  } catch (error) {
    console.error('Error searching ideas:', error);
    res.status(500).json({ error: 'Failed to search ideas' });
  }
});

// Get tags
// NOTE: This endpoint is optional - tags are extracted client-side
router.get('/tags/list', (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Tags are extracted client-side from /combined_ideas.json',
      message: 'Tags are processed on the client side.'
    });
  }
  
  try {
    const search = req.query.search || '';
    const tags = ideasService.getFilteredTags(search);
    res.json({ tags });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

// Get statistics
// NOTE: This endpoint is optional - stats are calculated client-side
router.get('/stats/summary', (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Statistics are calculated client-side from /combined_ideas.json',
      message: 'Stats are processed on the client side.'
    });
  }
  
  try {
    const stats = ideasService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Export all ideas as Excel
// NOTE: This endpoint is optional - Excel export is done client-side
router.get('/export/excel', (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Excel export is done client-side',
      message: 'Download Excel from the client application.'
    });
  }
  
  try {
    const ideas = ideasService.exportAllIdeas();
    
    // Prepare data for Excel
    const excelData = ideas.map(idea => ({
      'Name': idea.name || idea.title || '',
      'Description': idea.description || '',
      'Tags': Array.isArray(idea.tags) ? idea.tags.join('; ') : '',
      'Pain Points': Array.isArray(idea.painPoints) 
        ? idea.painPoints.map(pp => formatPainPoint(pp)).join('; ') 
        : '',
      'Category': idea.category || '',
      'Saturation Level': idea.saturation?.level || '',
      'Competitor Count': idea.saturation?.competitorCount || '',
      'Market Type': idea.saturation?.marketType || '',
      'TAM': idea.saturation?.tam || '',
      'Validation Status': idea.validation?.status || '',
      'Last Verified': idea.saturation?.lastVerified || ''
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Name
      { wch: 60 }, // Description
      { wch: 40 }, // Tags
      { wch: 60 }, // Pain Points
      { wch: 15 }, // Category
      { wch: 15 }, // Saturation Level
      { wch: 15 }, // Competitor Count
      { wch: 15 }, // Market Type
      { wch: 15 }, // TAM
      { wch: 15 }, // Validation Status
      { wch: 15 }  // Last Verified
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Avoid Data');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=avoid_data.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

// Helper function to format pain points
function formatPainPoint(painPoint) {
  if (!painPoint || typeof painPoint !== 'string') return '';
  
  let formatted = painPoint.trim();
  formatted = formatted.replace(/^[•\-\*\u2022]\s*/, '');
  formatted = formatted.replace(/^[•\-\*\u2022]\s*/, '');
  
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  
  return formatted;
}

module.exports = router;

