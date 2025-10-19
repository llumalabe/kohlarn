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
  const now = new Date();
  let startTime;

  switch (period) {
    case 'day':
      // วันนี้ตั้งแต่ 00:00:00
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      startTime = startOfDay.getTime();
      break;
    case 'week':
      // สัปดาห์นี้ตั้งแต่วันจันทร์ 00:00:00
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // ถ้าวันอาทิตย์ให้ย้อนกลับ 6 วัน
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      startTime = startOfWeek.getTime();
      break;
    case 'month':
      // เดือนนี้ตั้งแต่วันที่ 1 00:00:00
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      startTime = startOfMonth.getTime();
      break;
    case 'year':
      // ปีนี้ตั้งแต่ 1 มกราคม 00:00:00
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      startTime = startOfYear.getTime();
      break;
    default:
      // Default: วันนี้ตั้งแต่ 00:00:00
      const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      startTime = defaultStart.getTime();
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
