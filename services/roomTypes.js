const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Sheet configuration
let sheets;
let canWrite = false;

try {
  const serviceAccountPath = path.join(__dirname, '../service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    sheets = google.sheets({ version: 'v4', auth });
    canWrite = true;
  } else {
    const API_KEY = process.env.GOOGLE_API_KEY;
    sheets = google.sheets({ version: 'v4', auth: API_KEY });
  }
} catch (error) {
  const API_KEY = process.env.GOOGLE_API_KEY;
  sheets = google.sheets({ version: 'v4', auth: API_KEY });
}

const ROOM_TYPES_SHEET = 'RoomTypes';

// Default room types with colors
const DEFAULT_ROOM_TYPES = [
  { id: 'standard', nameTh: 'ห้องธรรมดา', nameEn: 'Standard Room', icon: 'fa-bed', color: '#667eea' },
  { id: 'deluxe', nameTh: 'ห้องดีลักซ์', nameEn: 'Deluxe Room', icon: 'fa-star', color: '#f093fb' },
  { id: 'suite', nameTh: 'ห้องสวีท', nameEn: 'Suite', icon: 'fa-crown', color: '#4facfe' },
  { id: 'villa', nameTh: 'วิลล่า', nameEn: 'Villa', icon: 'fa-home', color: '#43e97b' },
  { id: 'bungalow', nameTh: 'บังกะโล', nameEn: 'Bungalow', icon: 'fa-tree', color: '#fa709a' },
  { id: 'familyRoom', nameTh: 'ห้องครอบครัว', nameEn: 'Family Room', icon: 'fa-users', color: '#30cfd0' },
  { id: 'dormitory', nameTh: 'ห้องรวม/ดอร์ม', nameEn: 'Dormitory', icon: 'fa-bed-bunk', color: '#a8edea' }
];

/**
 * Get all room types
 */
async function getRoomTypes() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ROOM_TYPES_SHEET}!A2:F`,
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return []; // ไม่มีข้อมูลเริ่มต้น - แสดงเฉพาะข้อมูลจาก Google Sheets
    }

    const roomTypes = rows.map(row => ({
      id: row[0] || '',
      nameTh: row[1] || '',
      nameEn: row[2] || '',
      icon: row[3] || 'fa-bed',
      enabled: row[4] !== 'false', // Default to true
      color: row[5] || '#667eea' // Default color
    }));

    return roomTypes.filter(f => f.enabled !== false);
  } catch (error) {
    console.error('Error fetching room types:', error);
    return []; // เกิด error - return array ว่าง
  }
}

/**
 * Add new room type
 */
async function addRoomType(roomType) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }

  try {
    const newRow = [
      roomType.id || `room-${Date.now()}`,
      roomType.nameTh || '',
      roomType.nameEn || '',
      roomType.icon || 'fa-bed',
      'true',
      roomType.color || '#667eea'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ROOM_TYPES_SHEET}!A:F`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding room type:', error);
    throw error;
  }
}

/**
 * Update room type
 */
async function updateRoomType(roomTypeId, roomType) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ROOM_TYPES_SHEET}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === roomTypeId);

    if (rowIndex === -1) {
      throw new Error('Room type not found');
    }

    const updatedRow = [
      roomTypeId,
      roomType.nameTh || '',
      roomType.nameEn || '',
      roomType.icon || 'fa-bed',
      roomType.enabled !== false ? 'true' : 'false',
      roomType.color || '#667eea'
    ];

    const actualRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ROOM_TYPES_SHEET}!A${actualRow}:F${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating room type:', error);
    throw error;
  }
}

/**
 * Delete room type
 */
async function deleteRoomType(roomTypeId) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ROOM_TYPES_SHEET}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === roomTypeId);

    if (rowIndex === -1) {
      throw new Error('Room type not found');
    }

    const actualRow = rowIndex + 2;
    
    // Updated with actual RoomTypes sheet ID from Google Sheets
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 3725238, // RoomTypes sheet ID
              dimension: 'ROWS',
              startIndex: actualRow - 1,
              endIndex: actualRow
            }
          }
        }]
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting room type:', error);
    throw error;
  }
}

module.exports = {
  getRoomTypes,
  addRoomType,
  updateRoomType,
  deleteRoomType
};
