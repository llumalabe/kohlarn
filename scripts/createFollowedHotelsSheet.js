require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

async function createFollowedHotelsSheet() {
  try {
    // Get service account credentials
    let serviceAccount;
    
    if (process.env.SERVICE_ACCOUNT_BASE64) {
      const base64 = process.env.SERVICE_ACCOUNT_BASE64;
      const json = Buffer.from(base64, 'base64').toString('utf8');
      serviceAccount = JSON.parse(json);
    } else if (process.env.SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
    } else {
      const serviceAccountPath = path.join(__dirname, '../service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      }
    }
    
    if (!serviceAccount) {
      throw new Error('Service account credentials not found');
    }
    
    // Authenticate
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('📋 Creating FollowedHotels sheet...');

    // Create the sheet
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'FollowedHotels'
              }
            }
          }]
        }
      });
      console.log('✅ Sheet "FollowedHotels" created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Sheet "FollowedHotels" already exists');
      } else {
        throw error;
      }
    }

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'FollowedHotels!A1:E1',
      valueInputOption: 'RAW',
      resource: {
        values: [['ID', 'Username', 'Hotel ID', 'Hotel Name', 'Followed At']]
      }
    });

    console.log('✅ Headers added to FollowedHotels sheet');
    console.log('\n📊 Sheet structure:');
    console.log('   Column A: ID (unique identifier)');
    console.log('   Column B: Username');
    console.log('   Column C: Hotel ID');
    console.log('   Column D: Hotel Name');
    console.log('   Column E: Followed At (timestamp)');

  } catch (error) {
    console.error('❌ Error creating FollowedHotels sheet:', error.message);
    process.exit(1);
  }
}

createFollowedHotelsSheet()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
