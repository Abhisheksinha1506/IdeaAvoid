const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Store user contributions in a simple JSON file
const contributionsPath = path.join(__dirname, '../../data/userContributions.json');

// Load contributions
function loadContributions() {
  try {
    if (fs.existsSync(contributionsPath)) {
      return JSON.parse(fs.readFileSync(contributionsPath, 'utf8'));
    }
    return { contributions: [] };
  } catch (error) {
    console.error('Error loading contributions:', error);
    return { contributions: [] };
  }
}

// Save contributions
function saveContributions(data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(contributionsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(contributionsPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving contributions:', error);
    return false;
  }
}

// Submit verification
router.post('/verify', (req, res) => {
  try {
    const { ideaId, ideaName, exists, competitorLinks, notes } = req.body;
    
    if (!ideaId && !ideaName) {
      return res.status(400).json({ error: 'Idea ID or name required' });
    }

    const contributions = loadContributions();
    const contribution = {
      id: Date.now().toString(),
      type: 'verification',
      ideaId: ideaId || null,
      ideaName: ideaName || '',
      exists: exists !== undefined ? exists : null,
      competitorLinks: competitorLinks || [],
      notes: notes || '',
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    contributions.contributions.push(contribution);
    saveContributions(contributions);

    res.json({ success: true, contribution });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// Submit competitor report
router.post('/competitor', (req, res) => {
  try {
    const { ideaId, ideaName, competitorName, competitorLink, notes } = req.body;
    
    if (!ideaId && !ideaName) {
      return res.status(400).json({ error: 'Idea ID or name required' });
    }

    const contributions = loadContributions();
    const contribution = {
      id: Date.now().toString(),
      type: 'competitor',
      ideaId: ideaId || null,
      ideaName: ideaName || '',
      competitorName: competitorName || '',
      competitorLink: competitorLink || '',
      notes: notes || '',
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    contributions.contributions.push(contribution);
    saveContributions(contributions);

    res.json({ success: true, contribution });
  } catch (error) {
    console.error('Error submitting competitor:', error);
    res.status(500).json({ error: 'Failed to submit competitor' });
  }
});

// Submit saturation level report
router.post('/saturation', (req, res) => {
  try {
    const { ideaId, ideaName, saturationLevel, competitorCount, notes } = req.body;
    
    if (!ideaId && !ideaName) {
      return res.status(400).json({ error: 'Idea ID or name required' });
    }

    const contributions = loadContributions();
    const contribution = {
      id: Date.now().toString(),
      type: 'saturation',
      ideaId: ideaId || null,
      ideaName: ideaName || '',
      saturationLevel: saturationLevel || null,
      competitorCount: competitorCount || null,
      notes: notes || '',
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    contributions.contributions.push(contribution);
    saveContributions(contributions);

    res.json({ success: true, contribution });
  } catch (error) {
    console.error('Error submitting saturation:', error);
    res.status(500).json({ error: 'Failed to submit saturation' });
  }
});

// Get contributions for an idea
router.get('/idea/:id', (req, res) => {
  try {
    const contributions = loadContributions();
    const ideaContributions = contributions.contributions.filter(
      c => c.ideaId === req.params.id || c.ideaName.includes(req.params.id)
    );
    res.json({ contributions: ideaContributions });
  } catch (error) {
    console.error('Error getting contributions:', error);
    res.status(500).json({ error: 'Failed to get contributions' });
  }
});

module.exports = router;

