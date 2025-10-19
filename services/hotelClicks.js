const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const CLICKS_FILE = path.join(DATA_DIR, 'clicks.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize clicks file if it doesn't exist
if (!fs.existsSync(CLICKS_FILE)) {
  fs.writeFileSync(CLICKS_FILE, JSON.stringify({ hotels: {} }));
}

/**
 * Load clicks from file
 */
function loadClicks() {
  try {
    const data = fs.readFileSync(CLICKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { hotels: {} };
  }
}

/**
 * Save clicks to file
 */
function saveClicks(clicks) {
  fs.writeFileSync(CLICKS_FILE, JSON.stringify(clicks, null, 2));
}

/**
 * Record a click on hotel card
 */
function recordClick(hotelId, ip, userAgent = '') {
  const clicks = loadClicks();
  
  if (!clicks.hotels[hotelId]) {
    clicks.hotels[hotelId] = {
      count: 0,
      history: []
    };
  }
  
  const hotel = clicks.hotels[hotelId];
  
  // Add click
  hotel.count++;
  hotel.history.push({
    ip,
    userAgent,
    timestamp: Date.now()
  });
  
  saveClicks(clicks);
  
  return {
    success: true,
    clicks: hotel.count
  };
}

/**
 * Get clicks for a specific hotel
 */
function getHotelClicks(hotelId) {
  const clicks = loadClicks();
  return clicks.hotels[hotelId]?.count || 0;
}

/**
 * Get all hotel clicks
 */
function getAllClicks() {
  const clicks = loadClicks();
  const result = {};
  
  for (const hotelId in clicks.hotels) {
    result[hotelId] = clicks.hotels[hotelId].count;
  }
  
  return result;
}

/**
 * Get click statistics for a period
 */
function getClickStats(period = 'day') {
  const clicks = loadClicks();
  const now = Date.now();
  let startTime;

  switch (period) {
    case 'day':
      startTime = now - (24 * 60 * 60 * 1000);
      break;
    case 'week':
      startTime = now - (7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startTime = now - (30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startTime = now - (365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = now - (24 * 60 * 60 * 1000);
  }

  const stats = {
    total: 0,
    byHotel: {}
  };

  for (const hotelId in clicks.hotels) {
    const hotel = clicks.hotels[hotelId];
    const filteredClicks = hotel.history.filter(click => click.timestamp >= startTime);
    
    if (filteredClicks.length > 0) {
      stats.byHotel[hotelId] = filteredClicks.length;
      stats.total += filteredClicks.length;
    }
  }

  return stats;
}

/**
 * Get top hotels by clicks
 */
function getTopClickedHotels(period = 'day', sortBy = 'most', limit = 10) {
  const stats = getClickStats(period);
  const clicks = loadClicks();
  
  const hotelList = Object.entries(stats.byHotel).map(([hotelId, count]) => ({
    hotelId,
    clicks: count,
    totalClicks: clicks.hotels[hotelId]?.count || 0,
    recent: clicks.hotels[hotelId]?.history
      .filter(h => h.timestamp >= (Date.now() - (24 * 60 * 60 * 1000)))
      .length || 0
  }));

  // Sort based on criteria
  if (sortBy === 'most') {
    hotelList.sort((a, b) => b.clicks - a.clicks);
  } else if (sortBy === 'least') {
    hotelList.sort((a, b) => a.clicks - b.clicks);
  } else if (sortBy === 'recent') {
    hotelList.sort((a, b) => b.recent - a.recent);
  }

  return hotelList.slice(0, limit);
}

/**
 * Get click details for a hotel
 */
function getHotelClickDetails(hotelId, period = 'day') {
  const clicks = loadClicks();
  const now = Date.now();
  let startTime;

  switch (period) {
    case 'day':
      startTime = now - (24 * 60 * 60 * 1000);
      break;
    case 'week':
      startTime = now - (7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startTime = now - (30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startTime = now - (365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = now - (24 * 60 * 60 * 1000);
  }

  if (!clicks.hotels[hotelId]) {
    return {
      hotelId,
      total: 0,
      periodClicks: 0,
      history: []
    };
  }

  const hotel = clicks.hotels[hotelId];
  const periodHistory = hotel.history.filter(click => click.timestamp >= startTime);

  return {
    hotelId,
    total: hotel.count,
    periodClicks: periodHistory.length,
    history: periodHistory.slice(-50) // Last 50 clicks in period
  };
}

module.exports = {
  recordClick,
  getHotelClicks,
  getAllClicks,
  getClickStats,
  getTopClickedHotels,
  getHotelClickDetails
};
