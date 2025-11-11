require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ideasRouter = require('./routes/ideas');
const validationRouter = require('./routes/validation');
const userContributionsRouter = require('./routes/userContributions');
const visitorsRouter = require('./routes/visitors');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Apply to all API routes
const maxRequests = parseInt(process.env.RATE_LIMIT_PER_HOUR) || 100;
app.use('/api', rateLimiter({ 
  maxRequests: maxRequests, 
  windowMs: 60 * 60 * 1000 // 1 hour
}));

// API Routes
app.use('/api/ideas', ideasRouter);
app.use('/api/validation', validationRouter);
app.use('/api/contributions', userContributionsRouter);
app.use('/api/visitors', visitorsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - redirect to API info
app.get('/', (req, res) => {
  res.json({ 
    message: 'IdeaAvoid API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      ideas: '/api/ideas',
      validation: '/api/validation',
      contributions: '/api/contributions',
      visitors: '/api/visitors'
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler - Must be last middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : undefined,
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🛡️  Rate limiting: ${maxRequests} requests/hour per IP`);
});

module.exports = app;

