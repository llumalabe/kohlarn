const { google } = require('googleapis');
const path = require('path');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA';
const SHEET_NAME = 'AccommodationTypes';

// Cache for sheet ID
let cachedSheetId = null;

// Get sheet ID by name
async function getSheetId() {
    if (cachedSheetId !== null) {
        return cachedSheetId;
    }
    
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });
        
        const sheet = response.data.sheets.find(s => s.properties.title === SHEET_NAME);
        if (!sheet) {
            throw new Error(`Sheet "${SHEET_NAME}" not found. Please create it first.`);
        }
        
        cachedSheetId = sheet.properties.sheetId;
        return cachedSheetId;
    } catch (error) {
        console.error('Error getting sheet ID:', error.message);
        throw error;
    }
}

// Helper function to convert row to accommodation type object
function rowToAccommodationType(row) {
    if (!row || row.length === 0) return null;
    
    return {
        id: row[0] || '',
        nameTh: row[1] || '',
        nameEn: row[2] || '',
        icon: row[3] || '',
        color: row[4] || '',
        createdAt: row[5] || '',
        updatedAt: row[6] || ''
    };
}

// Helper function to convert accommodation type object to row
function accommodationTypeToRow(type) {
    return [
        type.id || '',
        type.nameTh || '',
        type.nameEn || '',
        type.icon || '',
        type.color || '',
        type.createdAt || '',
        type.updatedAt || ''
    ];
}

// Get all accommodation types
async function getAllAccommodationTypes() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:G`, // Skip header row
        });

        const rows = response.data.values || [];
        return rows.map(rowToAccommodationType).filter(type => type && type.id);
    } catch (error) {
        console.error('Error reading accommodation types from Google Sheets:', error.message);
        throw error;
    }
}

// Get accommodation type by ID
async function getAccommodationTypeById(id) {
    const types = await getAllAccommodationTypes();
    return types.find(type => type.id === id);
}

// Create new accommodation type
async function createAccommodationType(typeData) {
    try {
        // Generate ID if not provided
        if (!typeData.id) {
            typeData.id = `type-${Date.now()}`;
        }
        
        // Add timestamps
        typeData.createdAt = new Date().toISOString();
        typeData.updatedAt = new Date().toISOString();
        
        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:G`,
            valueInputOption: 'RAW',
            resource: {
                values: [accommodationTypeToRow(typeData)]
            }
        });
        
        return typeData;
    } catch (error) {
        console.error('Error creating accommodation type:', error.message);
        throw error;
    }
}

// Update accommodation type
async function updateAccommodationType(id, updates) {
    try {
        // Get all types to find the row number
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:G`,
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex === -1) {
            throw new Error('Accommodation type not found');
        }
        
        // Get existing data
        const existingType = rowToAccommodationType(rows[rowIndex]);
        
        // Merge updates
        const updatedType = {
            ...existingType,
            ...updates,
            id: existingType.id, // Preserve ID
            createdAt: existingType.createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };
        
        // Update the row (rowIndex + 2 because: +1 for header, +1 for 0-based to 1-based)
        const sheetRow = rowIndex + 2;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A${sheetRow}:G${sheetRow}`,
            valueInputOption: 'RAW',
            resource: {
                values: [accommodationTypeToRow(updatedType)]
            }
        });
        
        return updatedType;
    } catch (error) {
        console.error('Error updating accommodation type:', error.message);
        throw error;
    }
}

// Delete accommodation type
async function deleteAccommodationType(id) {
    try {
        // Get all types to find the row number
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:G`,
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex === -1) {
            throw new Error('Accommodation type not found');
        }
        
        const deletedType = rowToAccommodationType(rows[rowIndex]);
        
        // Get the correct sheet ID
        const sheetId = await getSheetId();
        
        // Delete the row (rowIndex + 1 because we're looking at A2:G range, so add 1 to get actual sheet row)
        const sheetRow = rowIndex + 2; // +2 because: +1 for header row, +1 for 1-based indexing
        
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetId, // Use the dynamically fetched sheet ID
                            dimension: 'ROWS',
                            startIndex: sheetRow - 1, // 0-based for the API
                            endIndex: sheetRow // exclusive
                        }
                    }
                }]
            }
        });
        
        return deletedType;
    } catch (error) {
        console.error('Error deleting accommodation type:', error.message);
        throw error;
    }
}

module.exports = {
    getAllAccommodationTypes,
    getAccommodationTypeById,
    createAccommodationType,
    updateAccommodationType,
    deleteAccommodationType
};
