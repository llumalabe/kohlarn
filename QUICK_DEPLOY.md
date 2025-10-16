# Quick Deploy Commands

## สำหรับอัพโหลดครั้งแรก

### 1. เตรียมไฟล์
```powershell
# บนเครื่อง Windows ของคุณ
cd C:\Users\User\OneDrive\เดสก์ท็อป\kohlarn

# ลบ node_modules ก่อนอัพโหลด (เพื่อลดขนาด)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# สร้าง zip (ถ้าต้องการ)
Compress-Archive -Path * -DestinationPath kohlarn.zip
```

### 2. อัพโหลดผ่าน Hostinger File Manager
1. เข้า hPanel ของ Hostinger
2. ไปที่ File Manager
3. สร้างโฟลเดอร์ใหม่ชื่อ `kohlarn`
4. อัพโหลดไฟล์ทั้งหมด (หรือ zip แล้ว extract)

### 3. เข้า SSH Terminal (ใน Hostinger hPanel)
```bash
# ไปยังโฟลเดอร์โปรเจค
cd domains/your-domain.com/public_html/kohlarn

# หรือถ้าใช้ VPS
cd /var/www/kohlarn

# ติดตั้ง dependencies
npm install --production

# สร้าง .env file
cat > .env << EOF
PORT=3000
NODE_ENV=production
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_API_KEY=your_google_api_key_here
EOF

# สร้าง service-account.json
nano service-account.json
# วาง JSON credentials แล้วกด Ctrl+X, Y, Enter

# ให้สิทธิ์ start.sh
chmod +x start.sh

# ติดตั้ง PM2 globally
npm install -g pm2

# รัน application
pm2 start ecosystem.config.js

# บันทึก PM2 config
pm2 save

# ตั้งค่า auto-start
pm2 startup
```

---

## วิธีง่ายสุด: ใช้ Hostinger Node.js App

### 1. ใน Hostinger hPanel
- ไปที่ **Advanced → Node.js**
- กด **Create Application**
- เลือก Node.js version 16 หรือสูงกว่า
- Application root: `/public_html/kohlarn`
- Application URL: `your-domain.com`
- Application startup file: `server.js`

### 2. Upload ไฟล์
- ใช้ File Manager อัพโหลดโปรเจค
- หรือใช้ Git deploy

### 3. Environment Variables
ใน Node.js App settings:
```
PORT=3000
NODE_ENV=production
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_API_KEY=your_api_key
```

### 4. คลิก "Start Application"

---

## หลังจาก Deploy สำเร็จ

### ตรวจสอบสถานะ
```bash
pm2 status
pm2 logs
```

### URL ที่ใช้งาน
- หน้าแรก: `http://your-domain.com`
- Admin: `http://your-domain.com/admin`

### Restart Application
```bash
pm2 restart kohlarn-hotel

# หรือ restart ทั้งหมด
pm2 restart all
```

### อัพเดทโค้ด
```bash
# SSH เข้าเซิร์ฟเวอร์
cd /var/www/kohlarn

# อัพโหลดไฟล์ใหม่ หรือ git pull

# ติดตั้ง dependencies ใหม่
npm install --production

# Restart
pm2 restart kohlarn-hotel
```

---

## Troubleshooting

### ถ้า port 3000 ถูกใช้งาน
```bash
# หา process ที่ใช้ port 3000
lsof -i :3000

# kill process
kill -9 <PID>

# หรือเปลี่ยน port ใน .env
echo "PORT=3001" >> .env
```

### ถ้า PM2 ไม่ทำงาน
```bash
# ลบ PM2 processes ทั้งหมด
pm2 delete all

# รันใหม่
pm2 start ecosystem.config.js
pm2 save
```

### ถ้า Google Sheets ไม่เชื่อมต่อ
1. ตรวจสอบ `service-account.json` ถูกต้อง
2. ตรวจสอบ Google Sheet ถูก share กับ email ใน service account
3. ตรวจสอบ GOOGLE_SHEET_ID ใน `.env`

---

## 🎯 Checklist Deploy

- [ ] อัพโหลดไฟล์โปรเจคทั้งหมด
- [ ] ติดตั้ง Node.js dependencies (`npm install`)
- [ ] สร้างไฟล์ `.env` พร้อม environment variables
- [ ] สร้างไฟล์ `service-account.json`
- [ ] ติดตั้ง PM2 (`npm install -g pm2`)
- [ ] รัน application (`pm2 start ecosystem.config.js`)
- [ ] บันทึก PM2 config (`pm2 save`)
- [ ] ตั้งค่า auto-start (`pm2 startup`)
- [ ] ตั้งค่า domain/reverse proxy (ถ้าใช้ VPS)
- [ ] ทดสอบเข้าเว็บไซต์
- [ ] ทดสอบ Admin Panel
- [ ] ทดสอบระบบ Login

---

## 📞 ติดต่อ Hostinger Support

หากมีปัญหา:
1. เปิด ticket ใน Hostinger hPanel
2. แจ้งว่าต้องการ deploy Node.js application
3. ขอ SSH access (ถ้ายังไม่มี)
4. ขอติดตั้ง PM2 และ Node.js version ที่ต้องการ
