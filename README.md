# 🏝️ Koh Larn Hotel Search Engine

เว็บไซต์ search engine สำหรับโรงแรมในเกาะล้าน พร้อมระบบเชื่อมต่อ Google Sheets และแผงควบคุมแอดมิน

## ✨ คุณสมบัติหลัก

### 🔍 Search Engine
- ค้นหาโรงแรมแบบ real-time
- กรองตามสิ่งอำนวยความสะดวก (ติดทะเล, รวมอาหารเช้า, ฟรีรถรับส่ง, ฟรีมอไซค์, มีอ่างอาบน้ำ, พลูวิลล่า, โต๊ะพลู)
- กรองตามราคาและจำนวนผู้เข้าพัก
- แสดงผลเป็นการ์ดโรงแรมที่สวยงาม

### ❤️ ระบบกดหัวใจ
- จำกัด 1 IP ต่อ 1 โรงแรม
- นับสถิติการกดหัวใจแบบ real-time
- รองรับการเรียงลำดับ (ล่าสุด, มากที่สุด, น้อยที่สุด)

### 📊 แผงควบคุมแอดมิน
- จัดการโรงแรม (เพิ่ม, แก้ไข, ลบ)
- สถิติการเข้าชมแบบ real-time
- สถิติการกดหัวใจ (รายวัน, รายสัปดาห์, รายเดือน, รายปี)
- กราฟแสดงสถิติ
- เชื่อมต่อกับ Google Sheets

### 🔗 Google Sheets Integration
- ดึงข้อมูลโรงแรมจาก Google Sheets
- ดึงรหัสผ่านแอดมินจาก Google Sheets
- CRUD operations ผ่าน API
- สถิติการเข้าชมและกดหัวใจแบบ real-time (ClicksHistory, LikesHistory)

### ☁️ Cloudinary Image Storage
- อัพโหลดรูปภาพโรงแรมไปยัง Cloudinary CDN
- Auto-optimization (resize, quality, format)
- Global CDN delivery สำหรับความเร็วสูง
- จัดเก็บแบบมีโครงสร้าง (kohlarn/hotels/{hotelId}/)

## 📋 ข้อมูลที่จัดเก็บ

- ชื่อโรงแรม (ภาษาไทย/อังกฤษ)
- รูปภาพโรงแรม
- ราคาเริ่มต้น
- ตัวกรอง/สิ่งอำนวยความสะดวก
- จำนวนผู้เข้าพักสูงสุด
- ข้อมูลธนาคาร (ชื่อธนาคาร, ชื่อบัญชี, เลขบัญชี)
- ช่องทางติดต่อ (เบอร์โทร, Facebook, Line, Website)
- แผนที่โรงแรม

## 🚀 วิธีติดตั้งและใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Google Sheets

#### 2.1 สร้าง Google Sheet
1. เปิด Google Sheets ของคุณ: https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit
2. สร้าง 2 แผ่นงาน (Sheets):

**Sheet 1: "Hotels"** (ข้อมูลโรงแรม)
```
คอลัมน์ A: ID (hotel-1, hotel-2, ...)
คอลัมน์ B: ชื่อโรงแรม (ไทย)
คอลัมน์ C: ชื่อโรงแรม (อังกฤษ)
คอลัมน์ D: รูปภาพ (URLs คั่นด้วย comma)
คอลัมน์ E: ราคาเริ่มต้น
คอลัมน์ F: ตัวกรอง (คั่นด้วย comma: ติดทะเล, รวมอาหารเช้า, ฟรีรถรับส่ง, ฟรีมอไซค์, มีอ่างอาบน้ำ, พลูวิลล่า, โต๊ะพลู)
คอลัมน์ G: รองรับผู้เข้าพัก (จำนวนคน)
คอลัมน์ H: ชื่อธนาคาร
คอลัมน์ I: ชื่อบัญชี
คอลัมน์ J: เลขบัญชี
คอลัมน์ K: เบอร์โทร
คอลัมน์ L: Facebook URL
คอลัมน์ M: Line ID
คอลัมน์ N: Website URL
คอลัมน์ O: Google Maps URL
คอลัมน์ P: Google Maps Embed Code
```

**Sheet 2: "Admin"** (ข้อมูลแอดมิน)
```
คอลัมน์ A1: "username"
คอลัมน์ B1: "password"
คอลัมน์ A2: "admin"
คอลัมน์ B2: "your_password_here"
```

#### 2.2 ตั้งค่าการแชร์
1. คลิก "Share" (แชร์) ที่มุมขวาบน
2. เปลี่ยนเป็น "Anyone with the link" (ทุกคนที่มีลิงก์)
3. เลือก "Viewer" (ผู้ดู)
4. คลิก "Done"

