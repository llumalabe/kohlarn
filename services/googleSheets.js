const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const activityLogService = require('./activityLog');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
let hotelsCache = {
  data: null,
  timestamp: 0
};

// Cache for users data
let usersCache = {
  data: null,
  timestamp: 0
};

// Cache for web settings
let webSettingsCache = {
  data: null,
  timestamp: 0
};

// Rate limiting queue
const requestQueue = [];
let isProcessingQueue = false;
const REQUEST_DELAY = 100; // 100ms between requests (max 600 requests/minute, well under 60/minute limit)

// Try to use Service Account for read/write, fallback to API Key for read-only
let sheets;
let canWrite = false;

try {
  let serviceAccount;
  
  // Debug: Log environment variable availability
  // Try to get service account from environment variable (for cloud deployment)
  if (process.env.SERVICE_ACCOUNT_BASE64) {
    const base64 = process.env.SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  } else if (process.env.SERVICE_ACCOUNT_JSON) {
    const jsonString = process.env.SERVICE_ACCOUNT_JSON;
    console.log('  - First 50 chars:', jsonString.substring(0, 50));
    serviceAccount = JSON.parse(jsonString);
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
    console.log('✅ Using Service Account - Full access (read/write)');
  } else {
    // Use API Key (read-only)
    sheets = google.sheets({ version: 'v4', auth: API_KEY });
  }
} catch (error) {
  // Fallback to API Key
  console.error('❌ Service Account error:', error.message);
  sheets = google.sheets({ version: 'v4', auth: API_KEY });
}

// Sheet names
const HOTELS_SHEET = 'Hotels';
const USERS_SHEET = 'Users';
const FILTERS_SHEET = 'Filters';
const ACTIVITY_LOG_SHEET = 'ActivityLog';
const WEBSETTINGS_SHEET = 'WebSettings';

/**
 * Rate limiting helper - throttles API requests
 */
async function throttleRequest(requestFn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ requestFn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { requestFn, resolve, reject } = requestQueue.shift();
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    }
    
    // Wait before processing next request
    if (requestQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
  }
  
  isProcessingQueue = false;
}

/**
 * Clear all caches
 */
function clearAllCaches() {
  hotelsCache.data = null;
  hotelsCache.timestamp = 0;
  usersCache.data = null;
  usersCache.timestamp = 0;
  webSettingsCache.data = null;
  webSettingsCache.timestamp = 0;
  console.log('🗑️ All caches cleared');
}

/**
 * Get all hotels from Google Sheets (with caching)
 */
async function getHotels() {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (hotelsCache.data && (now - hotelsCache.timestamp) < CACHE_DURATION) {
      console.log('✅ Returning cached hotels data (age:', Math.round((now - hotelsCache.timestamp) / 1000), 'seconds)');
      return hotelsCache.data;
    }
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOTELS_SHEET}!A2:Z`, // Extended to Z for accommodationTypes
    });

    const rows = response.data.values || [];
    const hotels = rows.map((row, index) => {
      // Clean ID - remove leading single quote if exists
      let id = row[0] || `hotel-${index + 1}`;
      if (id.startsWith("'")) {
        id = id.substring(1);
      }
      
      // Clean phone number - remove leading single quote if exists
      let phone = row[6] || '';
      if (phone.startsWith("'")) {
        phone = phone.substring(1);
      }
      
      // Collect all image URLs (up to 5)
      const images = [
        row[5] || '',  // imageUrl1 (F)
        row[19] || '', // imageUrl2 (T)
        row[20] || '', // imageUrl3 (U)
        row[21] || '', // imageUrl4 (V)
        row[22] || ''  // imageUrl5 (W)
      ].filter(url => url.trim() !== ''); // Remove empty URLs
      
      return {
        id: id,
        nameTh: row[1] || '',
        nameEn: row[2] || '',
        priceStart: parseFloat(row[3]) || 0,
        priceEnd: parseFloat(row[4]) || 0,
        imageUrl: row[5] || '', // Keep for backward compatibility
        images: images, // New: Array of all images
        phone: phone,
        ownerName: row[7] || '',
        createdBy: row[8] || '',
        lastModified: row[9] || '',
        modifiedBy: row[10] || '', // Column K - แก้ไขโดย
        lineId: row[11] || '', // Column L - Line ID
        maxGuests: parseInt(row[12]) || 1, // Column M - รองรับลูกค้าสูงสุด
        facebookUrl: row[13] || '', // Column N - Facebook URL
        websiteUrl: row[14] || '', // Column O - เว็บไซต์โรงแรม
        filters: row[15] || '', // Column P - ตัวกรอง (comma-separated)
        bankName: row[16] || '', // Column Q - ชื่อธนาคาร
        accountName: row[17] || '', // Column R - ชื่อบัญชี
        accountNumber: row[18] || '', // Column S - เลขบัญชี
        imageUrl2: row[19] || '', // Column T - รูปที่ 2
        imageUrl3: row[20] || '', // Column U - รูปที่ 3
        imageUrl4: row[21] || '', // Column V - รูปที่ 4
        imageUrl5: row[22] || '', // Column W - รูปที่ 5
        status: row[23] || 'active', // Column X - สถานะ (active/inactive)
        roomTypes: row[24] || '', // Column Y - ประเภทห้องพัก (comma-separated)
        accommodationTypes: row[25] || '' // Column Z - ประเภทที่พัก (comma-separated)
      };
    });

    // Update cache
    hotelsCache.data = hotels;
    hotelsCache.timestamp = Date.now();
    return hotels;
  } catch (error) {
    console.error('Error fetching hotels from Google Sheets:', error);
    
    // Return cached data if available (even if expired) when API fails
    if (hotelsCache.data) {
      return hotelsCache.data;
    }
    
    throw error;
  }
}

/**
 * Clear hotels cache (call after adding/updating/deleting hotels)
 */
function clearHotelsCache() {
  hotelsCache.data = null;
  hotelsCache.timestamp = 0;
}

/**
 * Get single hotel by ID
 */
async function getHotelById(hotelId) {
  try {
    const hotels = await getHotels();
    return hotels.find(h => h.id === hotelId) || null;
  } catch (error) {
    console.error('Error fetching hotel by ID:', error);
    return null;
  }
}

/**
 * Get admin password from Google Sheets
 */
async function getAdminPassword() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ADMIN_SHEET}!B2`,
    });

    const password = response.data.values?.[0]?.[0] || 'admin123';
    return password;
  } catch (error) {
    console.error('Error fetching admin password:', error);
    return 'admin123'; // Default password
  }
}

