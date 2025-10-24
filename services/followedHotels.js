const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const FOLLOWED_HOTELS_SHEET = 'FollowedHotels';

// Get Google Sheets instance
let sheets;
let canWrite = false;

try {
  let serviceAccount;
  
  if (process.env.SERVICE_ACCOUNT_BASE64) {
    const base64 = process.env.SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  } else if (process.env.SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
  } else {
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
    console.log('✅ Followed Hotels Service - Using Service Account');
  }
} catch (error) {
  console.error('❌ Followed Hotels Service error:', error.message);
}

/**
 * Get all followed hotels for a specific user
 */
async function getFollowedHotels(username) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FOLLOWED_HOTELS_SHEET}!A2:E`,
    });

    const rows = response.data.values || [];
    
    // Filter by username and return hotel data
    const followedHotels = rows
      .filter(row => row[1] === username)
      .map(row => ({
        id: row[0],
        username: row[1],
        hotel_id: row[2],
        hotel_name: row[3],
        followed_at: row[4]
      }));

    return followedHotels;
  } catch (error) {
    console.error('Error fetching followed hotels:', error);
    return [];
  }
}

/**
 * Check if user is following a specific hotel
 */
async function isFollowing(username, hotelId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FOLLOWED_HOTELS_SHEET}!A2:E`,
    });

    const rows = response.data.values || [];
    
    // Check if combination exists
    const exists = rows.some(row => row[1] === username && row[2] === hotelId);
    
    return exists;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

/**
 * Follow a hotel
 */
async function followHotel(username, hotelId, hotelName) {
  if (!canWrite) {
    throw new Error('Cannot follow hotel: read-only access');
  }

  try {
    // Check if already following
    const alreadyFollowing = await isFollowing(username, hotelId);
    
    if (alreadyFollowing) {
      return { success: false, message: 'Already following this hotel' };
    }

    const timestamp = new Date().toLocaleString('th-TH', { 
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Generate unique ID
    const id = `follow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FOLLOWED_HOTELS_SHEET}!A:E`,
      valueInputOption: 'RAW',
      resource: {
        values: [[id, username, hotelId, hotelName, timestamp]]
      }
    });

    return { success: true, message: 'Hotel followed successfully' };
  } catch (error) {
    console.error('Error following hotel:', error);
    throw error;
  }
}

/**
 * Unfollow a hotel
 */
async function unfollowHotel(username, hotelId) {
  if (!canWrite) {
    throw new Error('Cannot unfollow hotel: read-only access');
  }

  try {
    // Get all data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FOLLOWED_HOTELS_SHEET}!A2:E`,
    });

    const rows = response.data.values || [];
    
    // Find the row index to delete
    const rowIndex = rows.findIndex(row => row[1] === username && row[2] === hotelId);
    
    if (rowIndex === -1) {
      return { success: false, message: 'Not following this hotel' };
    }

    // Delete the row (row number is index + 2 because of header and 0-based index)
    const actualRow = rowIndex + 2;
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // You may need to get the actual sheet ID
              dimension: 'ROWS',
              startIndex: actualRow - 1,
              endIndex: actualRow
            }
          }
        }]
      }
    });

    return { success: true, message: 'Hotel unfollowed successfully' };
  } catch (error) {
    console.error('Error unfollowing hotel:', error);
    throw error;
  }
}

/**
 * Get follow count for a user
 */
async function getFollowCount(username) {
  try {
    const followedHotels = await getFollowedHotels(username);
    return followedHotels.length;
  } catch (error) {
    console.error('Error getting follow count:', error);
    return 0;
  }
}

module.exports = {
  getFollowedHotels,
  isFollowing,
  followHotel,
  unfollowHotel,
  getFollowCount
};
