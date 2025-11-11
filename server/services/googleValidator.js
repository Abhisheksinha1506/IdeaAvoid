const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

let browser = null;

// Initialize browser
async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
  }
  return browser;
}

// Close browser
async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Clear cache for a specific key
function clearCache(cacheKey) {
  cache.del(cacheKey);
}

// Search Google for idea
async function searchGoogle(idea, bypassCache = false) {
  const cacheKey = `google_${idea.name || idea.title || idea.description}`;
  
  if (!bypassCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
  } else {
    // Clear cache if bypassing
    cache.del(cacheKey);
  }

  try {
    const browser = await initBrowser();
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Build search query
    const searchQuery = `"${idea.name || idea.title || ''}" ${idea.description ? idea.description.substring(0, 50) : ''}`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`;
    
    // Navigate to Google
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for results
    await page.waitForSelector('div.g', { timeout: 10000 }).catch(() => {});
    
    // Extract search results
    const results = await page.evaluate(() => {
      const resultElements = document.querySelectorAll('div.g');
      const extracted = [];
      
      resultElements.forEach((element, index) => {
        if (index >= 10) return; // Limit to 10 results
        
        const titleElement = element.querySelector('h3');
        const linkElement = element.querySelector('a');
        const snippetElement = element.querySelector('div[data-sncf]') || element.querySelector('span');
        
        if (titleElement && linkElement) {
          extracted.push({
            title: titleElement.textContent.trim(),
            url: linkElement.href,
            snippet: snippetElement ? snippetElement.textContent.trim() : ''
          });
        }
      });
      
      return extracted;
    });
    
    await page.close();
    
    // Filter relevant results
    const relevantResults = results.filter(result => {
      const titleLower = result.title.toLowerCase();
      const snippetLower = result.snippet.toLowerCase();
      const ideaNameLower = (idea.name || idea.title || '').toLowerCase();
      
      // Check if result is relevant
      return titleLower.includes(ideaNameLower) || 
             snippetLower.includes(ideaNameLower) ||
             titleLower.includes('app') || 
             titleLower.includes('software') ||
             titleLower.includes('platform') ||
             titleLower.includes('service');
    });
    
    const result = {
      source: 'google',
      competitorCount: relevantResults.length,
      totalResults: results.length,
      competitors: relevantResults.slice(0, 5).map(r => ({
        name: r.title,
        url: r.url,
        snippet: r.snippet
      })),
      lastChecked: new Date().toISOString()
    };
    
    // Cache result
    cache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error searching Google:', error);
    return {
      source: 'google',
      competitorCount: 0,
      totalResults: 0,
      competitors: [],
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
}

// Validate idea using Google search
async function validateWithGoogle(idea, bypassCache = false) {
  if (!process.env.GOOGLE_SEARCH_ENABLED || process.env.GOOGLE_SEARCH_ENABLED === 'false') {
    return {
      source: 'google',
      competitorCount: 0,
      totalResults: 0,
      competitors: [],
      enabled: false,
      lastChecked: new Date().toISOString()
    };
  }

  return await searchGoogle(idea, bypassCache);
}

// Cleanup on process exit
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit();
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit();
});

module.exports = {
  searchGoogle,
  validateWithGoogle,
  initBrowser,
  closeBrowser,
  clearCache
};