/**
 * Validate admin password (Google Sheets only)
 */
async function validateAdminPassword(inputPassword) {
  // Check Google Sheets password
  const actualPassword = await getAdminPassword();
  if (inputPassword === actualPassword) {
    return { 
      valid: true, 
      isTemporary: false,
      message: '✅ เข้าสู่ระบบสำเร็จ'
    };
  }
  
  return { 
    valid: false, 
    isTemporary: false,
    message: '❌ รหัสผ่านไม่ถูกต้อง'
  };
}

/**
 * Add a new hotel to Google Sheets
 */
async function addHotel(hotel, editorNickname = '') {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }
  
  try {
    const timestamp = new Date().toLocaleString('th-TH', { 
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newRow = [
      hotel.id ? `'${hotel.id}` : `'hotel-${Date.now()}`,  // A - ID (เพิ่ม ' เพื่อเก็บเลข 0 ด้านหน้า)
      hotel.nameTh || '',                           // B - ชื่อไทย
      hotel.nameEn || '',                           // C - ชื่ออังกฤษ
      hotel.priceStart || 0,                        // D - ราคาต่ำสุด
      hotel.priceEnd || hotel.priceStart || 0,      // E - ราคาสูงสุด
      hotel.imageUrl || '',                         // F - รูปภาพหลัก
      hotel.phone ? `'${hotel.phone}` : '',        // G - เบอร์โทร (เพิ่ม ' เพื่อเก็บเป็น text)
      hotel.ownerName || '',                        // H - ชื่อเจ้าของ
      editorNickname,                               // I - ผู้สร้าง
      timestamp,                                    // J - วันที่สร้าง
      editorNickname,                               // K - แก้ไขโดย
      hotel.lineId || '',                           // L - Line ID
      hotel.maxGuests || 1,                         // M - รองรับลูกค้า
      hotel.facebookUrl || '',                      // N - Facebook URL
      hotel.websiteUrl || '',                       // O - เว็บไซต์โรงแรม
      hotel.filters || '',                          // P - ตัวกรอง
      hotel.bankName || '',                         // Q - ชื่อธนาคาร
      hotel.accountName || '',                      // R - ชื่อบัญชี
      hotel.accountNumber ? `'${hotel.accountNumber}` : '', // S - เลขบัญชี (เพิ่ม ' เพื่อเก็บเลข 0 ด้านหน้า)
      hotel.imageUrl2 || '',                        // T - รูปที่ 2
      hotel.imageUrl3 || '',                        // U - รูปที่ 3
      hotel.imageUrl4 || '',                        // V - รูปที่ 4
      hotel.imageUrl5 || '',                        // W - รูปที่ 5
      hotel.status || 'active',                     // X - สถานะ (active/inactive)
      hotel.roomTypes || '',                        // Y - ประเภทห้องพัก (comma-separated)
      hotel.accommodationTypes || ''                // Z - ประเภทที่พัก (comma-separated)
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOTELS_SHEET}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow]
      }
    });

    // Clear cache after adding hotel
    clearHotelsCache();

    return { success: true };
  } catch (error) {
    console.error('Error adding hotel:', error);
    throw error;
  }
}

