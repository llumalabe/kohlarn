# 🗺️ แผนที่ Checkbox ในฟอร์ม Admin

## 📋 ความสัมพันธ์ระหว่างฟอร์ม HTML กับ Google Sheets

เนื่องจากฟอร์ม `admin.html` มี checkbox ที่ตั้งชื่อไว้เดิม แต่เราต้องการให้ตรงกับ Google Sheets
ระบบจึงทำการ **แมป (map)** ชื่อฟิลด์ดังนี้:

### ตาราง Checkbox Mapping

| ฟอร์ม HTML (ID เดิม) | Google Sheets (ชื่อจริง) | ไอคอน | คำอธิบาย |
|---------------------|------------------------|-------|----------|
| `beachfront` | `beach` | 🏖️ | ติดชายหาด / ใกล้ชายหาด |
| `poolVilla` | `pool` | 🏊 | สระว่ายน้ำ |
| `bathtub` | `wifi` | 📶 | WiFi ฟรี |
| `freeShuttle` | `parking` | 🚗 | ที่จอดรถ |
| `breakfast` | `breakfast` | ☕ | อาหารเช้า (ตรงกัน) |
| `freeMotorcycle` | `restaurant` | 🍽️ | ร้านอาหาร |

## 🔄 การทำงาน

### เมื่อโหลดข้อมูล (Load):
```javascript
// Google Sheets → ฟอร์ม HTML
document.getElementById('beachfront').checked = hotel.beach;
document.getElementById('poolVilla').checked = hotel.pool;
document.getElementById('bathtub').checked = hotel.wifi;
document.getElementById('freeShuttle').checked = hotel.parking;
document.getElementById('breakfast').checked = hotel.breakfast;
document.getElementById('freeMotorcycle').checked = hotel.restaurant;
```

### เมื่อบันทึกข้อมูล (Save):
```javascript
// ฟอร์ม HTML → Google Sheets
hotel.beach = document.getElementById('beachfront').checked;
hotel.pool = document.getElementById('poolVilla').checked;
hotel.wifi = document.getElementById('bathtub').checked;
hotel.parking = document.getElementById('freeShuttle').checked;
hotel.breakfast = document.getElementById('breakfast').checked;
hotel.restaurant = document.getElementById('freeMotorcycle').checked;
```

## 📝 ตัวอย่างการใช้งาน

### ในฟอร์ม HTML (`admin.html`):
```html
<!-- Checkbox ในฟอร์มยังคงชื่อเดิม -->
<label>
    <input type="checkbox" id="beachfront">
    ติดทะเล
</label>

<label>
    <input type="checkbox" id="poolVilla">
    สระว่ายน้ำ
</label>

<label>
    <input type="checkbox" id="bathtub">
    WiFi ฟรี
</label>
```

### ในฐานข้อมูล Google Sheets:
```
| beach | pool | wifi | parking | breakfast | restaurant |
|-------|------|------|---------|-----------|------------|
| TRUE  | TRUE | TRUE | FALSE   | TRUE      | FALSE      |
```

## 🎯 สาเหตุที่ต้องแมป

1. **ฟอร์ม HTML สร้างไว้ก่อน** มีชื่อ ID อย่าง `beachfront`, `poolVilla` เป็นต้น
2. **Google Sheets มีโครงสร้างใหม่** ใช้ชื่อ `beach`, `pool`, `wifi`, `parking`, `breakfast`, `restaurant`
3. **ไม่ต้องแก้ HTML** แค่แมปใน JavaScript ก็ทำให้ระบบทำงานได้ถูกต้อง

## ⚡ ข้อดีของการแมป

- ✅ ไม่ต้องแก้ไฟล์ HTML
- ✅ รักษาเสถียรภาพของโค้ดเดิม
- ✅ รองรับทั้งโครงสร้างเก่าและใหม่
- ✅ แก้ไขง่าย อยู่ที่จุดเดียวใน `admin.js`

## 🚨 สิ่งที่ควรทราบ

### Checkbox ที่ไม่ได้ใช้แล้ว:
เดิมฟอร์มมี checkbox เหล่านี้ แต่ไม่มีใน Google Sheets ใหม่:
- ❌ `poolTable` (โต๊ะบิลเลียด)
- ❌ `freeShuttle` กับ `freeMotorcycle` (ถูกแมปเป็น parking กับ restaurant)

### ค่าเริ่มต้น:
ถ้า checkbox ไม่ได้ติ๊ก → บันทึกเป็น `false` ใน Google Sheets

### การแสดงผลในตาราง:
```javascript
// แสดง badge เฉพาะที่มีค่า true
${hotel.beach ? '<span class="badge">ชายหาด</span>' : ''}
${hotel.pool ? '<span class="badge">สระว่ายน้ำ</span>' : ''}
```

## 📚 สรุป

**ลำดับการทำงาน:**
1. User ติ๊ก checkbox `beachfront` ในฟอร์ม
2. JavaScript อ่านค่า `document.getElementById('beachfront').checked`
3. แมปเป็น `hotel.beach = true`
4. บันทึกลง Google Sheets คอลัมน์ `beach`
5. เมื่อโหลดกลับมา อ่านจาก `hotel.beach` → แสดงที่ checkbox `beachfront`

**ผลลัพธ์:** ระบบทำงานได้ถูกต้อง แม้ชื่อ ID ในฟอร์มจะไม่ตรงกับชื่อคอลัมน์ใน Google Sheets! 🎉
