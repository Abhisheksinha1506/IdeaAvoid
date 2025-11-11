const fs = require('fs');
const path = require('path');

// Store visitor count in a JSON file
const visitorDataPath = path.join(__dirname, '../../data/visitorData.json');

// Load visitor data
function loadVisitorData() {
  try {
    if (fs.existsSync(visitorDataPath)) {
      return JSON.parse(fs.readFileSync(visitorDataPath, 'utf8'));
    }
    return {
      totalVisitors: 0,
      uniqueVisitors: [],
      lastReset: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading visitor data:', error);
    return {
      totalVisitors: 0,
      uniqueVisitors: [],
      lastReset: new Date().toISOString()
    };
  }
}

// Save visitor data
function saveVisitorData(data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(visitorDataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(visitorDataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving visitor data:', error);
    return false;
  }
}

// Get visitor count
function getVisitorCount() {
  const data = loadVisitorData();
  return {
    totalVisitors: data.totalVisitors || 0,
    uniqueVisitors: data.uniqueVisitors?.length || 0,
    lastUpdated: data.lastUpdated || data.lastReset
  };
}

// Increment visitor count
function incrementVisitor(ip) {
  const data = loadVisitorData();
  
  // Increment total visitors
  data.totalVisitors = (data.totalVisitors || 0) + 1;
  
  // Track unique visitors by IP (optional - can be disabled for privacy)
  // Only track if IP is provided and not already in the list
  if (ip && !data.uniqueVisitors) {
    data.uniqueVisitors = [];
  }
  
  if (ip && data.uniqueVisitors && !data.uniqueVisitors.includes(ip)) {
    data.uniqueVisitors.push(ip);
  }
  
  data.lastUpdated = new Date().toISOString();
  
  saveVisitorData(data);
  
  return {
    totalVisitors: data.totalVisitors,
    uniqueVisitors: data.uniqueVisitors?.length || 0,
    lastUpdated: data.lastUpdated
  };
}

module.exports = {
  getVisitorCount,
  incrementVisitor,
  loadVisitorData,
  saveVisitorData
};