#### 2.3 เปิดใช้งาน Google Sheets API

**วิธีที่ 1: ใช้ API Key (แนะนำสำหรับการอ่านข้อมูล)**
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่หรือเลือกโปรเจกต์ที่มีอยู่
3. ไปที่ "APIs & Services" > "Enable APIs and Services"
4. ค้นหา "Google Sheets API" และคลิก "Enable"
5. ไปที่ "Credentials" > "Create Credentials" > "API Key"
6. คัดลอก API Key

**วิธีที่ 2: ใช้ Service Account (แนะนำสำหรับการเขียนข้อมูล)**
1. ไปที่ "Credentials" > "Create Credentials" > "Service Account"
2. ตั้งชื่อ Service Account และคลิก "Create"
3. ข้ามขั้นตอนการให้สิทธิ์ (Optional)
4. คลิก "Done"
5. คลิกที่ Service Account ที่สร้างไว้
6. ไปที่แท็บ "Keys" > "Add Key" > "Create New Key"
7. เลือก "JSON" และคลิก "Create"
8. บันทึกไฟล์ JSON ที่ได้

**สำหรับ Service Account:**
- แชร์ Google Sheet ให้กับอีเมล Service Account (xxx@xxx.iam.gserviceaccount.com)
- ให้สิทธิ์ "Editor"

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA
GOOGLE_API_KEY=YOUR_API_KEY_HERE

# Server Configuration
PORT=3000
NODE_ENV=development
```

**หมายเหตุ:** 
- `GOOGLE_SHEET_ID` คือส่วน ID ใน URL ของ Google Sheet
- ตัวอย่าง URL: `https://docs.google.com/spreadsheets/d/[GOOGLE_SHEET_ID]/edit`

### 4. ตั้งค่า Cloudinary (สำหรับอัพโหลดรูปภาพ)

**🚀 Quick Start - ใช้เวลา 5 นาที**

ดูคู่มือฉบับย่อ: [`QUICK_START_CLOUDINARY.md`](QUICK_START_CLOUDINARY.md)

หรือดูคู่มือแบบเต็ม: [`CLOUDINARY_SETUP.md`](CLOUDINARY_SETUP.md)

**ขั้นตอนโดยย่อ:**

