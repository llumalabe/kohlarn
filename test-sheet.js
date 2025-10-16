const { google } = require('googleapis');
const path = require('path');

async function testSheet() {
    try {
        console.log('🔍 Testing Google Sheets connection...\n');
        
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'service-account.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = '1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA';
        
        // 1. Get all sheets in the spreadsheet
        console.log('📋 Getting all sheets...');
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });
        
        console.log('\n✅ Available sheets:');
        spreadsheet.data.sheets.forEach(sheet => {
            console.log(`   - "${sheet.properties.title}" (ID: ${sheet.properties.sheetId})`);
        });
        
        // 2. Try to read from AccommodationTypes sheet
        console.log('\n📖 Trying to read AccommodationTypes sheet...');
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'AccommodationTypes!A1:G',
            });
            
            const rows = response.data.values || [];
            console.log(`\n✅ AccommodationTypes sheet found!`);
            console.log(`   Rows: ${rows.length}`);
            
            if (rows.length > 0) {
                console.log('\n📝 Data:');
                rows.forEach((row, index) => {
                    console.log(`   Row ${index + 1}:`, row.join(' | '));
                });
            } else {
                console.log('\n⚠️  Sheet is empty! Please add header row.');
            }
        } catch (error) {
            console.error('\n❌ Error reading AccommodationTypes sheet:');
            console.error(`   ${error.message}`);
            console.error('\n💡 Solution:');
            console.error('   1. Open Google Sheets');
            console.error('   2. Create a sheet named "AccommodationTypes" (exact name)');
            console.error('   3. Add headers in row 1: ID | ชื่อไทย | ชื่ออังกฤษ | ไอคอน | สี | สร้างเมื่อ | แก้ไขเมื่อ');
        }
        
    } catch (error) {
        console.error('\n❌ Fatal error:');
        console.error(error.message);
        console.error('\nFull error:', error);
    }
}

testSheet();
