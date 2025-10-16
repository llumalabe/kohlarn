# 🎨 Quick Start: ระบบแก้ไขหน้าเว็บไซต์

## ⚡ ขั้นตอนการเริ่มใช้งาน (3 นาที)

### 1️⃣ สร้าง Google Sheet "WebSettings"

เปิด Google Sheets: `https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit`

**คลิก + สร้าง Sheet ใหม่** ตั้งชื่อว่า: `WebSettings`

**Copy-Paste ข้อมูลนี้เข้าไป:**

```
Setting	Value	LastModified	ModifiedBy
site_name_th	ค้นหาโรงแรมเกาะล้าน	2025-01-09 10:00:00	System
site_name_en	Koh Larn Hotel Search Engine	2025-01-09 10:00:00	System
header_bg_color	#ffffff	2025-01-09 10:00:00	System
body_bg_gradient_start	#667eea	2025-01-09 10:00:00	System
body_bg_gradient_end	#764ba2	2025-01-09 10:00:00	System
filter_button_bg_start	#667eea	2025-01-09 10:00:00	System
filter_button_bg_end	#764ba2	2025-01-09 10:00:00	System
card_hotel_name_color	#2d3436	2025-01-09 10:00:00	System
card_price_color	#0066cc	2025-01-09 10:00:00	System
site_name_th_color	#2d3436	2025-01-09 10:00:00	System
site_name_en_color	#636e72	2025-01-09 10:00:00	System
```

### 2️⃣ ทดสอบระบบ

1. **เปิด Admin Panel:** `http://192.168.1.26:3000/admin`
2. **Login:** ใช้ username และ password ของคุณ
3. **ไปที่เมนู:** การจัดการ → แก้ไขหน้าเว็บไซต์
4. **ลองเปลี่ยนสี:** คลิกที่ color picker
5. **ดูตัวอย่าง:** ดูผลทันทีในส่วน Preview
6. **บันทึก:** คลิก "บันทึกการเปลี่ยนแปลง"

### 3️⃣ ตรวจสอบผลลัพธ์

1. **เปิดหน้าแรก:** `http://192.168.1.26:3000`
2. **Hard Refresh:** กด `Ctrl + Shift + R` (Windows) หรือ `Cmd + Shift + R` (Mac)
3. **ดูการเปลี่ยนแปลง:** สีและชื่อจะอัปเดตตามที่ตั้งค่า ✨

---

## 🎨 คุณสมบัติ

✅ **แก้ไขชื่อเว็บไซต์** (ไทย/อังกฤษ)
✅ **เปลี่ยนสีพื้นหลัง Header**
✅ **ปรับสี Gradient พื้นหลังเว็บ**
✅ **เปลี่ยนสีปุ่มตัวกรอง**
✅ **ปรับสีชื่อโรงแรมและราคาบนการ์ด**
✅ **ดูตัวอย่างแบบเรียลไทม์**
✅ **บันทึกลง Google Sheets อัตโนมัติ**

---

## 🔧 ไฟล์ที่ถูกสร้าง/แก้ไข

### Backend
- ✅ `services/googleSheets.js` - เพิ่ม `getWebSettings()` และ `updateWebSettings()`
- ✅ `server.js` - เพิ่ม API endpoints `/api/websettings`

### Frontend (Admin)
- ✅ `public/admin_v2.html` - เพิ่มหน้า WebSettings
- ✅ `public/css/admin_v2.css` - เพิ่ม styles สำหรับหน้า WebSettings
- ✅ `public/js/admin_v2.js` - เพิ่มฟังก์ชัน load/save/preview

### Frontend (Public)
- ✅ `public/css/style.css` - เปลี่ยนเป็น CSS Variables
- ✅ `public/js/app.js` - เพิ่มฟังก์ชัน load และ apply settings

### Documentation
- ✅ `WEBSETTINGS_SHEET_SETUP.md` - คู่มือตั้งค่า Google Sheets
- ✅ `WEBSETTINGS_GUIDE.md` - คู่มือการใช้งานฉบับเต็ม

---

## 📋 Google Sheets Structure

