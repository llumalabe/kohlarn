const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const LIKES_HISTORY_SHEET = 'LikesHistory';

// Cache for likes history stats (30 seconds TTL)
const CACHE_DURATION = 30 * 1000; // 30 seconds
let likesHistoryCache = {
  data: {},  // Store by hotelId as key
  timestamp: {}
};

/**
 * Clear likes history cache
 */
function clearLikesHistoryCache(hotelId = null) {
  if (hotelId) {
    // Clear specific hotel's cache
    delete likesHistoryCache.data[hotelId];
    delete likesHistoryCache.timestamp[hotelId];
    console.log(`🗑️  Likes history cache cleared for hotel ${hotelId}`);
  } else {
    // Clear all cache
    likesHistoryCache = { data: {}, timestamp: {} };
    console.log('🗑️  All likes history cache cleared');
  }
}

// Initialize Google Sheets API
let sheets;
let serviceAccount;

try {
    // Priority 1: Environment variable (base64 encoded) - for Vercel
    if (process.env.SERVICE_ACCOUNT_BASE64) {
        const base64 = process.env.SERVICE_ACCOUNT_BASE64;
        const json = Buffer.from(base64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(json);
    }
    // Priority 2: Environment variable (JSON string)
    else if (process.env.SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    }
    // Priority 3: Local file
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
        console.log('✅ Likes History service initialized');
    }
} catch (error) {
    console.error('❌ Error loading service account for likes history:', error.message);
}

/**
 * Create LikesHistory sheet with headers
 */
async function createLikesHistorySheet() {
    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    addSheet: {
                        properties: {
                            title: LIKES_HISTORY_SHEET,
                        }
                    }
                }]
            }
        });

        // Add headers
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_HISTORY_SHEET}!A1:D1`,
            valueInputOption: 'RAW',
            resource: {
                values: [['Hotel ID', 'IP Address', 'Date', 'Timestamp']]
            }
        });

        console.log('✅ Created LikesHistory sheet with headers');
    } catch (error) {
        console.error('Error creating LikesHistory sheet:', error.message);
        throw error;
    }
}

/**
 * Get sheet ID by name
 */
async function getSheetId() {
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheet = response.data.sheets.find(s => s.properties.title === LIKES_HISTORY_SHEET);
        if (!sheet) {
            await createLikesHistorySheet();
            return await getSheetId();
        }

        return sheet.properties.sheetId;
    } catch (error) {
        console.error('Error getting sheet ID:', error.message);
        throw error;
    }
}

/**
 * Check if IP has liked hotel today
 */
async function hasLikedToday(hotelId, ipAddress) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_HISTORY_SHEET}!A2:D`,
        });

        const rows = response.data.values || [];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if this IP has liked this hotel today
        const hasLiked = rows.some(row => {
            const rowHotelId = row[0];
            const rowIp = row[1];
            const rowDate = row[2];
            
            return rowHotelId === hotelId && rowIp === ipAddress && rowDate === today;
        });

        return hasLiked;
    } catch (error) {
        // If sheet doesn't exist, create it
        if (error.code === 400 || error.message.includes('Unable to parse range')) {
            await createLikesHistorySheet();
            return false;
        }
        console.error('Error checking like history:', error.message);
        return false; // Allow on error
    }
}

/**
 * Record a like
 */
async function recordLike(hotelId, ipAddress) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const timestamp = new Date().toISOString();

        // Ensure sheet exists
        await getSheetId();

        // Append new record
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_HISTORY_SHEET}!A:D`,
            valueInputOption: 'RAW',
            resource: {
                values: [[hotelId, ipAddress, today, timestamp]]
            }
        });

        console.log(`✅ Recorded like: Hotel ${hotelId}, IP ${ipAddress}`);
        
        // Clear cache for this hotel after recording like
        clearLikesHistoryCache(hotelId);
        // Also clear global stats cache (if hotelId is null in getLikeStats)
        clearLikesHistoryCache();
        
        return true;
    } catch (error) {
        console.error('Error recording like:', error.message);
        return false;
    }
}

/**
 * Get like statistics
 */
async function getLikeStats(hotelId) {
    try {
        // Check cache
        const cacheKey = hotelId || 'global';
        const now = Date.now();
        if (likesHistoryCache.data[cacheKey] && 
            likesHistoryCache.timestamp[cacheKey] &&
            (now - likesHistoryCache.timestamp[cacheKey]) < CACHE_DURATION) {
            console.log(`✅ Returning cached likes stats for ${cacheKey}`);
            return likesHistoryCache.data[cacheKey];
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_HISTORY_SHEET}!A2:D`,
        });

        const rows = response.data.values || [];
        
        let result;
        
        if (!hotelId) {
            // Return total stats
            const totalLikes = rows.length;
            const uniqueIps = new Set(rows.map(row => row[1])).size;
            
            result = {
                totalLikes,
                uniqueIps,
                avgLikesPerDay: totalLikes / Math.max(1, getDaysSinceFirstLike(rows))
            };
        } else {
            // Return stats for specific hotel
            const hotelRows = rows.filter(row => row[0] === hotelId);
            const uniqueIps = new Set(hotelRows.map(row => row[1])).size;
            
            result = {
                totalLikes: hotelRows.length,
                uniqueIps,
                firstLike: hotelRows.length > 0 ? hotelRows[0][3] : null,
                lastLike: hotelRows.length > 0 ? hotelRows[hotelRows.length - 1][3] : null
            };
        }

        // Update cache
        likesHistoryCache.data[cacheKey] = result;
        likesHistoryCache.timestamp[cacheKey] = Date.now();
        console.log(`💾 Likes stats cached for ${cacheKey}`);

        return result;
    } catch (error) {
        console.error('Error getting like stats:', error.message);
        return null;
    }
}

/**
 * Helper: Calculate days since first like
 */
function getDaysSinceFirstLike(rows) {
    if (rows.length === 0) return 1;
    
    const firstDate = new Date(rows[0][3]);
    const now = new Date();
    const diffTime = Math.abs(now - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(1, diffDays);
}

/**
 * Clean up old records (optional - run periodically)
 * Remove records older than 30 days
 */
async function cleanupOldRecords(daysToKeep = 30) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_HISTORY_SHEET}!A2:D`,
        });

        const rows = response.data.values || [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        // Filter rows to keep only recent ones
        const recentRows = rows.filter(row => {
            const rowDate = row[2];
            return rowDate >= cutoffDateStr;
        });

        // Clear and rewrite sheet
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${LIKES_HISTORY_SHEET}!A2:D`,
        });

        if (recentRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${LIKES_HISTORY_SHEET}!A2:D`,
                valueInputOption: 'RAW',
                resource: {
                    values: recentRows
                }
            });
        }

        console.log(`✅ Cleaned up ${rows.length - recentRows.length} old records`);
        return rows.length - recentRows.length;
    } catch (error) {
        console.error('Error cleaning up records:', error.message);
        return 0;
    }
}

module.exports = {
    hasLikedToday,
    recordLike,
    getLikeStats,
    cleanupOldRecords,
    clearLikesHistoryCache
};
