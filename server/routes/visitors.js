const express = require('express');
const router = express.Router();
const visitorService = require('../services/visitorService');

// Get visitor count (without incrementing)
router.get('/count', (req, res) => {
  try {
    const count = visitorService.getVisitorCount();
    res.json(count);
  } catch (error) {
    console.error('Error getting visitor count:', error);
    res.status(500).json({ error: 'Failed to get visitor count' });
  }
});

// Increment visitor count
router.post('/increment', (req, res) => {
  try {
    // Get IP address from request
    const ip = req.ip || 
               req.headers['x-forwarded-for']?.split(',')[0] || 
               req.connection.remoteAddress ||
               'unknown';
    
    const count = visitorService.incrementVisitor(ip);
    res.json(count);
  } catch (error) {
    console.error('Error incrementing visitor count:', error);
    res.status(500).json({ error: 'Failed to increment visitor count' });
  }
});

module.exports = router;

