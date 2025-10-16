# 🎨 คู่มือการตั้งค่า Filters/Amenities (สิ่งอำนวยความสะดวก)

## 📊 โครงสร้าง Google Sheets - Filters Sheet

### คอลัมน์ทั้งหมด: **A - F** (6 คอลัมน์)

| คอลัมน์ | ชื่อ | ประเภท | ตัวอย่าง | คำอธิบาย |
|---------|------|--------|----------|----------|
| **A** | ID | Text | `beachfront` | รหัสเฉพาะ (ภาษาอังกฤษ, ไม่มีช่องว่าง) |
| **B** | NameTh | Text | `ติดทะเล` | ชื่อภาษาไทย |
| **C** | NameEn | Text | `Beachfront` | ชื่อภาษาอังกฤษ |
| **D** | Icon | Text | `fa-umbrella-beach` | ไอคอน Font Awesome |
| **E** | Enabled | Boolean | `true` | เปิด/ปิดใช้งาน |
| **F** | Color | Color Hex | `#667eea` | สีของ badge (รูปแบบ #RRGGBB) |

---

## 🎯 ข้อมูลเริ่มต้นที่แนะนำ

### Header (แถวที่ 1):
```
ID | NameTh | NameEn | Icon | Enabled | Color
```

### ข้อมูลตัวอย่าง (แถวที่ 2 เป็นต้นไป):

| ID | NameTh | NameEn | Icon | Enabled | Color |
|---|---|---|---|---|---|
| beachfront | ติดทะเล | Beachfront | fa-umbrella-beach | true | #667eea |
| breakfast | รวมอาหารเช้า | Breakfast Included | fa-utensils | true | #f093fb |
| freeShuttle | ฟรีรถรับส่ง | Free Shuttle | fa-bus | true | #4facfe |
| freeMotorcycle | ฟรีมอไซค์ | Free Motorcycle | fa-motorcycle | true | #43e97b |
| bathtub | มีอ่างอาบน้ำ | Bathtub | fa-bath | true | #fa709a |
| poolVilla | พูลวิลล่า | Pool Villa | fa-swimming-pool | true | #30cfd0 |
| poolTable | โต๊ะพูล | Pool Table | fa-table-tennis | true | #a8edea |
| wifi | WiFi ฟรี | Free WiFi | fa-wifi | true | #667eea |
| parking | ที่จอดรถ | Parking | fa-car | true | #f093fb |
| aircon | เครื่องปรับอากาศ | Air Conditioning | fa-snowflake | true | #4facfe |
| seaview | วิวทะเล | Sea View | fa-water | true | #30cfd0 |
| petfriendly | รับสัตว์เลี้ยง | Pet Friendly | fa-paw | true | #43e97b |

---

## 🎨 แนะนำสีที่สวยงาม

### Gradient Colors (เข้ากันดี):
```
#667eea - น้ำเงินม่วง (Blue Purple)
#f093fb - ชมพูอ่อน (Light Pink)
#4facfe - ฟ้าสดใส (Bright Blue)
#43e97b - เขียวมิ้นท์ (Mint Green)
#fa709a - ชมพูแดง (Pink Red)
#30cfd0 - เขียวมรกต (Turquoise)
#a8edea - เขียวพาสเทล (Pastel Green)
#feca57 - เหลืองทอง (Golden Yellow)
#ff6b6b - แดงส้ม (Red Orange)
#48dbfb - ฟ้าสว่าง (Sky Blue)
```

### Solid Colors:
```
#3498db - น้ำเงิน (Blue)
#2ecc71 - เขียว (Green)
#e74c3c - แดง (Red)
#f39c12 - ส้ม (Orange)
#9b59b6 - ม่วง (Purple)
#1abc9c - เขียวมรกต (Teal)
#e67e22 - ส้มเข้ม (Dark Orange)
#34495e - เทาเข้ม (Dark Gray)
```

---

## 🔍 ไอคอน Font Awesome ยอดนิยม

### สำหรับโรงแรม/ที่พัก:
```
fa-umbrella-beach - ชายหาด
fa-swimming-pool - สระว่ายน้ำ
fa-hot-tub - อ่างน้ำร้อน
fa-spa - สปา
fa-bed - เตียง
fa-door-open - ห้อง
fa-key - กุญแจ
fa-concierge-bell - เบลล์
```

### อาหาร/เครื่องดื่ม:
```
fa-utensils - อาหาร
fa-coffee - กาแฟ
fa-cocktail - เครื่องดื่ม
fa-glass-cheers - แชมเปญ
fa-ice-cream - ไอศกรีม
```

### ยานพาหนะ/การเดินทาง:
```
fa-bus - รถบัส
fa-taxi - แท็กซี่
fa-motorcycle - มอเตอร์ไซค์
fa-ship - เรือ
fa-plane - เครื่องบิน
fa-car - รถยนต์
fa-bicycle - จักรยาน
```

### สิ่งอำนวยความสะดวก:
```
fa-wifi - WiFi
fa-tv - ทีวี
fa-snowflake - แอร์
fa-fan - พัดลม
fa-wind - ลม
fa-temperature-low - ความเย็น
```

### กิจกรรม:
```
fa-dumbbell - ฟิตเนส
fa-table-tennis - ปิงปอง
fa-volleyball-ball - วอลเลย์บอล
fa-music - ดนตรี
fa-gamepad - เกม
```

### บริการ:
```
fa-paw - สัตว์เลี้ยง
fa-wheelchair - รถเข็น
fa-baby - เด็ก
fa-luggage-cart - รถเข็นสัมภาระ
fa-bell-concierge - บริการรับแขก
```

ดูไอคอนทั้งหมดได้ที่: **https://fontawesome.com/icons**

---

## ⚙️ การใช้งานในระบบ

### 1. **แผงควบคุม Admin (admin_v2.html)**
- เปิดแท็บ "สิ่งอำนวยความสะดวก"
- คลิก "+ เพิ่มสิ่งอำนวยความสะดวก"
- กรอกข้อมูล:
  - ชื่อภาษาไทย
  - ชื่อภาษาอังกฤษ
  - ไอคอน (เช่น `fa-wifi`)
  - เลือกสี (จากตัวเลือกสีหรือพิมพ์ #RRGGBB)
- คลิก "บันทึก"

### 2. **แก้ไขสิ่งอำนวยความสะดวก**
- คลิกปุ่ม "แก้ไข" (ไอคอนดินสอ) ที่สิ่งอำนวยความสะดวกที่ต้องการ
- แก้ไขข้อมูล
- คลิก "บันทึก"

### 3. **ลบสิ่งอำนวยความสะดวก**
- คลิกปุ่ม "ลบ" (ไอคอนถังขยะ) ที่สิ่งอำนวยความสะดวกที่ต้องการ
- ยืนยันการลบ

### 4. **ใช้งานในฟอร์มโรงแรม**
- เมื่อเพิ่ม/แก้ไขโรงแรม
- ในส่วน "สิ่งอำนวยความสะดวก"
- จะแสดงรายการ checkbox พร้อมไอคอนและสี
- เลือกได้หลายอัน
- ข้อมูลจะบันทึกเป็น comma-separated ใน column P

### 5. **การแสดงผลในเว็บไซต์หน้าแรก**
- Badge จะแสดงบนการ์ดโรงแรม (สูงสุด 3 อัน)
- มีไอคอนและสีตามที่กำหนด
- แสดงเต็มใน Modal รายละเอียดโรงแรม

---

## 🔧 โครงสร้างไฟล์ที่เกี่ยวข้อง

### Backend:
- **services/filters.js** - CRUD filters
- **server.js** - API endpoints (`/api/filters`, `/api/admin/filters`)

### Frontend Admin:
- **public/admin_v2.html** - UI ฟอร์มและรายการ
- **public/js/admin_v2.js** - Logic CRUD
- **public/css/admin_v2.css** - Styling

### Frontend Public:
- **public/index.html** - หน้าแรก
- **public/js/app.js** - แสดง filter buttons และ badges
- **public/css/style.css** - Styling badges

---

## ✅ Checklist การตรวจสอบ

### Google Sheets:
- [ ] มี Sheet ชื่อ "Filters"
- [ ] มี Header แถวที่ 1: ID, NameTh, NameEn, Icon, Enabled, Color
- [ ] คอลัมน์ Color เป็นรูปแบบ #RRGGBB (เช่น #667eea)
- [ ] คอลัมน์ Enabled เป็น `true` หรือ `false`
- [ ] ไอคอนขึ้นต้นด้วย `fa-`

### Admin Panel:
- [ ] เปิดได้หน้า "สิ่งอำนวยความสะดวก"
- [ ] เพิ่ม/แก้ไข/ลบได้ปกติ
- [ ] เห็นตัวอย่างสีและไอคอนในฟอร์ม
- [ ] แสดงรายการสิ่งอำนวยความสะดวกพร้อมสี

### Public Website:
- [ ] Filter buttons แสดงสี (เมื่อกด active)
- [ ] Badges บนการ์ดโรงแรมมีสี
- [ ] Badges ใน Modal รายละเอียดมีสี

---

## 🐛 Troubleshooting

### ปัญหา: สีไม่แสดง
- ตรวจสอบว่าคอลัมน์ F มีค่า #RRGGBB (6 หลัก)
- รีเฟรชหน้าเว็บ Ctrl+F5
- ตรวจสอบ Console ว่ามี error หรือไม่

### ปัญหา: ไอคอนไม่แสดง
- ตรวจสอบว่าใช้ชื่อไอคอนถูกต้อง (ดูที่ fontawesome.com)
- ตรวจสอบว่าขึ้นต้นด้วย `fa-`
- ลองไอคอนอื่น เช่น `fa-star`

### ปัญหา: ไม่บันทึกข้อมูล
- ตรวจสอบ Service Account มีสิทธิ์เขียน Google Sheets
- ตรวจสอบ Console ว่ามี error หรือไม่
- ตรวจสอบว่าล็อกอิน Admin แล้ว

---

## 📌 หมายเหตุ

- **สีต้องเป็นรูปแบบ Hex** (#RRGGBB) เท่านั้น ไม่ใช่ `red`, `blue`
- **ไอคอนต้องขึ้นต้นด้วย `fa-`** เช่น `fa-wifi`, `fa-swimming-pool`
- **ID ต้องไม่ซ้ำกัน** และใช้ภาษาอังกฤษ ไม่มีช่องว่าง
- **สามารถเพิ่มได้ไม่จำกัด** แต่แนะนำไม่เกิน 20-30 รายการ
- **การเปลี่ยนแปลงจะมีผลทันที** หลังจากบันทึกและรีเฟรช

---

## 🎨 ตัวอย่างการใช้งาน

### Scenario 1: เพิ่มสิ่งอำนวยความสะดวกใหม่ "WiFi ฟรี"
1. เปิด Admin → สิ่งอำนวยความสะดวก
2. คลิก "+ เพิ่มสิ่งอำนวยความสะดวก"
3. กรอก:
   - ชื่อไทย: `WiFi ฟรี`
   - ชื่ออังกฤษ: `Free WiFi`
   - ไอคอน: `fa-wifi`
   - สี: `#667eea` (เลือกจากตัวเลือกสี)
4. คลิก "บันทึก"
5. ไปที่ "โรงแรม" → เลือกโรงแรม → แก้ไข
6. ในส่วน "สิ่งอำนวยความสะดวก" จะมี "WiFi ฟรี" ให้เลือก

### Scenario 2: เปลี่ยนสีของ "ติดทะเล"
1. เปิด Admin → สิ่งอำนวยความสะดวก
2. คลิก "แก้ไข" ที่ "ติดทะเล"
3. เปลี่ยนสีเป็น `#30cfd0` (สีเขียวมรกต)
4. คลิก "บันทึก"
5. รีเฟรชหน้าเว็บหลัก → badge "ติดทะเล" จะเป็นสีเขียวมรกต

---

**อัพเดทล่าสุด:** 2025-10-05  
**เวอร์ชัน:** 2.0 (รองรับสี Badge)
