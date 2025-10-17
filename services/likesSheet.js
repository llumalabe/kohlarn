const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const LIKES_SHEET = 'Likes';

// Initialize Google Sheets API
let sheets;
let serviceAccount;

try {
    // Priority 1: Environment variable (base64 encoded) - for Vercel
    if (process.env.SERVICE_ACCOUNT_BASE64) {
        console.log('📦 Using SERVICE_ACCOUNT_BASE64 from environment variable');
        const base64 = process.env.SERVICE_ACCOUNT_BASE64;
        const json = Buffer.from(base64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(json);
    }
    // Priority 2: Environment variable (JSON string) - for other cloud platforms
    else if (process.env.SERVICE_ACCOUNT_JSON) {
        console.log('📦 Using SERVICE_ACCOUNT_JSON from environment variable');
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
        console.log('✅ Likes service initialized with Google Sheets');
    }
} catch (error) {
    console.error('❌ Error loading service account for likes:', error.message);
}

/**
 * Get sheet ID by name
 */
async function getSheetId() {
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheet = response.data.sheets.find(s => s.properties.title === LIKES_SHEET);
        if (!sheet) {
            // Create sheet if doesn't exist
            await createLikesSheet();
            return await getSheetId(); // Recursive call to get the newly created sheet ID
        }

        return sheet.properties.sheetId;
    } catch (error) {
        console.error('Error getting sheet ID:', error.message);
        throw error;
    }
}

/**
 * Create Likes sheet with headers
 */
async function createLikesSheet() {
    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    addSheet: {
                        properties: {
                            title: LIKES_SHEET,
                        }
                    }
                }]
            }
        });

        // Add headers
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_SHEET}!A1:C1`,
            valueInputOption: 'RAW',
            resource: {
                values: [['Hotel ID', 'Like Count', 'Last Updated']]
            }
        });

        console.log('✅ Created Likes sheet with headers');
    } catch (error) {
        console.error('Error creating Likes sheet:', error.message);
        throw error;
    }
}

/**
 * Get all likes from Google Sheets
 */
async function getAllLikes() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_SHEET}!A2:C`,
        });

        const rows = response.data.values || [];
        const likes = { hotels: {} };

        rows.forEach(row => {
            if (row[0]) { // Hotel ID exists
                likes.hotels[row[0]] = {
                    count: parseInt(row[1]) || 0,
                    lastUpdated: row[2] || new Date().toISOString()
                };
            }
        });

        return likes;
    } catch (error) {
        console.error('Error getting likes:', error.message);
        return { hotels: {} };
    }
}

/**
 * Get likes for a specific hotel
 */
async function getHotelLikes(hotelId) {
    try {
        const allLikes = await getAllLikes();
        return allLikes.hotels[hotelId] || { count: 0, lastUpdated: new Date().toISOString() };
    } catch (error) {
        console.error('Error getting hotel likes:', error);
        return { count: 0, lastUpdated: new Date().toISOString() };
    }
}

/**
 * Update likes for a specific hotel
 */
async function updateHotelLikes(hotelId, increment = true) {
    try {
        // Get current likes
        const allLikes = await getAllLikes();
        const currentLikes = allLikes.hotels[hotelId] || { count: 0, lastUpdated: new Date().toISOString() };

        // Update count
        const newCount = increment ? currentLikes.count + 1 : Math.max(0, currentLikes.count - 1);
        const lastUpdated = new Date().toISOString();

        // Find row index for this hotel
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_SHEET}!A2:A`,
        });

        const rows = response.data.values || [];
        let rowIndex = -1;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === String(hotelId)) {
                rowIndex = i + 2; // +2 because index starts at 0 and we skip header row
                break;
            }
        }

        if (rowIndex > 0) {
            // Update existing row
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${LIKES_SHEET}!A${rowIndex}:C${rowIndex}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[String(hotelId), newCount, lastUpdated]]
                }
            });
        } else {
            // Append new row
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${LIKES_SHEET}!A2:C`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[String(hotelId), newCount, lastUpdated]]
                }
            });
        }

        return {
            success: true,
            hotelId: hotelId,
            likes: newCount
        };
    } catch (error) {
        console.error('Error updating hotel likes:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get top liked hotels
 */
async function getTopLikedHotels(limit = 10) {
    try {
        const allLikes = await getAllLikes();
        const hotels = Object.entries(allLikes.hotels)
            .map(([hotelId, data]) => ({
                hotelId,
                likes: data.count,
                lastUpdated: data.lastUpdated
            }))
            .sort((a, b) => b.likes - a.likes)
            .slice(0, limit);

        return hotels;
    } catch (error) {
        console.error('Error getting top liked hotels:', error);
        return [];
    }
}

module.exports = {
    getAllLikes,
    getHotelLikes,
    updateHotelLikes,
    getTopLikedHotels
};
