const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
let activityCache = {
  data: null,
  timestamp: 0
};

// Sheet configuration
let sheets;
let canWrite = false;

try {
  let serviceAccount;
  
  // Priority 1: Environment variable (base64 encoded) - for Vercel
  if (process.env.SERVICE_ACCOUNT_BASE64) {
    const base64 = process.env.SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  }
  // Priority 2: Environment variable (JSON string) - for other cloud platforms
  else if (process.env.SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
  }
  // Priority 3: Local file - for development
  else {
    const serviceAccountPath = path.join(__dirname, '../service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }
  
  if (serviceAccount) {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    sheets = google.sheets({ version: 'v4', auth });
    canWrite = true;
    console.log('✅ Using Service Account - Full access (read/write)');
  } else {
    const API_KEY = process.env.GOOGLE_API_KEY;
    sheets = google.sheets({ version: 'v4', auth: API_KEY });
  }
} catch (error) {
  console.error('❌ Error loading service account:', error.message);
  const API_KEY = process.env.GOOGLE_API_KEY;
  sheets = google.sheets({ version: 'v4', auth: API_KEY });
}

const ACTIVITY_SHEET = 'ActivityLog';

/**
 * Log activity to Google Sheets
 * @param {string} username - Username
 * @param {string} nickname - User's nickname
 * @param {string} action - Action performed (e.g., 'เพิ่มโรงแรม', 'แก้ไขโรงแรม')
 * @param {string} hotelName - Hotel name (optional)
 * @param {string} type - Activity type: hotel, amenity, login, logout, system (optional)
 * @param {string} details - Detailed description of the activity (optional)
 */
async function logActivity(username, nickname, action, hotelName = '', type = '', details = '') {
  if (!canWrite) {
    return { success: false };
  }

  try {
    // Use ISO format for timestamp to ensure compatibility with Date parsing
    const timestamp = new Date().toISOString();

    const newRow = [
      timestamp,
      username,
      nickname,
      action,
      hotelName,
      type,      // Column F
      details    // Column G
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ACTIVITY_SHEET}!A:G`,  // Extended to column G
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get activity logs (latest 100 records) with caching
 */
async function getActivityLogs(limit = 100) {
  // Check cache first
  const now = Date.now();
  if (activityCache.data && (now - activityCache.timestamp) < CACHE_DURATION) {
    return activityCache.data.slice(0, limit);
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ACTIVITY_SHEET}!A2:G`, // Extended to column G for type and details
    });

    const rows = response.data.values || [];
    
    // Map and reverse to get latest first
    const activities = rows.map(row => ({
      timestamp: row[0] || '',
      username: row[1] || '',
      nickname: row[2] || '',
      action: row[3] || '',
      hotelName: row[4] || '',
      type: row[5] || '', // New: Activity type (hotel/amenity/login/etc)
      details: row[6] || '' // New: Detailed description
    })).reverse();

    // Update cache
    activityCache = {
      data: activities,
      timestamp: Date.now()
    };

    // Return limited results
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    
    // Return stale cache if available
    if (activityCache.data) {
      return activityCache.data.slice(0, limit);
    }
    
    return [];
  }
}

/**
 * Get paginated activity logs
 */
async function getActivityLogsPaginated(page = 1, perPage = 10) {
  try {
    const allLogs = await getActivityLogs(1000); // Get more records for pagination
    
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    const paginatedLogs = allLogs.slice(startIndex, endIndex);
    
    return {
      logs: paginatedLogs,
      currentPage: page,
      perPage: perPage,
      totalLogs: allLogs.length,
      totalPages: Math.ceil(allLogs.length / perPage)
    };
  } catch (error) {
    console.error('Error fetching paginated logs:', error);
    return {
      logs: [],
      currentPage: page,
      perPage: perPage,
      totalLogs: 0,
      totalPages: 0
    };
  }
}

/**
 * Clear activity cache (call after logging new activity)
 */
function clearActivityCache() {
  activityCache = {
    data: null,
    timestamp: 0
  };
}

module.exports = {
  logActivity,
  getActivityLogs,
  getActivityLogsPaginated,
  clearActivityCache
};
