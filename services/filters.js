const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Cache configuration
const CACHE_DURATION = 30 * 1000; // 30 seconds
let filtersCache = {
    data: null,
    timestamp: 0
};

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

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

const FILTERS_SHEET = 'Filters';

// Default filters with colors
const DEFAULT_FILTERS = [
  { id: 'beachfront', nameTh: 'ติดทะเล', nameEn: 'Beachfront', icon: 'fa-umbrella-beach', color: '#667eea' },
  { id: 'breakfast', nameTh: 'รวมอาหารเช้า', nameEn: 'Breakfast Included', icon: 'fa-utensils', color: '#f093fb' },
  { id: 'freeShuttle', nameTh: 'ฟรีรถรับส่ง', nameEn: 'Free Shuttle', icon: 'fa-bus', color: '#4facfe' },
  { id: 'freeMotorcycle', nameTh: 'ฟรีมอไซค์', nameEn: 'Free Motorcycle', icon: 'fa-motorcycle', color: '#43e97b' },
  { id: 'bathtub', nameTh: 'มีอ่างอาบน้ำ', nameEn: 'Bathtub', icon: 'fa-bath', color: '#fa709a' },
  { id: 'poolVilla', nameTh: 'พลูวิลล่า', nameEn: 'Pool Villa', icon: 'fa-swimming-pool', color: '#30cfd0' },
  { id: 'poolTable', nameTh: 'โต๊ะพลู', nameEn: 'Pool Table', icon: 'fa-table-tennis', color: '#a8edea' }
];

/**
 * Get all filters
 */
async function getFilters() {
  // Check cache first
  const now = Date.now();
  if (filtersCache.data && (now - filtersCache.timestamp) < CACHE_DURATION) {
    return filtersCache.data;
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FILTERS_SHEET}!A2:F`,
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return []; // ไม่มีข้อมูลเริ่มต้น - แสดงเฉพาะข้อมูลจาก Google Sheets
    }

    const filters = rows.map(row => ({
      id: row[0] || '',
      nameTh: row[1] || '',
      nameEn: row[2] || '',
      icon: row[3] || 'fa-tag',
      enabled: row[4] !== 'false', // Default to true
      color: row[5] || '#667eea' // Default color
    }));

    const enabledFilters = filters.filter(f => f.enabled !== false);

    // Update cache
    filtersCache = {
      data: enabledFilters,
      timestamp: Date.now()
    };

    return enabledFilters;
  } catch (error) {
    console.error('Error fetching filters:', error);
    // Return stale cache if available
    if (filtersCache.data) {
      return filtersCache.data;
    }
    return []; // เกิด error - return array ว่าง
  }
}

/**
 * Add new filter
 */
async function addFilter(filter) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }

  try {
    const newRow = [
      filter.id || `filter-${Date.now()}`,
      filter.nameTh || '',
      filter.nameEn || '',
      filter.icon || 'fa-tag',
      'true',
      filter.color || '#667eea'
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FILTERS_SHEET}!A:F`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newRow]
      }
    });

    // Clear cache after mutation
    clearFiltersCache();

    return { success: true };
  } catch (error) {
    console.error('Error adding filter:', error);
    throw error;
  }
}

/**
 * Update filter
 */
async function updateFilter(filterId, filter) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FILTERS_SHEET}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === filterId);

    if (rowIndex === -1) {
      throw new Error('Filter not found');
    }

    const updatedRow = [
      filterId,
      filter.nameTh || '',
      filter.nameEn || '',
      filter.icon || 'fa-tag',
      filter.enabled !== false ? 'true' : 'false',
      filter.color || '#667eea'
    ];

    const actualRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FILTERS_SHEET}!A${actualRow}:F${actualRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      }
    });

    // Clear cache after mutation
    clearFiltersCache();

    return { success: true };
  } catch (error) {
    console.error('Error updating filter:', error);
    throw error;
  }
}

/**
 * Delete filter
 */
async function deleteFilter(filterId) {
  if (!canWrite) {
    throw new Error('Write access not available. Please configure Service Account.');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FILTERS_SHEET}!A2:A`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === filterId);

    if (rowIndex === -1) {
      throw new Error('Filter not found');
    }

    const actualRow = rowIndex + 2;
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 165688737, // Filters sheet ID
              dimension: 'ROWS',
              startIndex: actualRow - 1,
              endIndex: actualRow
            }
          }
        }]
      }
    });

    // Clear cache after mutation
    clearFiltersCache();

    return { success: true };
  } catch (error) {
    console.error('Error deleting filter:', error);
    throw error;
  }
}

/**
 * Clear the filters cache
 */
function clearFiltersCache() {
  filtersCache = { data: null, timestamp: 0 };
}

module.exports = {
  getFilters,
  addFilter,
  updateFilter,
  deleteFilter,
  DEFAULT_FILTERS,
  clearFiltersCache
};
