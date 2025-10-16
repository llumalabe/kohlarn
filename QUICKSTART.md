# 🚀 Quick Start Guide

## การติดตั้งด่วน (5 นาที)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Google Sheets API Key

**ขั้นตอนง่ายๆ:**

1. ไปที่: https://console.cloud.google.com/
2. สร้างโปรเจกต์ใหม่
3. เปิด "Google Sheets API"
4. สร้าง "API Key"
5. คัดลอก API Key

### 3. แก้ไขไฟล์ .env

เปิดไฟล์ `.env` และใส่ API Key:

```env
GOOGLE_SHEET_ID=1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA
GOOGLE_API_KEY=YOUR_API_KEY_HERE
PORT=3000
```

### 4. ตั้งค่า Google Sheet

1. เปิด: https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit
2. สร้าง Sheet ชื่อ "Hotels" (ดูโครงสร้างใน SAMPLE_DATA.md)
3. สร้าง Sheet ชื่อ "Admin" ใส่รหัสผ่าน
4. แชร์เป็น "Anyone with the link" - Viewer

### 5. เริ่มใช้งาน

```bash
npm start
```

เปิดเบราว์เซอร์: http://localhost:3000

---

## ⚡ คำสั่งที่ใช้บ่อย

```bash
# เริ่มเซิร์ฟเวอร์
npm start

# โหมด development (auto-reload)
npm run dev

# ติดตั้ง dependencies
npm install
```

---

## 📱 การเข้าใช้งาน

### หน้าแรก (Search Engine)
```
http://localhost:3000
```
- ค้นหาโรงแรม
- กรองตามตัวเลือก
- กดหัวใจโรงแรม
- ดูรายละเอียดโรงแรม

### แผงควบคุมแอดมิน
```
http://localhost:3000/admin
```
- จัดการโรงแรม
- ดูสถิติ
- จัดการข้อมูล

**รหัสผ่าน:**
- **สำหรับทดสอบ:** `123456` (รหัสชั่วคราว)
- **สำหรับใช้งานจริง:** ดึงจาก Google Sheet (Admin sheet)

**หมายเหตุ:** รหัสชั่วคราว `123456` ใช้สำหรับทดสอบระบบ สามารถลบได้โดยแก้ไขไฟล์ `services/googleSheets.js`

---

## 🔧 แก้ปัญหาเบื้องต้น

### ปัญหา: ไม่มีข้อมูลโรงแรม
✅ ตรวจสอบว่า Google Sheet มีข้อมูลและถูกแชร์แล้ว

### ปัญหา: API Error
✅ ตรวจสอบว่าเปิดใช้งาน Google Sheets API แล้ว
✅ ตรวจสอบ API Key ใน .env

### ปัญหา: ไม่สามารถแก้ไขข้อมูล
✅ ต้องใช้ Service Account (อ่าน GOOGLE_SHEETS_SETUP.md)

---

## 📚 เอกสารเพิ่มเติม

- `README.md` - คู่มือฉบับสมบูรณ์
- `GOOGLE_SHEETS_SETUP.md` - วิธีตั้งค่า Google Sheets แบบละเอียด
- `SAMPLE_DATA.md` - ตัวอย่างข้อมูล

---

## 🎯 โครงสร้างข้อมูลใน Google Sheet

### Sheet: "Hotels"
```
A: ID | B: ชื่อไทย | C: ชื่ออังกฤษ | D: รูปภาพ | E: ราคา | 
F: ตัวกรอง | G: รองรับ | H: ธนาคาร | I: ชื่อบัญชี | J: เลขบัญชี |
K: เบอร์โทร | L: Facebook | M: Line | N: Website | 
O: Map URL | P: Map Embed
```

### Sheet: "Admin"
```
A1: username | B1: password
A2: admin    | B2: your_password
```

---

## ✨ ฟีเจอร์หลัก

✅ Search Engine แบบ Real-time  
✅ ระบบกรองโรงแรม  
✅ ระบบกดหัวใจ (1 IP ต่อ 1 โรงแรม)  
✅ แผงควบคุมแอดมิน  
✅ สถิติการเข้าชมแบบ Real-time  
✅ เชื่อมต่อ Google Sheets  
✅ Responsive Design  
✅ พร้อมขยายฟีเจอร์

---

**Happy Coding! 🏝️**