/**
 * Update hotel in Google Sheets
 */
async function updateHotel(hotelId, hotel, editorNickname = '') {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }
  
  try {
    // First, get current hotel data for comparison
    const currentHotels = await getHotels();
    const currentHotel = currentHotels.find(h => h.id === hotelId);
    
    if (!currentHotel) {
      throw new Error('Hotel not found');
    }

    // Track changes for activity log
    const changes = [];
    const fieldNames = {
      nameTh: 'ชื่อไทย',
      nameEn: 'ชื่ออังกฤษ',
      priceStart: 'ราคาต่ำสุด',
      priceEnd: 'ราคาสูงสุด',
      phone: 'เบอร์โทร',
      ownerName: 'ชื่อเจ้าของ',
      lineId: 'Line ID',
      maxGuests: 'รองรับลูกค้าสูงสุด',
      facebookUrl: 'Facebook',
      websiteUrl: 'เว็บไซต์',
      filters: 'สิ่งอำนวยความสะดวก',
      bankName: 'ธนาคาร',
      accountName: 'ชื่อบัญชี',
      accountNumber: 'เลขบัญชี',
      roomTypes: 'ประเภทห้องพัก',
      accommodationTypes: 'ประเภทที่พัก',
      status: 'สถานะ'
    };

    // Compare and track changes
    Object.keys(fieldNames).forEach(key => {
      const oldValue = String(currentHotel[key] || '');
      const newValue = String(hotel[key] || '');
      
      if (oldValue !== newValue) {
        changes.push({
          field: fieldNames[key],
          oldValue: oldValue || '(ว่าง)',
          newValue: newValue || '(ว่าง)'
        });
      }
    });

    // Find the row for update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOTELS_SHEET}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === hotelId);

    if (rowIndex === -1) {
      throw new Error('Hotel not found');
    }

    const timestamp = new Date().toLocaleString('th-TH', { 
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedRow = [
      hotelId ? `'${hotelId}` : '',                // A - ID (เพิ่ม ' เพื่อเก็บเลข 0 ด้านหน้า)
      hotel.nameTh || '',                           // B - ชื่อไทย
      hotel.nameEn || '',                           // C - ชื่ออังกฤษ
      hotel.priceStart || 0,                        // D - ราคาต่ำสุด
      hotel.priceEnd || hotel.priceStart || 0,      // E - ราคาสูงสุด
      hotel.imageUrl || '',                         // F - รูปภาพหลัก
      hotel.phone ? `'${hotel.phone}` : '',        // G - เบอร์โทร (เพิ่ม ' เพื่อเก็บเป็น text)
      hotel.ownerName || '',                        // H - ชื่อเจ้าของ
      '', // I - ผู้สร้าง (ไม่แก้ไขเมื่อ update)
      timestamp,                                    // J - วันที่แก้ไขล่าสุด
      editorNickname,                               // K - แก้ไขโดย
      hotel.lineId || '',                           // L - Line ID
      hotel.maxGuests || 1,                         // M - รองรับลูกค้า
      hotel.facebookUrl || '',                      // N - Facebook URL
      hotel.websiteUrl || '',                       // O - เว็บไซต์โรงแรม
      hotel.filters || '',                          // P - ตัวกรอง
      hotel.bankName || '',                         // Q - ชื่อธนาคาร
      hotel.accountName || '',                      // R - ชื่อบัญชี
      hotel.accountNumber ? `'${hotel.accountNumber}` : '', // S - เลขบัญชี (เพิ่ม ' เพื่อเก็บเลข 0 ด้านหน้า)
      hotel.imageUrl2 || '',                        // T - รูปที่ 2
      hotel.imageUrl3 || '',                        // U - รูปที่ 3
      hotel.imageUrl4 || '',                        // V - รูปที่ 4
      hotel.imageUrl5 || '',                        // W - รูปที่ 5
      hotel.status || 'active',                     // X - สถานะ (active/inactive)
      hotel.roomTypes || '',                        // Y - ประเภทห้องพัก (comma-separated)
      hotel.accommodationTypes || ''                // Z - ประเภทที่พัก (comma-separated)
    ];

    const actualRow = rowIndex + 2; // +2 because: 1 for header, 1 for 0-index
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOTELS_SHEET}!A${actualRow}:Z${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      }
    });

    // Log activity with before/after format
    if (changes.length > 0) {
      const beforeLines = changes.map(c => `${c.field}: ${c.oldValue}`).join('\n');
      const afterLines = changes.map(c => `${c.field}: ${c.newValue}`).join('\n');
      const details = `ก่อน:\n${beforeLines}\nหลัง:\n${afterLines}`;

      await activityLogService.logActivity(
        'admin',
        editorNickname,
        'แก้ไขข้อมูลโรงแรม',
        hotel.nameTh || currentHotel.nameTh,
        'hotel',
        details
      );
    }

    // Clear cache after updating hotel
    clearHotelsCache();

    return { success: true };
  } catch (error) {
    console.error('Error updating hotel:', error);
    throw error;
  }
}

