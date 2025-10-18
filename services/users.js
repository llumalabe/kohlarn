const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

// Sheet configuration
let sheets;
let canWrite = false;

try {
  let serviceAccount;
  
  // Try to get service account from environment variable (for cloud deployment)
  if (process.env.SERVICE_ACCOUNT_BASE64) {
    console.log('📦 Using SERVICE_ACCOUNT_BASE64 from environment variable');
    const base64 = process.env.SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  } else if (process.env.SERVICE_ACCOUNT_JSON) {
    console.log('📦 Using SERVICE_ACCOUNT_JSON from environment variable');
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
  } else {
    // Fallback to file (for local development)
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
    console.log('✅ Service Account initialized with write access');
  } else {
    console.log('⚠️ No service account found, using API key (read-only)');
    sheets = google.sheets({ version: 'v4', auth: API_KEY });
  }
} catch (error) {
  console.error('❌ Error initializing Google Sheets:', error.message);
  sheets = google.sheets({ version: 'v4', auth: API_KEY });
}

const USERS_SHEET = 'Users';

/**
 * Get all users from Google Sheets
 */
async function getUsers() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${USERS_SHEET}!A2:E`,
    });

    const rows = response.data.values || [];
    const users = rows.map(row => {
      // Remove apostrophe prefix if exists (used to preserve leading zeros)
      let hotelId = row[4] || '';
      if (hotelId && hotelId.startsWith("'")) {
        hotelId = hotelId.substring(1);
      }
      
      return {
        username: row[0] || '',
        password: row[1] || '',
        nickname: row[2] || '',
        role: row[3] || 'admin',
        hotelId: hotelId
      };
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty array if sheet doesn't exist yet
    return [];
  }
}

/**
 * Validate user credentials
 */
async function validateUser(username, password) {
  console.log('🔍 Validating user:', { username, passwordLength: password?.length });
  
  // Check Google Sheets users FIRST
  try {
    const users = await getUsers();
    console.log(`📋 Found ${users.length} users in Google Sheets`);
    
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      console.log('✅ Google Sheets user matched:', user.username);
      return {
        valid: true,
        isTemporary: false,
        user: {
          username: user.username,
          nickname: user.nickname,
          role: user.role,
          hotelId: user.hotelId || ''
        },
        message: `✅ ยินดีต้อนรับ ${user.nickname}`
      };
    }

    // ไม่พบผู้ใช้ในระบบ
    console.log('❌ Login failed - credentials not found');
    return {
      valid: false,
      isTemporary: false,
      user: null,
      message: '❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    };
  } catch (error) {
    console.error('Error validating user:', error);
    return {
      valid: false,
      isTemporary: false,
      user: null,
      message: '❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    };
  }
}

/**
 * Add new user
 */
async function addUser(user) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }

  try {
    // Use apostrophe prefix to force text format in Google Sheets for hotelId
    const hotelIdValue = user.hotelId ? `'${user.hotelId}` : '';
    
    const newRow = [
      user.username || '',
      user.password || '',
      user.nickname || '',
      user.role || 'admin',
      hotelIdValue
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${USERS_SHEET}!A:E`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

/**
 * Update user
 */
async function updateUser(userId, userData) {
  if (!canWrite) {
    throw new Error('Write access not available');
  }
  
  try {
    // Get all users to find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${USERS_SHEET}!A2:E`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === userId);
    
    if (rowIndex === -1) {
      throw new Error('User not found');
    }
    
    const existingUser = rows[rowIndex];
    
    // Hash new password if provided
    let passwordToSave = existingUser[1]; // Default: keep existing password
    if (userData.password && userData.password.trim() !== '') {
      passwordToSave = await bcrypt.hash(userData.password, 10);
      console.log(`🔐 Password updated for user: ${userId}`);
    }
    
    // Use apostrophe prefix to force text format in Google Sheets for hotelId
    const hotelIdValue = userData.hotelId !== undefined 
      ? (userData.hotelId ? `'${userData.hotelId}` : '')
      : (existingUser[4] || '');
    
    // Update row (preserve username, update password if provided)
    const updatedRow = [
      existingUser[0], // username (preserve)
      passwordToSave, // password (update if provided, otherwise preserve)
      userData.nickname || existingUser[2],
      userData.role || existingUser[3] || 'user',
      hotelIdValue
    ];
    
    const sheetRow = rowIndex + 2; // +2 because: +1 for header, +1 for 0-based to 1-based
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${USERS_SHEET}!A${sheetRow}:E${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      }
    });

    return {
      username: updatedRow[0],
      nickname: updatedRow[2],
      role: updatedRow[3]
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
  if (!canWrite) {
    throw new Error('Write access not available');
  }
  
  try {
    // Get all users to find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${USERS_SHEET}!A2:D`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === userId);
    
    if (rowIndex === -1) {
      throw new Error('User not found');
    }
    
    const deletedUser = {
      username: rows[rowIndex][0],
      nickname: rows[rowIndex][2],
      role: rows[rowIndex][3]
    };
    
    // Get sheet metadata to find the sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === USERS_SHEET);
    if (!sheet) {
      throw new Error('Users sheet not found');
    }
    
    const sheetId = sheet.properties.sheetId;
    const sheetRow = rowIndex + 2; // +2 because: +1 for header, +1 for 0-based to 1-based
    
    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: sheetRow - 1, // 0-based for API
              endIndex: sheetRow // exclusive
            }
          }
        }]
      }
    });

    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

module.exports = {
  getUsers,
  validateUser,
  addUser,
  updateUser,
  deleteUser
};