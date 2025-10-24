require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || process.env.SPREADSHEET_ID;
const WEBSETTINGS_SHEET = 'WebSettings';

async function addFooterSettings() {
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
      // Fallback to file (for local development)
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

    // Get existing rows to find the next empty row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${WEBSETTINGS_SHEET}!A:D`,
    });

    const rows = response.data.values || [];
    const nextRow = rows.length + 1;

    const timestamp = new Date().toLocaleString('th-TH', { 
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Check if footer settings already exist
    const footerTextExists = rows.some(row => row[0] === 'footer_text');
    const footerTextColorExists = rows.some(row => row[0] === 'footer_text_color');
    const footerBgColorExists = rows.some(row => row[0] === 'footer_bg_color');

    const newRows = [];

    if (!footerTextExists) {
      newRows.push(['footer_text', '© 2025 Koh Larn Hotel Search', timestamp, 'System']);
    }

    if (!footerTextColorExists) {
      newRows.push(['footer_text_color', '#ffffff', timestamp, 'System']);
    }

    if (!footerBgColorExists) {
      newRows.push(['footer_bg_color', '#2d3436', timestamp, 'System']);
    }

    if (newRows.length === 0) {
      console.log('✅ Footer settings already exist in WebSettings sheet');
      return;
    }

    // Add new rows
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${WEBSETTINGS_SHEET}!A${nextRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: newRows
      }
    });

    console.log(`✅ Added ${newRows.length} footer settings to WebSettings sheet:`);
    newRows.forEach(row => console.log(`   - ${row[0]}: ${row[1]}`));

  } catch (error) {
    console.error('❌ Error adding footer settings:', error.message);
    console.error('Full error:', error);
    console.log('\nEnvironment check:');
    console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID ? 'Set' : 'Missing');
    console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL ? 'Set' : 'Missing');
    process.exit(1);
  }
}

addFooterSettings()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