1. สมัครบัญชี Cloudinary (ฟรี): https://cloudinary.com/users/register_free
2. คัดลอก credentials จาก Dashboard
3. เพิ่มใน `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. เพิ่ม environment variables ใน Vercel
5. Deploy!

**ทดสอบว่าตั้งค่าถูกต้อง:**
```bash
.\test-cloudinary.bat
```

### 5. เริ่มต้นใช้งาน

```bash
npm start
```

หรือใช้โหมด development (รีสตาร์ทอัตโนมัติเมื่อมีการแก้ไขไฟล์):

```bash
npm run dev
```

### 5. เข้าใช้งาน

- **หน้าแรก (Search Engine):** http://localhost:3000
- **แผงควบคุมแอดมิน (เวอร์ชั่น 2):** http://localhost:3000/admin_v2.html

## 📁 โครงสร้างโปรเจกต์

```
kohlarn/
├── public/
│   ├── css/
│   │   ├── style.css          # สไตล์หน้าแรก
│   │   └── admin.css          # สไตล์แผงควบคุม
│   ├── js/
│   │   ├── app.js             # JavaScript หน้าแรก
│   │   ├── admin.js           # JavaScript แผงควบคุม (v1)
│   │   └── admin_v2.js        # JavaScript แผงควบคุม (v2) ⭐
│   ├── index.html             # หน้าแรก
│   ├── admin.html             # หน้าแผงควบคุม (v1)
│   └── admin_v2.html          # หน้าแผงควบคุม (v2) ⭐
├── services/
│   ├── googleSheets.js        # บริการเชื่อมต่อ Google Sheets
│   ├── hotelClicksSheet.js    # สถิติคลิกโรงแรม + ClicksHistory
│   ├── likesSheet.js          # สถิติกดหัวใจ + LikesHistory
│   ├── stats.js               # บริการสถิติการเข้าชม
│   ├── users.js               # จัดการผู้ใช้งาน (admin, hotel-owner)
│   ├── cloudinary.js          # อัพโหลดรูปภาพไปยัง Cloudinary ⭐
│   └── googleDrive.js         # (เลิกใช้แล้ว - ใช้ Cloudinary แทน)
├── data/                      # ข้อมูลที่เก็บใน local (auto-generated)
│   ├── stats.json             # สถิติการเข้าชม
│   └── likes.json             # ข้อมูลการกดหัวใจ
├── server.js                  # Express server
├── package.json               # Dependencies
├── .env                       # Environment variables
├── .env.example               # ตัวอย่าง environment variables
├── QUICK_START_CLOUDINARY.md  # คู่มือ Cloudinary แบบย่อ ⭐
├── CLOUDINARY_SETUP.md        # คู่มือ Cloudinary แบบเต็ม ⭐
├── setup-cloudinary-vercel.ps1 # Script ตั้งค่า Cloudinary ⭐
├── test-cloudinary.bat        # ทดสอบ Cloudinary config ⭐
├── .gitignore                 # Git ignore file
└── README.md                  # เอกสารนี้
```

## 🔧 API Endpoints

### Public APIs
- `GET /api/hotels` - ดึงข้อมูลโรงแรมทั้งหมด
- `POST /api/hotels/:id/like` - กดหัวใจโรงแรม
- `GET /api/hotels/:id/likes` - ดูจำนวนหัวใจของโรงแรม

### Admin APIs (ต้องมี password)
- `POST /api/admin/login` - เข้าสู่ระบบแอดมิน
- `GET /api/admin/stats` - ดูสถิติ
- `POST /api/admin/hotels` - เพิ่มโรงแรม
- `PUT /api/admin/hotels/:id` - แก้ไขโรงแรม
- `DELETE /api/admin/hotels/:id` - ลบโรงแรม

## 🎨 Features ที่พร้อมสำหรับการขยาย

โครงสร้างโค้ดถูกออกแบบให้รองรับการเพิ่มฟีเจอร์ใหม่ๆ เช่น:

1. **ระบบจองโรงแรม** - เพิ่มใน `services/booking.js`
2. **ระบบรีวิว** - เพิ่มใน `services/reviews.js`
3. **ระบบแจ้งเตือน** - เพิ่มใน `services/notifications.js`
4. **ระบบแชท** - เพิ่มใน `services/chat.js`
5. **Multi-language** - ขยายจาก nameTh, nameEn
6. **Image upload** - เชื่อมต่อ Cloud Storage
7. **Email notifications** - เพิ่ม nodemailer
8. **SMS alerts** - เชื่อมต่อ SMS gateway

## 🔐 ความปลอดภัย

- ✅ Rate limiting (100 requests ต่อ 15 นาที)
- ✅ Helmet.js สำหรับ security headers
- ✅ IP-based like limitation
- ✅ Admin password จาก Google Sheets
- ✅ รหัสชั่วคราว 123456 สำหรับทดสอบระบบ
- ✅ CORS enabled

### รหัสผ่านแอดมิน

**รหัสจาก Google Sheets:**
- ตั้งค่าใน Sheet "Admin" cell B2
- ใช้สำหรับการใช้งานจริง

**รหัสชั่วคราว (Testing):**
- รหัส: `123456`
- ใช้สำหรับทดสอบระบบ
- สามารถใช้ฟีเจอร์ทั้งหมดได้
- จะแสดงคำเตือนเมื่อเข้าสู่ระบบ
- สามารถลบได้โดยแก้ไขโค้ดใน `services/googleSheets.js`

## 🐛 Troubleshooting

### ปัญหา: ไม่สามารถดึงข้อมูลจาก Google Sheets

1. ตรวจสอบว่า Google Sheet ถูกแชร์เป็น "Anyone with the link"
2. ตรวจสอบว่า GOOGLE_SHEET_ID ถูกต้อง
3. ตรวจสอบว่า GOOGLE_API_KEY ถูกต้องและเปิดใช้งาน Google Sheets API แล้ว
4. ลองรัน: `curl "https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID?key=YOUR_API_KEY"`

### ปัญหา: ไม่สามารถเพิ่m/แก้ไข/ลบโรงแรมได้

1. ตรวจสอบว่าใช้ Service Account แทน API Key
2. ตรวจสอบว่า Service Account ได้รับสิทธิ์ "Editor" ใน Google Sheet
3. ตรวจสอบว่า credentials JSON ถูกต้อง

### ปัญหา: รหัสผ่านแอดมินไม่ถูกต้อง

1. ตรวจสอบว่ามี Sheet ชื่อ "Admin"
2. ตรวจสอบว่า cell B2 มีรหัสผ่าน
3. Default password คือ "admin123" ถ้าดึงข้อมูลไม่ได้

## 📝 License

MIT License

## 👤 Author

Created for Koh Larn Tourism

## 🙏 Credits

- Express.js
- Google Sheets API
- Chart.js
- Font Awesome
- And all other open-source libraries used

---

**สนุกกับการพัฒนา! 🚀**
