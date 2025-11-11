module.exports = {
  // Puppeteer launch options
  launchOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    timeout: 30000
  },

  // Page options
  pageOptions: {
    waitUntil: 'networkidle2',
    timeout: 30000
  },

  // User agent
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 100
  }
};

