const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLICKS_SHEET = 'HotelClicks';
const CLICKS_HISTORY_SHEET = 'ClicksHistory';

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
 * Record click history (for period filtering)
 */
async function recordClickHistory(hotelId, ip = '', userAgent = '') {
    try {
        const timestamp = new Date().toISOString();
        
        // Append to history sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CLICKS_HISTORY_SHEET}!A2:D`,
            valueInputOption: 'RAW',
            resource: {
                values: [[String(hotelId), ip, timestamp, userAgent]]
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error recording click history:', error);
        return false;
    }
}

/**
 * Record a click on hotel card
 */
async function recordClick(hotelId, ip = '', userAgent = '') {
    try {
        // 1. Record in history sheet (for period filtering)
        await recordClickHistory(hotelId, ip, userAgent);
        
        // 2. Update total count in main sheet
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
 * Get Thailand time (UTC+7)
 */
function getThailandTime() {
    const now = new Date();
    // แปลงเป็นเวลาไทย (UTC+7)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const thailandTime = new Date(utc + (3600000 * 7));
    return thailandTime;
}

/**
 * Get click statistics for a period from history
 */
async function getClickStats(period = 'day') {
    try {
        // Get history data
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CLICKS_HISTORY_SHEET}!A2:D`,
        });

        const rows = response.data.values || [];
        const now = getThailandTime();
        let startTime;

        // Calculate start time based on period
        switch (period) {
            case 'day':
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                startTime = startOfDay.getTime();
                break;
            case 'week':
                const startOfWeek = new Date(now);
                const dayOfWeek = now.getDay();
                const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                startOfWeek.setDate(now.getDate() - daysToMonday);
                startOfWeek.setHours(0, 0, 0, 0);
                startTime = startOfWeek.getTime();
                break;
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                startTime = startOfMonth.getTime();
                break;
            case 'year':
                const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
                startTime = startOfYear.getTime();
                break;
            case 'all':
                startTime = 0;
                break;
            default:
                const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                startTime = defaultStart.getTime();
        }

        // Filter by period
        const stats = {
            total: 0,
            byHotel: {}
        };

        rows.forEach(row => {
            const hotelId = row[0];
            const timestamp = row[2];
            
            if (hotelId && timestamp) {
                const clickTime = new Date(timestamp).getTime();
                
                if (clickTime >= startTime) {
                    stats.total++;
                    stats.byHotel[hotelId] = (stats.byHotel[hotelId] || 0) + 1;
                }
            }
        });

        return stats;
    } catch (error) {
        console.error('Error getting click stats:', error);
        return { total: 0, byHotel: {} };
    }
}

/**
 * Get top clicked hotels for a specific period
 */
async function getTopClickedHotels(period = 'day', sortBy = 'most', limit = 10) {
    try {
        const stats = await getClickStats(period);
        
        const hotelsArray = Object.entries(stats.byHotel).map(([hotelId, count]) => ({
            hotelId,
            clicks: count
        }));

        // Sort
        hotelsArray.sort((a, b) => {
            if (sortBy === 'most') {
                return b.clicks - a.clicks;
            } else {
                return a.clicks - b.clicks;
            }
        });

        return hotelsArray.slice(0, limit);
    } catch (error) {
        console.error('Error getting top clicked hotels:', error);
        return [];
    }
}

module.exports = {
    recordClick,
    getHotelClicks,
    getTopClickedHotels,
    getClickStats,
    getAllClicks
};
