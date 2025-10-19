const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure data directory exists (only in local environment)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Initialize stats file if it doesn't exist (only in local environment)
  if (!fs.existsSync(STATS_FILE)) {
    fs.writeFileSync(STATS_FILE, JSON.stringify({ visits: [] }));
  }
} catch (error) {
  // Ignore errors in serverless/read-only environments (like Vercel)
}

/**
 * Load stats from file
 */
function loadStats() {
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { visits: [] };
  }
}

/**
 * Save stats to file
 */
function saveStats(stats) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    // Ignore errors in serverless/read-only environments
  }
}

/**
 * Record a visit
 */
function recordVisit(ip) {
  const stats = loadStats();
  stats.visits.push({
    ip,
    timestamp: Date.now()
  });
  saveStats(stats);
}

/**
 * Get visit statistics for a period
 */
function getVisitStats(period = 'day') {
  const stats = loadStats();
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

  const filteredVisits = stats.visits.filter(visit => visit.timestamp >= startTime);
  
  // Count unique IPs
  const uniqueIPs = new Set(filteredVisits.map(v => v.ip));
  
  // Group by time periods
  const visitsByPeriod = {};
  filteredVisits.forEach(visit => {
    const date = new Date(visit.timestamp);
    let key;
    
    if (period === 'day') {
      key = `${date.getHours()}:00`;
    } else if (period === 'week') {
      key = date.toLocaleDateString('th-TH', { weekday: 'short' });
    } else if (period === 'month') {
      key = date.toLocaleDateString('th-TH', { day: 'numeric' });
    } else {
      key = date.toLocaleDateString('th-TH', { month: 'short' });
    }
    
    visitsByPeriod[key] = (visitsByPeriod[key] || 0) + 1;
  });

  return {
    total: filteredVisits.length,
    unique: uniqueIPs.size,
    byPeriod: visitsByPeriod
  };
}

/**
 * Get realtime visits (last 5 minutes)
 */
function getRealtimeVisits() {
  const stats = loadStats();
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  const recentVisits = stats.visits.filter(visit => visit.timestamp >= fiveMinutesAgo);
  
  return {
    count: recentVisits.length,
    visits: recentVisits.map(v => ({
      ip: v.ip.replace(/(\d+\.\d+)\.\d+\.\d+/, '$1.x.x'), // Anonymize IP
      time: new Date(v.timestamp).toLocaleTimeString('th-TH')
    }))
  };
}

module.exports = {
  recordVisit,
  getVisitStats,
  getRealtimeVisits
};
