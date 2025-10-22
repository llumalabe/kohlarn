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
    const base64 = process.env.SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  } else if (process.env.SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
  } else {
    // Fallback to file (for local development)
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
      
      // Parse hotelId: support both single hotel and multiple hotels (comma-separated)
      // Examples: "hotel-1" or "hotel-1,hotel-2,hotel-3"
      let hotelIds = [];
      if (hotelId) {
        hotelIds = hotelId.split(',').map(id => id.trim()).filter(id => id);
      }
      
      return {
        username: row[0] || '',
        password: row[1] || '',
        nickname: row[2] || '',
        role: row[3] || 'admin',
        hotelId: hotelId, // Keep original string for backward compatibility
        hotelIds: hotelIds // Array of hotel IDs
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
  // Check Google Sheets users FIRST
  try {
    const users = await getUsers();
    // Find user by username first
    const user = users.find(u => u.username === username);

    if (user) {
      // Compare password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        return {
          valid: true,
          isTemporary: false,
          user: {
            username: user.username,
            nickname: user.nickname,
            role: user.role,
            hotelId: user.hotelId || '', // Original string for backward compatibility
            hotelIds: user.hotelIds || [] // Array of hotel IDs
          },
          message: `✅ ยินดีต้อนรับ ${user.nickname}`
        };
      }
    }

    // ไม่พบผู้ใช้ในระบบ
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
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(user.password || '', 10);
    
    // Handle hotelIds: can be array or comma-separated string
    let hotelIdValue = '';
    if (user.hotelIds && Array.isArray(user.hotelIds)) {
      // Array: join with commas
      hotelIdValue = user.hotelIds.filter(id => id).join(',');
    } else if (user.hotelId) {
      // Single string (backward compatibility)
      hotelIdValue = user.hotelId;
    }
    // Use apostrophe prefix to force text format in Google Sheets
    hotelIdValue = hotelIdValue ? `'${hotelIdValue}` : '';
    
    const newRow = [
      user.username || '',
      hashedPassword,
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
    }
    
    // Handle hotelIds: can be array or comma-separated string
    let hotelIdValue;
    if (userData.hotelIds !== undefined) {
      // Array provided: join with commas
      if (Array.isArray(userData.hotelIds)) {
        hotelIdValue = userData.hotelIds.filter(id => id).join(',');
      } else {
        hotelIdValue = userData.hotelIds;
      }
      hotelIdValue = hotelIdValue ? `'${hotelIdValue}` : '';
    } else if (userData.hotelId !== undefined) {
      // Single string (backward compatibility)
      hotelIdValue = userData.hotelId ? `'${userData.hotelId}` : '';
    } else {
      // Not provided: keep existing
      hotelIdValue = existingUser[4] || '';
    }
    
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