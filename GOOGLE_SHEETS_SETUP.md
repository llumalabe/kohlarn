# วิธีการเชื่อมต่อกับ Google Sheets แบบละเอียด

## 📚 สารบัญ
1. [การเตรียม Google Sheet](#1-การเตรียม-google-sheet)
2. [การสร้าง API Key](#2-การสร้าง-api-key)
3. [การสร้าง Service Account (สำหรับการแก้ไขข้อมูล)](#3-การสร้าง-service-account)
4. [การตั้งค่าโปรเจกต์](#4-การตั้งค่าโปรเจกต์)
5. [การทดสอบการเชื่อมต่อ](#5-การทดสอบการเชื่อมต่อ)

---

## 1. การเตรียม Google Sheet

### ขั้นตอนที่ 1.1: เปิด Google Sheet ของคุณ

ไปที่: https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit

### ขั้นตอนที่ 1.2: สร้างโครงสร้างข้อมูล

#### Sheet 1: "Hotels"

คัดลอกโครงสร้างนี้ลงใน Sheet แรก:

| A (ID) | B (ชื่อไทย) | C (ชื่ออังกฤษ) | D (รูปภาพ) | E (ราคา) | F (ตัวกรอง) | G (รองรับ) | H (ธนาคาร) | I (ชื่อบัญชี) | J (เลขบัญชี) | K (เบอร์) | L (Facebook) | M (Line) | N (Website) | O (Map URL) | P (Map Embed) |
|--------|-------------|----------------|-----------|----------|-------------|-----------|-----------|-------------|------------|----------|-------------|---------|-----------|-----------|-------------|
| hotel-1 | โรงแรมตัวอย่าง | Example Hotel | https://example.com/img1.jpg, https://example.com/img2.jpg | 1500 | ติดทะเล, รวมอาหารเช้า | 2 | ธนาคารกสิกรไทย | นายตัวอย่าง | 1234567890 | 081-234-5678 | https://facebook.com/example | @example | https://example.com | https://goo.gl/maps/xxx | &lt;iframe...&gt; |

**ตัวอย่างข้อมูลแถวที่ 2:**
```
A2: hotel-1
B2: เกาะล้านรีสอร์ท
C2: Koh Larn Resort
D2: https://example.com/image1.jpg, https://example.com/image2.jpg
E2: 2000
F2: ติดทะเล, รวมอาหารเช้า, ฟรีรถรับส่ง
G2: 4
H2: ธนาคารกสิกรไทย
I2: นายสมชาย ใจดี
J2: 123-4-56789-0
K2: 081-234-5678
L2: https://facebook.com/kohlarnresort
M2: @kohlarnresort
N2: https://kohlarnresort.com
O2: https://goo.gl/maps/xxxxx
P2: <iframe src="https://www.google.com/maps/embed?..."></iframe>
```

#### Sheet 2: "Admin"

สร้าง Sheet ใหม่ชื่อ "Admin" และใส่ข้อมูล:

| A (username) | B (password) |
|--------------|--------------|
| admin        | yourpassword123 |

**หมายเหตุ:** แถว 1 เป็น header, แถว 2 เป็นข้อมูล

### ขั้นตอนที่ 1.3: ตั้งค่าการแชร์

1. คลิกปุ่ม **"Share"** (แชร์) มุมขวาบน
2. ในส่วน "General access" คลิก **"Restricted"**
3. เลือก **"Anyone with the link"**
4. เลือกสิทธิ์เป็น **"Viewer"**
5. คลิก **"Done"**

![Share Settings](https://i.imgur.com/example-share.png)

### ขั้นตอนที่ 1.4: คัดลอก Sheet ID

จาก URL:
```
https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit
```

Sheet ID คือ: `1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA`

---

## 2. การสร้าง API Key

### ขั้นตอนที่ 2.1: เปิด Google Cloud Console

1. ไปที่: https://console.cloud.google.com/
2. เข้าสู่ระบบด้วย Google Account ของคุณ

### ขั้นตอนที่ 2.2: สร้างโปรเจกต์ใหม่

1. คลิกที่ **"Select a project"** ด้านบนซ้าย
2. คลิก **"NEW PROJECT"**
3. ตั้งชื่อโปรเจกต์ เช่น `"kohlarn-hotels"`
4. คลิก **"CREATE"**
5. รอให้โปรเจกต์สร้างเสร็จ (ประมาณ 30 วินาที)

### ขั้นตอนที่ 2.3: เปิดใช้งาน Google Sheets API

1. ไปที่เมนู **"APIs & Services"** > **"Library"**
2. ค้นหา **"Google Sheets API"**
3. คลิกที่ **"Google Sheets API"**
4. คลิก **"ENABLE"**

### ขั้นตอนที่ 2.4: สร้าง API Key

1. ไปที่เมนู **"APIs & Services"** > **"Credentials"**
2. คลิก **"+ CREATE CREDENTIALS"** ด้านบน
3. เลือก **"API key"**
4. คัดลอก API Key ที่ได้ (เช่น `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`)
5. (แนะนำ) คลิก **"RESTRICT KEY"** เพื่อจำกัดการใช้งาน:
   - ไปที่ "API restrictions"
   - เลือก "Restrict key"
   - เลือก "Google Sheets API"
   - คลิก "Save"

### ขั้นตอนที่ 2.5: ทดสอบ API Key

เปิด Terminal และรันคำสั่ง:

```bash
curl "https://sheets.googleapis.com/v4/spreadsheets/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA?key=YOUR_API_KEY"
```

แทนที่ `YOUR_API_KEY` ด้วย API Key ของคุณ

ถ้าสำเร็จจะเห็นข้อมูล JSON

---

## 3. การสร้าง Service Account

**หมายเหตุ:** Service Account จำเป็นสำหรับการเขียน/แก้ไข/ลบข้อมูลใน Google Sheets

### ขั้นตอนที่ 3.1: สร้าง Service Account

1. ไปที่เมนู **"APIs & Services"** > **"Credentials"**
2. คลิก **"+ CREATE CREDENTIALS"**
3. เลือก **"Service account"**
4. ใส่ชื่อ Service account: `kohlarn-service`
5. ใส่ Service account ID: `kohlarn-service`
6. คลิก **"CREATE AND CONTINUE"**
7. (Optional) ข้ามขั้นตอน "Grant this service account access to project"
8. คลิก **"CONTINUE"**
9. (Optional) ข้ามขั้นตอน "Grant users access to this service account"
10. คลิก **"DONE"**

### ขั้นตอนที่ 3.2: สร้าง Key สำหรับ Service Account

1. ในหน้า Credentials หา Service account ที่เพิ่งสร้าง
2. คลิกที่ Service account
3. ไปที่แท็บ **"KEYS"**
4. คลิก **"ADD KEY"** > **"Create new key"**
5. เลือกประเภท **"JSON"**
6. คลิก **"CREATE"**
7. ไฟล์ JSON จะถูกดาวน์โหลดอัตโนมัติ
8. เปลี่ยนชื่อไฟล์เป็น `service-account.json`
9. ย้ายไฟล์ไปยังโฟลเดอร์โปรเจกต์

### ขั้นตอนที่ 3.3: แชร์ Google Sheet ให้กับ Service Account

1. เปิดไฟล์ `service-account.json`
2. หาค่า `"client_email"` (จะมีรูปแบบ: `xxxxx@xxxxx.iam.gserviceaccount.com`)
3. คัดลอกอีเมลนี้
4. กลับไปที่ Google Sheet
5. คลิก **"Share"**
6. วางอีเมล Service Account
7. เปลี่ยนสิทธิ์เป็น **"Editor"**
8. **ยกเลิกการติ๊ก** "Notify people" (ไม่ต้องแจ้งเตือน)
9. คลิก **"Share"**

---

## 4. การตั้งค่าโปรเจกต์

### ขั้นตอนที่ 4.1: แก้ไขไฟล์ .env

สร้างไฟล์ `.env` ในโฟลเดอร์โปรเจกต์:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX

# Server Configuration
PORT=3000
NODE_ENV=development
```

แทนที่:
- `GOOGLE_SHEET_ID` = Sheet ID ของคุณ
- `GOOGLE_API_KEY` = API Key ที่สร้างไว้

### ขั้นตอนที่ 4.2: อัพเดทโค้ดให้รองรับ Service Account

แก้ไขไฟล์ `services/googleSheets.js` บรรทัดแรกๆ:

```javascript
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// สำหรับ API Key (อ่านอย่างเดียว)
const API_KEY = process.env.GOOGLE_API_KEY;

// สำหรับ Service Account (อ่าน + เขียน)
let auth;
try {
  const serviceAccount = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../service-account.json'))
  );
  
  auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
} catch (error) {
  console.warn('Service account not found, using API Key for read-only access');
  auth = API_KEY;
}

const sheets = google.sheets({ version: 'v4', auth });
```

---

## 5. การทดสอบการเชื่อมต่อ

### ขั้นตอนที่ 5.1: ทดสอบการอ่านข้อมูล

```bash
npm start
```

เปิดเบราว์เซอร์:
```
http://localhost:3000
```

ถ้าเห็นรายการโรงแรม = เชื่อมต่อสำเร็จ! ✅

### ขั้นตอนที่ 5.2: ทดสอบ Admin Panel

1. เปิด `http://localhost:3000/admin`
2. ใส่รหัสผ่านที่ตั้งไว้ใน Sheet "Admin"
3. ทดสอบเพิ่มโรงแรม
4. กลับไปดู Google Sheet ว่ามีข้อมูลเพิ่มขึ้นหรือไม่

---

## 🔧 Troubleshooting

### ปัญหา: Error 403 - Permission denied

**วิธีแก้:**
1. ตรวจสอบว่า Google Sheet ถูกแชร์เป็น "Anyone with the link"
2. ถ้าใช้ Service Account ตรวจสอบว่าได้แชร์ให้กับอีเมล Service Account แล้ว

### ปัญหา: Error 400 - Invalid API key

**วิธีแก้:**
1. ตรวจสอบว่าเปิดใช้งาน Google Sheets API แล้ว
2. ตรวจสอบว่า API Key ถูกต้อง
3. ลองสร้าง API Key ใหม่

### ปัญหา: Error 404 - Requested entity was not found

**วิธีแก้:**
1. ตรวจสอบ Sheet ID ว่าถูกต้อง
2. ตรวจสอบว่าชื่อ Sheet เป็น "Hotels" และ "Admin"

### ปัญหา: ไม่สามารถแก้ไขข้อมูลได้

**วิธีแก้:**
1. ต้องใช้ Service Account ไม่ใช่ API Key
2. ตรวจสอบว่าแชร์ Sheet ให้ Service Account แล้ว
3. ตรวจสอบว่าให้สิทธิ์ "Editor"

---

## 📞 ต้องการความช่วยเหลือ?

หากมีปัญหาในการเชื่อมต่อ:

1. ตรวจสอบ Console log ในเบราว์เซอร์ (F12)
2. ตรวจสอบ Terminal log
3. ลองทดสอบ API ด้วย curl command

**Happy Coding! 🚀**
