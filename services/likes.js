const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');

// Ensure data directory exists (only in local environment)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Initialize likes file if it doesn't exist (only in local environment)
  if (!fs.existsSync(LIKES_FILE)) {
    fs.writeFileSync(LIKES_FILE, JSON.stringify({ hotels: {} }));
  }
} catch (error) {
  // Ignore errors in serverless/read-only environments (like Vercel)
  console.log('⚠️  Running in serverless environment - file system is read-only');
}

/**
 * Load likes from file
 */
function loadLikes() {
  try {
    const data = fs.readFileSync(LIKES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { hotels: {} };
  }
}

/**
 * Save likes to file
 */
function saveLikes(likes) {
  try {
    fs.writeFileSync(LIKES_FILE, JSON.stringify(likes, null, 2));
  } catch (error) {
    // Ignore errors in serverless/read-only environments
    console.log('⚠️  Cannot save likes in serverless environment');
  }
}

/**
 * Clean up old history (keep only last 30 days)
 */
function cleanupOldHistory(likes) {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  for (const hotelId in likes.hotels) {
    const hotel = likes.hotels[hotelId];
    if (hotel.history) {
      // Keep only history from last 30 days
      hotel.history = hotel.history.filter(h => h.timestamp > thirtyDaysAgo);
    }
  }
  
  return likes;
}

/**
 * Like a hotel (one like per IP per day)
 */
function likeHotel(hotelId, ip) {
  let likes = loadLikes();
  
  // Clean up old history periodically (1% chance on each like)
  if (Math.random() < 0.01) {
    likes = cleanupOldHistory(likes);
  }
  
  if (!likes.hotels[hotelId]) {
    likes.hotels[hotelId] = {
      count: 0,
      ips: [],
      history: []
    };
  }
  
  const hotel = likes.hotels[hotelId];
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 hours ago
  
  // Check if IP already liked this hotel in the last 24 hours
  const recentLike = hotel.history.find(like => 
    like.ip === ip && like.timestamp > oneDayAgo
  );
  
  if (recentLike) {
    // Calculate time left until user can like again
    const nextLikeTime = recentLike.timestamp + (24 * 60 * 60 * 1000);
    const timeLeft = nextLikeTime - now;
    const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
    
    return {
      success: false,
      error: `คุณได้กดหัวใจโรงแรมนี้แล้ววันนี้ กรุณารออีก ${hoursLeft} ชั่วโมง`,
      likes: hotel.count
    };
  }
  
  // Add like
  hotel.count++;
  
  // Add IP to list if not exists (for backward compatibility)
  if (!hotel.ips.includes(ip)) {
    hotel.ips.push(ip);
  }
  
  // Add to history with timestamp
  hotel.history.push({
    ip,
    timestamp: now
  });
  
  saveLikes(likes);
  
  return {
    success: true,
    likes: hotel.count
  };
}

/**
 * Get likes for a specific hotel
 */
function getHotelLikes(hotelId) {
  const likes = loadLikes();
  return likes.hotels[hotelId]?.count || 0;
}

/**
 * Get all hotel likes
 */
function getAllLikes() {
  const likes = loadLikes();
  const result = {};
  
  for (const hotelId in likes.hotels) {
    result[hotelId] = likes.hotels[hotelId].count;
  }
  
  return result;
}

/**
 * Get like statistics for a period
 */
function getLikeStats(period = 'day') {
  const likes = loadLikes();
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
    case 'all':
      startTime = 0; // Show all data from beginning
      break;
    default:
      startTime = now - (24 * 60 * 60 * 1000);
  }

  const stats = {
    total: 0,
    byHotel: {}
  };

  for (const hotelId in likes.hotels) {
    const hotel = likes.hotels[hotelId];
    const filteredLikes = hotel.history.filter(like => like.timestamp >= startTime);
    
    if (filteredLikes.length > 0) {
      stats.byHotel[hotelId] = filteredLikes.length;
      stats.total += filteredLikes.length;
    }
  }

  return stats;
}

/**
 * Get top hotels by likes
 */
function getTopHotels(period = 'day', sortBy = 'most') {
  const stats = getLikeStats(period);
  const likes = loadLikes();
  
  const hotelList = Object.entries(stats.byHotel).map(([hotelId, count]) => ({
    hotelId,
    likes: count,
    totalLikes: likes.hotels[hotelId]?.count || 0,
    recent: likes.hotels[hotelId]?.history
      .filter(h => h.timestamp >= (Date.now() - (24 * 60 * 60 * 1000)))
      .length || 0
  }));

  // Sort based on criteria
  if (sortBy === 'most') {
    hotelList.sort((a, b) => b.likes - a.likes);
  } else if (sortBy === 'least') {
    hotelList.sort((a, b) => a.likes - b.likes);
  } else if (sortBy === 'recent') {
    hotelList.sort((a, b) => b.recent - a.recent);
  }

  return hotelList;
}

/**
 * Check if IP has liked hotel (in the last 24 hours)
 */
function hasLiked(hotelId, ip) {
  const likes = loadLikes();
  if (!likes.hotels[hotelId]) return false;
  
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  // Check if there's a like from this IP in the last 24 hours
  return likes.hotels[hotelId].history.some(like => 
    like.ip === ip && like.timestamp > oneDayAgo
  );
}

module.exports = {
  likeHotel,
  getHotelLikes,
  getAllLikes,
  getLikeStats,
  getTopHotels,
  hasLiked
};