### Sheet: WebSettings

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| **Setting** | **Value** | **LastModified** | **ModifiedBy** |
| site_name_th | ค้นหาโรงแรมเกาะล้าน | 2025-01-09... | System |
| site_name_en | Koh Larn Hotel... | 2025-01-09... | System |
| header_bg_color | #ffffff | 2025-01-09... | System |
| body_bg_gradient_start | #667eea | 2025-01-09... | System |
| body_bg_gradient_end | #764ba2 | 2025-01-09... | System |
| filter_button_bg_start | #667eea | 2025-01-09... | System |
| filter_button_bg_end | #764ba2 | 2025-01-09... | System |
| card_hotel_name_color | #2d3436 | 2025-01-09... | System |
| card_price_color | #0066cc | 2025-01-09... | System |

---

## 🎯 วิธีใช้งาน (Step by Step)

### แก้ไขชื่อเว็บไซต์
1. ไปที่: **การจัดการ → แก้ไขหน้าเว็บไซต์**
2. พิมพ์ชื่อใหม่ในช่อง "ชื่อภาษาไทย" และ "ชื่อภาษาอังกฤษ"
3. ดูตัวอย่างในส่วน Preview
4. คลิก **"บันทึกการเปลี่ยนแปลง"**

### เปลี่ยนสีพื้นหลัง
1. คลิกที่ **กล่องสี** (Color Picker)
2. เลือกสีที่ต้องการ หรือพิมพ์รหัส HEX (เช่น #ff5733)
3. ดูตัวอย่างทันทีในส่วน Preview
4. คลิก **"บันทึกการเปลี่ยนแปลง"**

### รีเซ็ตเป็นค่าเริ่มต้น
1. คลิกปุ่ม **"รีเซ็ตเป็นค่าเริ่มต้น"** (สีแดง)
2. ยืนยันการรีเซ็ต
3. ตรวจสอบค่าในฟอร์ม
4. คลิก **"บันทึกการเปลี่ยนแปลง"** หากต้องการบันทึก

---

## 🎨 Color Recommendations

### สีที่แนะนำสำหรับ Gradient

**สีน้ำเงิน-ม่วง (ค่าเริ่มต้น):**
- Start: `#667eea`
- End: `#764ba2`

**สีเขียว-ฟ้า:**
- Start: `#11998e`
- End: `#38ef7d`

**สีชมพู-ส้ม:**
- Start: `#ee0979`
- End: `#ff6a00`

**สีส้ม-เหลือง:**
- Start: `#f093fb`
- End: `#f5576c`

**เครื่องมือช่วย:**
- 🎨 [Coolors.co](https://coolors.co/) - Color Palette Generator
- 🎨 [CSS Gradient](https://cssgradient.io/) - Gradient Generator
- 🎨 [Color Hunt](https://colorhunt.co/) - Color Palettes

---

## 🐛 Troubleshooting

### ❌ การตั้งค่าไม่อัปเดต
- ✅ ตรวจสอบว่าสร้าง Sheet "WebSettings" แล้ว
- ✅ Hard refresh หน้าเว็บ (Ctrl + Shift + R)
- ✅ ตรวจสอบ Console สำหรับ errors

### ❌ สีไม่แสดงผล
- ✅ ตรวจสอบรูปแบบรหัสสี (ต้องเป็น #RRGGBB)
- ✅ ตรวจสอบว่า CSS Variables ถูก apply
- ✅ ลอง hard refresh อีกครั้ง

### ❌ ไม่สามารถบันทึกได้
- ✅ ตรวจสอบว่า login อยู่
- ✅ ตรวจสอบ Google Sheets permissions
- ✅ ดู Network tab ใน Console

---

## 📱 Responsive Support

ระบบรองรับ:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)
- ✅ Extra Small (< 480px)

---

## 🎉 สรุป

**ตอนนี้คุณสามารถ:**
1. ✅ แก้ไขชื่อเว็บไซต์แบบเรียลไทม์
2. ✅ เปลี่ยนสีต่างๆ ได้อย่างง่ายดาย
3. ✅ ดูตัวอย่างก่อนบันทึก
4. ✅ บันทึกลง Google Sheets อัตโนมัติ
5. ✅ **ไม่ต้องแก้โค้ดเลย!**

**ลองใช้งานเลย:** `http://192.168.1.26:3000/admin` → การจัดการ → แก้ไขหน้าเว็บไซต์

---

📖 **คู่มือเต็ม:** อ่านได้ที่ `WEBSETTINGS_GUIDE.md`
📋 **คู่มือตั้งค่า Google Sheets:** อ่านได้ที่ `WEBSETTINGS_SHEET_SETUP.md`