/**
 * Delete hotel from Google Sheets
 */
async function deleteHotel(hotelId) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }
  
  try {
    // Find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOTELS_SHEET}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === hotelId);

    if (rowIndex === -1) {
      throw new Error('Hotel not found');
    }

    const actualRow = rowIndex + 2;
    
    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assumes Hotels is the first sheet
              dimension: 'ROWS',
              startIndex: actualRow - 1,
              endIndex: actualRow
            }
          }
        }]
      }
    });

    // Clear cache after deleting hotel
    clearHotelsCache();

    return { success: true };
  } catch (error) {
    console.error('Error deleting hotel:', error);
    throw error;
  }
}

/**
 * Toggle hotel status (active/inactive)
 */
async function toggleHotelStatus(hotelId, newStatus) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }
  
  try {
    // Find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOTELS_SHEET}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => {
      let id = row[0];
      if (id && id.startsWith("'")) {
        id = id.substring(1);
      }
      return id === hotelId;
    });

    if (rowIndex === -1) {
      throw new Error('Hotel not found');
    }

    const actualRow = rowIndex + 2;
    
    // Update only status column (X)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOTELS_SHEET}!X${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[newStatus]]
      }
    });

    return { success: true, status: newStatus };
  } catch (error) {
    console.error('Error toggling hotel status:', error);
    throw error;
  }
}

/**
 * Get all web settings from Google Sheets
 */
async function getWebSettings() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${WEBSETTINGS_SHEET}!A2:B`,
    });

    const rows = response.data.values || [];
    const settings = {};

    rows.forEach(row => {
      if (row[0]) {
        settings[row[0]] = row[1] || '';
      }
    });

    return settings;
  } catch (error) {
    console.error('Error fetching web settings:', error);
    // Return default settings if sheet doesn't exist or error occurs
    return {
      site_name_th: 'ค้นหาโรงแรมเกาะล้าน',
      site_name_en: 'Koh Larn Hotel Search Engine',
      site_name_th_color: '#2d3436',
      site_name_en_color: '#636e72',
      header_bg_color: '#ffffff',
      body_bg_gradient_start: '#667eea',
      body_bg_gradient_end: '#764ba2',
      filter_button_bg_start: '#667eea',
      filter_button_bg_end: '#764ba2',
      card_hotel_name_color: '#2d3436',
      card_price_color: '#0066cc',
      favicon_type: 'emoji',
      favicon_emoji: '🏝️',
      favicon_url: '',
      footer_text: '2025 Koh Larn Hotel Search',
      footer_text_color: '#ffffff'
    };
  }
}

/**
 * Update web settings in Google Sheets
 */
async function updateWebSettings(settings, modifiedBy = 'Admin') {
  if (!canWrite) {
    throw new Error('Cannot update settings: read-only access');
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

    // Get current settings to track changes
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${WEBSETTINGS_SHEET}!A2:D`,
    });

    const rows = response.data.values || [];
    const updates = [];
    const changedSettings = [];

    // Update each setting and track changes
    Object.keys(settings).forEach(key => {
      const rowIndex = rows.findIndex(row => row[0] === key);
      
      if (rowIndex !== -1) {
        const oldValue = rows[rowIndex][1] || '';
        const newValue = settings[key];
        
        // Only update if value changed
        if (oldValue !== newValue) {
          const actualRow = rowIndex + 2; // +2 because header is row 1 and array is 0-indexed
          updates.push({
            range: `${WEBSETTINGS_SHEET}!B${actualRow}:D${actualRow}`,
            values: [[newValue, timestamp, modifiedBy]]
          });
          
          // Track change for activity log
          changedSettings.push({
            field: key,
            oldValue: oldValue,
            newValue: newValue
          });
        }
      }
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      // Log activity with proper before/after format
      const beforeLines = changedSettings.map(change => `${change.field}: ${change.oldValue}`).join('\n');
      const afterLines = changedSettings.map(change => `${change.field}: ${change.newValue}`).join('\n');
      
      const details = `ก่อน:\n${beforeLines}\nหลัง:\n${afterLines}`;
      
      await logActivity({
        username: 'admin',
        nickname: modifiedBy,
        action: 'แก้ไขการตั้งค่าเว็บไซต์',
        type: 'system',
        details: details,
        hotelName: '',
        timestamp: new Date().toISOString()
      });
    }

    return { success: true, updated: updates.length };
  } catch (error) {
    console.error('Error updating web settings:', error);
    throw error;
  }
}

