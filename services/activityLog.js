const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Sheet configuration
let sheets;
let canWrite = false;

try {
  let serviceAccount;
  
  // Priority 1: Environment variable (base64 encoded) - for Vercel
  if (process.env.SERVICE_ACCOUNT_BASE64) {
    console.log('📦 Using SERVICE_ACCOUNT_BASE64 environment variable');
    const base64 = process.env.SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  }
  // Priority 2: Environment variable (JSON string) - for other cloud platforms
  else if (process.env.SERVICE_ACCOUNT_JSON) {
    console.log('📦 Using SERVICE_ACCOUNT_JSON environment variable');
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
  }
  // Priority 3: Local file - for development
  else {
    const serviceAccountPath = path.join(__dirname, '../service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      console.log('📦 Using service-account.json file');
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
    console.log('⚠️  Using API Key - Read-only access');
  }
} catch (error) {
  console.error('❌ Error loading service account:', error.message);
  const API_KEY = process.env.GOOGLE_API_KEY;
  sheets = google.sheets({ version: 'v4', auth: API_KEY });
  console.log('⚠️  Fallback to API Key - Read-only access');
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
    console.warn('Cannot write activity log - Service Account not configured');
    return { success: false };
  }

  try {
    const timestamp = new Date().toLocaleString('th-TH', { 
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

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
 * Get activity logs (latest 100 records)
 */
async function getActivityLogs(limit = 100) {
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

    // Return limited results
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
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

module.exports = {
  logActivity,
  getActivityLogs,
  getActivityLogsPaginated
};
