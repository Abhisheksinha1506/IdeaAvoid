const express = require('express');
const router = express.Router();
// Note: Ideas data is loaded client-side, but validation needs server-side access
// for internal validation (comparing against all ideas)
let ideasService = null;
try {
  ideasService = require('../data/ideasService');
} catch (error) {
  console.warn('⚠️  Ideas service not available - validation will use provided idea data only');
}
const validationService = require('../services/validationService');

// Validate single idea
router.get('/idea/:id', async (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Ideas service not available',
      message: 'Please provide idea data in the request body or use POST /validation/validate'
    });
  }
  
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid idea ID' });
    }

    const idea = ideasService.getIdeaById(id);
    if (!idea) {
      console.warn(`Idea with ID ${id} not found`);
      return res.status(404).json({ error: 'Idea not found', id: id });
    }

    // Check if force refresh is requested (for "Verify Now" button)
    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
    
    // If force refresh, always re-validate
    if (forceRefresh) {
      console.log(`Force refreshing validation for idea ${id}`);
      const validation = await validationService.validateIdeaFresh(idea);
      return res.json(validation);
    }

    // If idea already has validation and saturation data, return it
    if (idea.validation && idea.saturation && 
        typeof idea.validation === 'object' && 
        typeof idea.saturation === 'object' &&
        Object.keys(idea.validation).length > 0 && 
        Object.keys(idea.saturation).length > 0) {
      console.log(`Returning existing validation/saturation for idea ${id}`);
      return res.json({
        validation: idea.validation,
        saturation: idea.saturation
      });
    }

    // Otherwise, perform validation
    console.log(`Performing new validation for idea ${id}`);
    const validation = await validationService.validateIdea(idea);
    res.json(validation);
  } catch (error) {
    console.error('Error validating idea:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to validate idea',
      message: error.message || 'Unknown error occurred',
      id: req.params.id
    });
  }
});

// Validate idea by name/description
router.post('/validate', async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    if (!name && !description) {
      return res.status(400).json({ error: 'Name or description required' });
    }

    const idea = { name, description, tags: tags || [] };
    const validation = await validationService.validateIdea(idea);
    res.json(validation);
  } catch (error) {
    console.error('Error validating idea:', error);
    res.status(500).json({ error: 'Failed to validate idea' });
  }
});

// Get validation status for idea
router.get('/status/:id', async (req, res) => {
  if (!ideasService) {
    return res.status(503).json({ 
      error: 'Ideas service not available',
      message: 'Validation status is stored client-side in the idea object'
    });
  }
  
  try {
    const idea = ideasService.getIdeaById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const status = {
      status: idea.validation?.status || 'unverified',
      sources: idea.validation?.sources || [],
      aggregatedScore: idea.validation?.aggregatedScore || null,
      lastChecked: idea.saturation?.lastVerified || null
    };

    res.json(status);
  } catch (error) {
    console.error('Error getting validation status:', error);
    res.status(500).json({ error: 'Failed to get validation status' });
  }
});

module.exports = router;

