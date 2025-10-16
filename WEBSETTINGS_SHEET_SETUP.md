# 🎨 WebSettings Sheet Setup Guide

## ขั้นตอนการสร้าง Sheet ใหม่ใน Google Sheets

### 1. เปิด Google Sheets ของคุณ
ไปที่ Spreadsheet ID: `1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA`

### 2. สร้าง Sheet ใหม่
- คลิกปุ่ม **+** ที่มุมล่างซ้าย
- ตั้งชื่อ Sheet ว่า: **WebSettings**

### 3. สร้างโครงสร้างตาราง

#### Header Row (แถวที่ 1):
| A | B | C | D |
|---|---|---|---|
| Setting | Value | LastModified | ModifiedBy |

#### Data Rows (แถวที่ 2-14):

| Setting | Value | LastModified | ModifiedBy |
|---------|-------|--------------|------------|
| site_name_th | ค้นหาโรงแรมเกาะล้าน | 2025-01-09 10:00:00 | System |
| site_name_en | Koh Larn Hotel Search Engine | 2025-01-09 10:00:00 | System |
| header_bg_color | #ffffff | 2025-01-09 10:00:00 | System |
| body_bg_gradient_start | #667eea | 2025-01-09 10:00:00 | System |
| body_bg_gradient_end | #764ba2 | 2025-01-09 10:00:00 | System |
| filter_button_bg_start | #667eea | 2025-01-09 10:00:00 | System |
| filter_button_bg_end | #764ba2 | 2025-01-09 10:00:00 | System |
| card_hotel_name_color | #2d3436 | 2025-01-09 10:00:00 | System |
| card_price_color | #0066cc | 2025-01-09 10:00:00 | System |
| site_name_th_color | #2d3436 | 2025-01-09 10:00:00 | System |
| site_name_en_color | #636e72 | 2025-01-09 10:00:00 | System |
| favicon_type | emoji | 2025-01-10 10:00:00 | System |
| favicon_emoji | 🏝️ | 2025-01-10 10:00:00 | System |
| favicon_url |  | 2025-01-10 10:00:00 | System |

### 4. จัดรูปแบบ (Optional)

#### Header (แถวที่ 1):
- สีพื้นหลัง: `#667eea`
- สีตัวอักษร: `#ffffff`
- ตัวหนา (Bold)
- จัดกึ่งกลาง

#### Columns Width:
- Column A (Setting): 250px
- Column B (Value): 300px
- Column C (LastModified): 200px
- Column D (ModifiedBy): 150px

### 5. ทดสอบการเชื่อมต่อ
หลังจากสร้าง Sheet เสร็จแล้ว ไปที่ Admin Panel > แก้ไขหน้าเว็บไซต์ เพื่อทดสอบระบบ

## 📝 คำอธิบาย Settings

| Setting | คำอธิบาย | ค่าเริ่มต้น |
|---------|----------|------------|
| `site_name_th` | ชื่อเว็บไซต์ภาษาไทย | ค้นหาโรงแรมเกาะล้าน |
| `site_name_en` | ชื่อเว็บไซต์ภาษาอังกฤษ | Koh Larn Hotel Search Engine |
| `site_name_th_color` | สีชื่อเว็บไซต์ภาษาไทย | #2d3436 (เทาเข้ม) |
| `site_name_en_color` | สีชื่อเว็บไซต์ภาษาอังกฤษ | #636e72 (เทาอ่อน) |
| `header_bg_color` | สีพื้นหลัง Header | #ffffff (ขาว) |
| `body_bg_gradient_start` | สีเริ่มต้น Gradient พื้นหลัง | #667eea (ม่วงน้ำเงิน) |
| `body_bg_gradient_end` | สีสิ้นสุด Gradient พื้นหลัง | #764ba2 (ม่วง) |
| `filter_button_bg_start` | สีเริ่มต้นปุ่มตัวกรอง | #667eea |
| `filter_button_bg_end` | สีสิ้นสุดปุ่มตัวกรอง | #764ba2 |
| `card_hotel_name_color` | สีชื่อโรงแรมบนการ์ด | #2d3436 (เทาเข้ม) |
| `card_price_color` | สีราคาบนการ์ด | #0066cc (น้ำเงิน) |
| `favicon_type` | ประเภทไอคอน (emoji/url) | emoji |
| `favicon_emoji` | Emoji สำหรับไอคอน | 🏝️ |
| `favicon_url` | URL รูปภาพไอคอน (ถ้าใช้ URL) | (ว่าง) |

## ✅ Checklist

- [ ] สร้าง Sheet ชื่อ "WebSettings"
- [ ] ใส่ Header Row (Setting, Value, LastModified, ModifiedBy)
- [ ] ใส่ค่าเริ่มต้นทั้ง 14 rows
- [ ] จัดรูปแบบ Header (สีพื้นหลัง + สีตัวอักษร)
- [ ] ทดสอบในระบบ Admin

## 🎯 ผลลัพธ์

หลังจากตั้งค่าเสร็จ คุณจะสามารถ:
- ✅ แก้ไขชื่อเว็บไซต์แบบเรียลไทม์ผ่าน Admin Panel
- ✅ เปลี่ยนสีต่างๆ ได้ทันทีโดยไม่ต้องแก้ไขโค้ด
- ✅ เปลี่ยนไอคอนเว็บไซต์ (Favicon) ได้ (Emoji หรือ URL รูปภาพ)
- ✅ บันทึกประวัติการแก้ไข (วันที่ + ผู้แก้ไข)
- ✅ ดูตัวอย่างสีและไอคอนแบบเรียลไทม์ก่อนบันทึก
