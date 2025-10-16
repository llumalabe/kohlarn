/**
 * สคริปต์อัพเดท role ของ adminn เป็น admin
 * 
 * วิธีใช้:
 * 1. ตรวจสอบว่า service-account.json มีอยู่
 * 2. รัน: node update-admin-role.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const USERS_SHEET = 'Users';

async function updateAdminRole() {
    try {
        console.log('\n🔧 กำลังอัพเดท role ของ adminn...\n');
        
        // ตรวจสอบ service account
        const serviceAccountPath = path.join(__dirname, 'service-account.json');
        if (!fs.existsSync(serviceAccountPath)) {
            console.error('❌ ไม่พบไฟล์ service-account.json');
            console.log('💡 กรุณาวางไฟล์ service-account.json ในโฟลเดอร์ kohlarn\n');
            process.exit(1);
        }

        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        const auth = new google.auth.GoogleAuth({
            credentials: serviceAccount,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 1. อ่านข้อมูลทั้งหมด
        console.log('📖 กำลังอ่านข้อมูล Users...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${USERS_SHEET}!A2:E`,
        });

        const rows = response.data.values || [];
        console.log(`   พบ ${rows.length} รายการ\n`);

        // 2. หา adminn
        let rowIndex = -1;
        let currentData = null;
        
        rows.forEach((row, index) => {
            if (row[0] === 'adminn') {
                rowIndex = index + 2; // +2 เพราะเริ่มจากแถว 2 และ index เริ่มจาก 0
                currentData = {
                    username: row[0],
                    password: row[1],
                    nickname: row[2],
                    role: row[3] || 'user',
                    hotelId: row[4] || ''
                };
            }
        });

        if (rowIndex === -1) {
            console.log('❌ ไม่พบ username "adminn" ใน Google Sheets');
            console.log('💡 กรุณาสร้าง user adminn ก่อน หรือเปลี่ยน username ในสคริปต์\n');
            process.exit(1);
        }

        console.log('✅ พบ adminn:');
        console.log('   Username:', currentData.username);
        console.log('   Nickname:', currentData.nickname);
        console.log('   Role (เดิม):', currentData.role);
        console.log('   HotelId:', currentData.hotelId || '(ว่าง)');
        console.log('');

        // 3. อัพเดท role เป็น admin
        if (currentData.role === 'admin') {
            console.log('✅ adminn มี role เป็น admin อยู่แล้ว!\n');
            process.exit(0);
        }

        console.log('🔄 กำลังอัพเดท role เป็น "admin"...');
        
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${USERS_SHEET}!D${rowIndex}`, // Column D = role
            valueInputOption: 'RAW',
            requestBody: {
                values: [['admin']]
            }
        });

        console.log('✅ อัพเดทสำเร็จ!\n');
        console.log('━'.repeat(50));
        console.log('📋 ข้อมูลใหม่:');
        console.log('   Username: adminn');
        console.log('   Role: admin ✅');
        console.log('━'.repeat(50));
        console.log('\n💡 ขั้นตอนต่อไป:');
        console.log('   1. รีเฟรชหน้าเว็บ (Ctrl + F5)');
        console.log('   2. ออกจากระบบ');
        console.log('   3. เข้าสู่ระบบใหม่ด้วย adminn');
        console.log('   4. ควรเห็นเมนูทั้งหมด! 🎉\n');

    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
        if (error.code === 429) {
            console.log('⚠️  Google Sheets API quota exceeded');
            console.log('💡 รอ 60 วินาทีแล้วลองใหม่\n');
        }
        process.exit(1);
    }
}

// เรียกใช้งาน
updateAdminRole();
