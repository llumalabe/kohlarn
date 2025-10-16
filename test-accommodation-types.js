// Test AccommodationTypes sheet and hotel data
const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA';

async function testAccommodationTypes() {
    console.log('\n🏨 Testing AccommodationTypes Sheet\n');
    console.log('━'.repeat(50));

    try {
        // 1. Check if AccommodationTypes sheet exists
        console.log('\n📋 Step 1: Checking AccommodationTypes sheet...');
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const accommodationSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'AccommodationTypes');
        
        if (!accommodationSheet) {
            console.log('\n❌ AccommodationTypes sheet NOT FOUND!');
            console.log('\n📝 Action Required:');
            console.log('   1. Open Google Sheets: https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA');
            console.log('   2. Click + button at bottom to create new sheet');
            console.log('   3. Name it: AccommodationTypes');
            console.log('   4. Follow ACCOMMODATION_TYPES_SETUP.md guide\n');
            return;
        }

        console.log('✅ AccommodationTypes sheet exists!');

        // 2. Read AccommodationTypes data
        console.log('\n📖 Step 2: Reading AccommodationTypes data...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'AccommodationTypes!A1:G',
        });

        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            console.log('\n⚠️ AccommodationTypes sheet is EMPTY!');
            console.log('\n📝 Add sample data:');
            console.log('   See ACCOMMODATION_TYPES_SETUP.md for examples\n');
            return;
        }

        console.log(`✅ Found ${rows.length - 1} accommodation types`);
        
        // Display header
        console.log('\n📊 Accommodation Types:');
        console.log('━'.repeat(100));
        
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const id = row[0] || '';
            const nameTh = row[1] || '';
            const nameEn = row[2] || '';
            const icon = row[3] || '';
            const color = row[4] || '';
            const enabled = row[5] || '';
            
            const status = enabled === 'TRUE' ? '✅' : '❌';
            console.log(`${status} ${nameTh.padEnd(15)} (${nameEn.padEnd(12)}) | ${icon.padEnd(20)} | ${color} | ID: ${id}`);
        }

        // 3. Check Hotels sheet for accommodationTypes column
        console.log('\n\n📋 Step 3: Checking Hotels data...');
        const hotelsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Hotels!A1:Z10', // Read first 10 hotels
        });

        const hotelsRows = hotelsResponse.data.values;
        
        if (!hotelsRows || hotelsRows.length === 0) {
            console.log('⚠️ No hotels found!');
            return;
        }

        // Find accommodationTypes column (should be Z = index 25)
        const header = hotelsRows[0];
        const accommodationTypesIndex = 25; // Column Z
        
        console.log(`\n📊 Hotels with Accommodation Types (Column Z):`);
        console.log('━'.repeat(100));

        let hotelsWithTypes = 0;
        let hotelsWithoutTypes = 0;

        for (let i = 1; i < Math.min(hotelsRows.length, 10); i++) {
            const row = hotelsRows[i];
            const hotelId = row[0] || '';
            const nameTh = row[1] || '';
            const accommodationTypes = row[accommodationTypesIndex] || '';
            
            if (accommodationTypes) {
                console.log(`✅ ${hotelId.padEnd(10)} | ${nameTh.padEnd(30)} | Types: ${accommodationTypes}`);
                hotelsWithTypes++;
            } else {
                console.log(`❌ ${hotelId.padEnd(10)} | ${nameTh.padEnd(30)} | ⚠️ No accommodation type set`);
                hotelsWithoutTypes++;
            }
        }

        // Summary
        console.log('\n\n📈 Summary:');
        console.log('━'.repeat(50));
        console.log(`✅ Total Accommodation Types: ${rows.length - 1}`);
        console.log(`✅ Hotels with Types: ${hotelsWithTypes}`);
        console.log(`❌ Hotels without Types: ${hotelsWithoutTypes}`);
        
        if (hotelsWithoutTypes > 0) {
            console.log('\n⚠️ Action Required:');
            console.log('   1. Go to Admin Panel > จัดการโรงแรม');
            console.log('   2. Edit hotels without accommodation types');
            console.log('   3. Add accommodation type from dropdown');
            console.log('   4. Save changes\n');
        } else {
            console.log('\n🎉 All hotels have accommodation types!');
            console.log('   Badge should display on hotel cards (top-left corner)\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.message.includes('Unable to parse range')) {
            console.log('\n💡 This likely means the AccommodationTypes sheet doesn\'t exist yet.');
            console.log('   Please create it following ACCOMMODATION_TYPES_SETUP.md\n');
        }
    }
}

// Run test
testAccommodationTypes().then(() => {
    console.log('✨ Test complete!\n');
    process.exit(0);
}).catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
