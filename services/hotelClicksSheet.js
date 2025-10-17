const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLICKS_SHEET = 'HotelClicks';

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
        console.log('✅ Hotel clicks service initialized with Google Sheets');
    }
} catch (error) {
    console.error('❌ Error loading service account for clicks:', error.message);
}

/**
 * Create HotelClicks sheet with headers
 */
async function createClicksSheet() {
    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    addSheet: {
                        properties: {
                            title: CLICKS_SHEET,
                        }
                    }
                }]
            }
        });

        // Add headers
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CLICKS_SHEET}!A1:C1`,
            valueInputOption: 'RAW',
            resource: {
                values: [['Hotel ID', 'Click Count', 'Last Clicked']]
            }
        });

        console.log('✅ Created HotelClicks sheet with headers');
    } catch (error) {
        console.error('Error creating HotelClicks sheet:', error.message);
    }
}

/**
 * Get all clicks from Google Sheets
 */
async function getAllClicks() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CLICKS_SHEET}!A2:C`,
        });

        const rows = response.data.values || [];
        const clicks = { hotels: {} };

        rows.forEach(row => {
            if (row[0]) { // Hotel ID exists
                clicks.hotels[row[0]] = {
                    count: parseInt(row[1]) || 0,
                    lastClicked: row[2] || new Date().toISOString()
                };
            }
        });

        return clicks;
    } catch (error) {
        // Sheet might not exist yet
        if (error.message.includes('Unable to parse range')) {
            await createClicksSheet();
            return { hotels: {} };
        }
        console.error('Error getting clicks:', error.message);
        return { hotels: {} };
    }
}

/**
 * Record a click on hotel card
 */
async function recordClick(hotelId) {
    try {
        // Get current clicks
        const allClicks = await getAllClicks();
        const currentClicks = allClicks.hotels[hotelId] || { count: 0, lastClicked: new Date().toISOString() };

        // Update count
        const newCount = currentClicks.count + 1;
        const lastClicked = new Date().toISOString();

        // Find row index for this hotel
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CLICKS_SHEET}!A2:A`,
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
                range: `${CLICKS_SHEET}!A${rowIndex}:C${rowIndex}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[String(hotelId), newCount, lastClicked]]
                }
            });
        } else {
            // Append new row
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${CLICKS_SHEET}!A2:C`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[String(hotelId), newCount, lastClicked]]
                }
            });
        }

        return {
            success: true,
            hotelId: hotelId,
            clicks: newCount
        };
    } catch (error) {
        console.error('Error recording click:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get click count for a specific hotel
 */
async function getHotelClicks(hotelId) {
    try {
        const allClicks = await getAllClicks();
        return allClicks.hotels[hotelId] || { count: 0, lastClicked: new Date().toISOString() };
    } catch (error) {
        console.error('Error getting hotel clicks:', error);
        return { count: 0, lastClicked: new Date().toISOString() };
    }
}

/**
 * Get top clicked hotels
 */
async function getTopClickedHotels(limit = 10) {
    try {
        const allClicks = await getAllClicks();
        const hotels = Object.entries(allClicks.hotels)
            .map(([hotelId, data]) => ({
                hotelId,
                clicks: data.count,
                lastClicked: data.lastClicked
            }))
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, limit);

        return hotels;
    } catch (error) {
        console.error('Error getting top clicked hotels:', error);
        return [];
    }
}

/**
 * Get click stats (for admin dashboard)
 */
async function getClickStats() {
    try {
        const allClicks = await getAllClicks();
        const total = Object.values(allClicks.hotels).reduce((sum, hotel) => sum + hotel.count, 0);
        
        return {
            total: total,
            hotels: Object.keys(allClicks.hotels).length
        };
    } catch (error) {
        console.error('Error getting click stats:', error);
        return { total: 0, hotels: 0 };
    }
}

module.exports = {
    recordClick,
    getHotelClicks,
    getTopClickedHotels,
    getClickStats,
    getAllClicks
};