/**
 * Get hotel clicks from Google Sheets
 */
async function getHotelClicks() {
  if (!SPREADSHEET_ID) {
    throw new Error('Google Sheet ID not configured');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'HotelClicks!A2:C',
      key: API_KEY
    });

    const rows = response.data.values || [];
    const clicks = {};
    
    rows.forEach(row => {
      const hotelId = row[0];
      const clickCount = parseInt(row[1]) || 0;
      const lastClicked = row[2] || '';
      
      if (hotelId) {
        clicks[hotelId] = {
          count: clickCount,
          lastClicked: lastClicked
        };
      }
    });

    return clicks;
  } catch (error) {
    console.error('Error getting hotel clicks:', error);
    return {};
  }
}

/**
 * Update hotel click count in Google Sheets
 */
async function updateHotelClick(hotelId) {
  if (!canWrite) {
    console.warn('⚠️ Cannot write to Google Sheets (read-only mode)');
    return false;
  }

  try {
    // Get current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'HotelClicks!A2:C'
    });

    const rows = response.data.values || [];
    let rowIndex = -1;
    let currentCount = 0;

    // Find existing row
    rows.forEach((row, index) => {
      if (row[0] === String(hotelId)) {
        rowIndex = index + 2; // +2 because sheet is 1-indexed and we start from row 2
        currentCount = parseInt(row[1]) || 0;
      }
    });

    const newCount = currentCount + 1;
    const timestamp = new Date().toISOString();

    if (rowIndex > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `HotelClicks!B${rowIndex}:C${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newCount, timestamp]]
        }
      });
    } else {
      // Add new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'HotelClicks!A2:C',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[hotelId, newCount, timestamp]]
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating hotel click:', error);
    return false;
  }
}

/**
 * Get hotel likes from Google Sheets
 */
async function getHotelLikes() {
  if (!SPREADSHEET_ID) {
    throw new Error('Google Sheet ID not configured');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Likes!A2:C',
      key: API_KEY
    });

    const rows = response.data.values || [];
    const likes = {};
    
    rows.forEach(row => {
      const hotelId = row[0];
      const likeCount = parseInt(row[1]) || 0;
      const lastUpdated = row[2] || '';
      
      if (hotelId) {
        likes[hotelId] = {
          count: likeCount,
          lastUpdated: lastUpdated
        };
      }
    });

    return likes;
  } catch (error) {
    console.error('Error getting hotel likes:', error);
    return {};
  }
}

/**
 * Update hotel like count in Google Sheets
 */
async function updateHotelLike(hotelId, increment = true) {
  if (!canWrite) {
    console.warn('⚠️ Cannot write to Google Sheets (read-only mode)');
    return false;
  }

  try {
    // Get current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Likes!A2:C'
    });

    const rows = response.data.values || [];
    let rowIndex = -1;
    let currentCount = 0;

    // Find existing row
    rows.forEach((row, index) => {
      if (row[0] === String(hotelId)) {
        rowIndex = index + 2;
        currentCount = parseInt(row[1]) || 0;
      }
    });

    const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
    const timestamp = new Date().toISOString();

    if (rowIndex > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Likes!B${rowIndex}:C${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[newCount, timestamp]]
        }
      });
    } else {
      // Add new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Likes!A2:C',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[hotelId, newCount, timestamp]]
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating hotel like:', error);
    return false;
  }
}

module.exports = {
  getHotels,
  getHotelById,
  getAdminPassword,
  validateAdminPassword,
  addHotel,
  updateHotel,
  deleteHotel,
  toggleHotelStatus,
  getWebSettings,
  updateWebSettings,
  clearHotelsCache,
  clearAllCaches,
  getHotelClicks,
  updateHotelClick,
  getHotelLikes,
  updateHotelLike
};
