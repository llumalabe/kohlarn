# 🎨 WebSettings Update Summary

## ✅ การปรับปรุง```
Setting	Value	LastModified	ModifiedBy
site_name_th	ค้นหาโรงแรมเกาะล้าน	2025-01-10 00:00:00	System
site_name_en	Koh Larn Hotel Search Engine	2025-01-10 00:00:00	System
header_bg_color	#ffffff	2025-01-10 00:00:00	System
body_bg_gradient_start	#667eea	2025-01-10 00:00:00	System
body_bg_gradient_end	#764ba2	2025-01-10 00:00:00	System
filter_button_bg_start	#667eea	2025-01-10 00:00:00	System
filter_button_bg_end	#764ba2	2025-01-10 00:00:00	System
card_hotel_name_color	#2d3436	2025-01-10 00:00:00	System
card_price_color	#0066cc	2025-01-10 00:00:00	System
site_name_th_color	#2d3436	2025-01-10 00:00:00	System
site_name_en_color	#636e72	2025-01-10 00:00:00	System
```⃣ เพิ่มการเปลี่ยนสีชื่อเว็บไซต์ (ไทย + อังกฤษ)

**ก่อนหน้า:** สีชื่อเว็บไซต์ fix ใน CSS ไม่สามารถเปลี่ยนได้

**ตอนนี้:** สามารถเปลี่ยนสีชื่อทั้งภาษาไทยและอังกฤษแยกกันได้

**Settings ใหม่:**
- `site_name_th_color` - สีชื่อเว็บไซต์ภาษาไทย (ค่าเริ่มต้น: #2d3436)
- `site_name_en_color` - สีชื่อเว็บไซต์ภาษาอังกฤษ (ค่าเริ่มต้น: #636e72)

---

### 2️⃣ ปรับ Preview ให้เป็นการ์ดแบบหน้าหลัก

**ก่อนหน้า:** Preview แสดงเป็นข้อความธรรมดา

**ตอนนี้:** Preview แสดงเป็นการ์ดโรงแรมแบบเต็มรูปแบบ เหมือนในหน้าหลัก

**คุณสมบัติ Preview Card:**
- 🖼️ รูปภาพตัวอย่าง
- 🏨 ชื่อโรงแรมภาษาไทย (ปรับสีได้)
- 🏨 ชื่อโรงแรมภาษาอังกฤษ
- 💰 ราคา (ปรับสีได้)
- ✨ Feature Tags (WiFi, สระว่ายน้ำ, ร้านอาหาร)
- 🎨 Hover effect เหมือนการ์ดจริง

---

### 3️⃣ แก้ไขปัญหาบันทึกลง Google Sheets

**ปัญหา:** ระบบไม่บันทึกการตั้งค่าลง Google Sheets

**สาเหตุ:** ระบบมีอยู่แล้ว แต่ต้องสร้าง Sheet "WebSettings" ใน Google Sheets ก่อน

**วิธีแก้:**
1. เปิด Google Sheets: `1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA`
2. สร้าง Sheet ใหม่ชื่อ **"WebSettings"**
3. Copy-Paste ข้อมูลจากเอกสาร `WEBSETTINGS_SHEET_SETUP.md`

---

## 📋 Google Sheets Structure (อัปเดต)

### Sheet: WebSettings

ต้องมี **11 rows** (เพิ่มจาก 9 rows):

```
Setting	Value	LastModified	ModifiedBy
site_name_th	ค้นหาโรงแรมเกาะล้าน	2025-01-09 10:00:00	System
site_name_en	Koh Larn Hotel Search Engine	2025-01-09 10:00:00	System
site_name_th_color	#2d3436	2025-01-09 10:00:00	System
site_name_en_color	#636e72	2025-01-09 10:00:00	System
header_bg_color	#ffffff	2025-01-09 10:00:00	System
body_bg_gradient_start	#667eea	2025-01-09 10:00:00	System
body_bg_gradient_end	#764ba2	2025-01-09 10:00:00	System
filter_button_bg_start	#667eea	2025-01-09 10:00:00	System
filter_button_bg_end	#764ba2	2025-01-09 10:00:00	System
card_hotel_name_color	#2d3436	2025-01-09 10:00:00	System
card_price_color	#0066cc	2025-01-09 10:00:00	System
```

---

## 🎨 ไฟล์ที่อัปเดต

### Frontend (Admin Panel)
- ✅ `public/admin_v2.html`
  - เพิ่มฟอร์มสีชื่อเว็บไซต์ (ไทย + อังกฤษ)
  - เปลี่ยน Preview เป็นการ์ดโรงแรมแบบเต็ม

- ✅ `public/css/admin_v2.css`
  - เพิ่ม CSS สำหรับ Preview Hotel Card
  - `.preview-hotel-card`
  - `.preview-hotel-image`
  - `.preview-hotel-info`
  - `.preview-hotel-features`

- ✅ `public/js/admin_v2.js`
  - อัปเดต `loadWebSettings()` - รองรับสีชื่อเว็บ
  - อัปเดต `previewChanges()` - ใช้สีกับ Preview
  - อัปเดต `saveWebSettings()` - บันทึกสีชื่อเว็บ
  - อัปเดต `resetToDefaults()` - รีเซ็ตสีชื่อเว็บ

### Frontend (Public Website)
- ✅ `public/css/style.css`
  - เพิ่ม CSS Variables:
    - `--site-name-th-color`
    - `--site-name-en-color`
  - อัปเดต `header h1` ใช้ `var(--site-name-th-color)`
  - อัปเดต `header .subtitle` ใช้ `var(--site-name-en-color)`

- ✅ `public/js/app.js`
  - อัปเดต `applyWebSettings()` - apply สีชื่อเว็บ

### Backend
- ✅ `services/googleSheets.js`
  - อัปเดต `getWebSettings()` - เพิ่ม defaults สีชื่อเว็บ

### Documentation
- ✅ `WEBSETTINGS_SHEET_SETUP.md` - อัปเดตโครงสร้าง (11 rows)

---

## 🚀 วิธีใช้งานใหม่

### ขั้นตอนที่ 1: สร้าง/อัปเดต Google Sheet

1. **เปิด Google Sheets**
   ```
   https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit
   ```

2. **หาก Sheet "WebSettings" ยังไม่มี:**
   - คลิก **+** สร้าง Sheet ใหม่
   - ตั้งชื่อ: **WebSettings**
   - Copy-Paste ข้อมูลทั้ง 11 rows

3. **หาก Sheet "WebSettings" มีอยู่แล้ว:**
   - เพิ่ม 2 rows ใหม่ **ต่อท้าย** `card_price_color`:
   ```
   site_name_th_color	#2d3436	2025-01-10 00:00:00	System
   site_name_en_color	#636e72	2025-01-10 00:00:00	System
   ```
   - ใส่ที่แถวที่ 12 และ 13 (หลัง `card_price_color`)

### ขั้นตอนที่ 2: ทดสอบระบบ

1. **ไปที่ Admin Panel:**
   ```
   http://192.168.1.26:3000/admin
   ```

2. **Login**

3. **ไปที่:** การจัดการ → แก้ไขหน้าเว็บไซต์

4. **ตรวจสอบ:**
   - ✅ มีช่องเปลี่ยนสีชื่อเว็บไซต์ (ไทย + อังกฤษ)
   - ✅ Preview แสดงเป็นการ์ดโรงแรม
   - ✅ เปลี่ยนสีแล้วเห็นผลใน Preview ทันที

5. **ลองเปลี่ยนสี:**
   - เปลี่ยนสีชื่อภาษาไทย เช่น #e74c3c (แดง)
   - เปลี่ยนสีชื่อภาษาอังกฤษ เช่น #3498db (น้ำเงิน)
   - คลิก **"บันทึกการเปลี่ยนแปลง"**

6. **ตรวจสอบ Google Sheets:**
   - เปิด Sheet "WebSettings"
   - ตรวจสอบว่ามีการอัปเดต LastModified และ ModifiedBy
   - ✅ ถ้าอัปเดตแล้ว = ระบบทำงานปกติ!

### ขั้นตอนที่ 3: ดูผลลัพธ์

1. **เปิดหน้าแรก:**
   ```
   http://192.168.1.26:3000
   ```

2. **Hard Refresh:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **ตรวจสอบ:**
   - ✅ ชื่อเว็บไซต์ภาษาไทยเปลี่ยนสี
   - ✅ ชื่อเว็บไซต์ภาษาอังกฤษเปลี่ยนสี
   - ✅ สีบนการ์ดโรงแรมเปลี่ยนตามที่ตั้งค่า

---

## 🎯 คุณสมบัติทั้งหมด (11 Settings)

| # | Setting | คำอธิบาย | ค่าเริ่มต้น |
|---|---------|----------|------------|
| 1 | `site_name_th` | ชื่อเว็บไซต์ภาษาไทย | ค้นหาโรงแรมเกาะล้าน |
| 2 | `site_name_en` | ชื่อเว็บไซต์ภาษาอังกฤษ | Koh Larn Hotel Search Engine |
| 3 | `header_bg_color` | สีพื้นหลัง Header | #ffffff |
| 4 | `body_bg_gradient_start` | สีเริ่มต้น Gradient | #667eea |
| 5 | `body_bg_gradient_end` | สีสิ้นสุด Gradient | #764ba2 |
| 6 | `filter_button_bg_start` | สีปุ่มตัวกรอง (เริ่ม) | #667eea |
| 7 | `filter_button_bg_end` | สีปุ่มตัวกรอง (สิ้นสุด) | #764ba2 |
| 8 | `card_hotel_name_color` | สีชื่อโรงแรมบนการ์ด | #2d3436 |
| 9 | `card_price_color` | สีราคาบนการ์ด | #0066cc |
| 10 | `site_name_th_color` | **🆕 สีชื่อเว็บภาษาไทย** | #2d3436 |
| 11 | `site_name_en_color` | **🆕 สีชื่อเว็บภาษาอังกฤษ** | #636e72 |

---

## 🐛 Troubleshooting

### ❌ ปัญหา: ไม่สามารถบันทึกลง Google Sheets

**สาเหตุที่เป็นไปได้:**

1. **ยังไม่สร้าง Sheet "WebSettings"**
   - ✅ แก้ไข: สร้าง Sheet ตาม `WEBSETTINGS_SHEET_SETUP.md`

2. **Sheet ชื่อผิด**
   - ✅ แก้ไข: ต้องตั้งชื่อ **"WebSettings"** (ตัวพิมพ์ใหญ่-เล็กต้องตรงกัน)

3. **ไม่มี service-account.json หรือ permission ไม่ถูกต้อง**
   - ✅ แก้ไข: ตรวจสอบว่า service account มี permission write

4. **โครงสร้าง Sheet ไม่ถูกต้อง**
   - ✅ แก้ไข: Column A ต้องเป็น Setting name
   - ✅ Column B ต้องเป็น Value

### ✅ วิธีตรวจสอบ

1. **ดู Console ใน Browser:**
   - กด F12 → Console
   - ดู error messages

2. **ตรวจสอบ Network Tab:**
   - กด F12 → Network
   - คลิก "บันทึก"
   - ดู POST /api/websettings
   - ถ้า Status 200 = สำเร็จ
   - ถ้า Status 401 = ปัญหา authentication
   - ถ้า Status 500 = ปัญหา server/Google Sheets

3. **ตรวจสอบ Server Log:**
   - ดูใน Terminal ที่รัน node server.js
   - ดู error messages

---

## 🎨 ตัวอย่างการใช้งาน

### การเปลี่ยนสีชื่อเว็บ

**ธีม Dark (ชื่อสีขาว):**
```
site_name_th_color: #ffffff
site_name_en_color: #ecf0f1
header_bg_color: #2c3e50
```

**ธีม Colorful (ชื่อสีสด):**
```
site_name_th_color: #e74c3c  (แดง)
site_name_en_color: #3498db  (น้ำเงิน)
header_bg_color: #ffffff
```

**ธีม Elegant (ชื่อสีทอง):**
```
site_name_th_color: #d4af37  (ทอง)
site_name_en_color: #9b7e46  (ทองเข้ม)
header_bg_color: #1a1a1a
```

---

## ✨ ข้อดีของการอัปเดตนี้

1. **ยืดหยุ่นมากขึ้น**
   - เปลี่ยนสีชื่อเว็บได้ตามธีม
   - สีไทยและอังกฤษแยกกันได้

2. **Preview ชัดเจนขึ้น**
   - เห็นการ์ดโรงแรมแบบเต็มรูปแบบ
   - ดูผลลัพธ์ได้แม่นยำก่อนบันทึก

3. **แก้ปัญหาการบันทึก**
   - เอกสารครบถ้วนสำหรับสร้าง Google Sheet
   - มีคำแนะนำ troubleshooting

---

## 📱 Server Status

เซิร์ฟเวอร์กำลังรันอยู่:
- 📱 Local: `http://localhost:3000`
- 🌐 Network: `http://192.168.1.26:3000`
- 🔐 Admin: `http://192.168.1.26:3000/admin`

---

## 📚 เอกสารเพิ่มเติม

- `WEBSETTINGS_SHEET_SETUP.md` - วิธีสร้าง Google Sheet
- `WEBSETTINGS_GUIDE.md` - คู่มือการใช้งานฉบับเต็ม
- `WEBSETTINGS_QUICKSTART.md` - Quick Start Guide

---

**🎉 อัปเดตเสร็จสมบูรณ์!**

ลองสร้าง Sheet "WebSettings" แล้วทดสอบระบบได้เลยครับ 😊
