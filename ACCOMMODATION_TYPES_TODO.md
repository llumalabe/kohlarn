# สถานะการพัฒนาระบบประเภทที่พัก (Accommodation Types)

## ✅ เสร็จแล้ว (HTML)

1. **เมนูใหม่** - เพิ่มเมนู "ประเภทที่พัก" ระหว่าง "สิ่งอำนวยความสะดวก" และ "ประเภทห้องพัก"
2. **หน้าจัดการ** - หน้า `accommodationTypesPage` พร้อม list และปุ่มเพิ่ม
3. **Modal** - ฟอร์มเพิ่ม/แก้ไขประเภทที่พัก (คล้ายกับ Room Types)
4. **ฟอร์มโรงแรม** - เพิ่มช่องเลือกประเภทที่พักระหว่าง Filters และ Room Types

## ⏳ กำลังทำ (JavaScript)

### ต้องเพิ่มใน admin_v2.js:

1. **Navigation Handler**
   ```javascript
   if (page === 'accommodation-types') loadAccommodationTypes();
   ```

2. **Load & Display Functions**
   ```javascript
   async function loadAccommodationTypes()
   function displayAccommodationTypes(accommodationTypes)
   ```

3. **Modal Functions**
   ```javascript
   function openAddAccommodationTypeModal()
   function closeAccommodationTypeModal()
   function editAccommodationType(id)
   ```

4. **Save & Delete Functions**
   ```javascript
   async function saveAccommodationType(event)
   async function deleteAccommodationType(id)
   ```

5. **Color Preview**
   ```javascript
   function updateAccommodationTypeColorPreview(color, icon)
   // Event listeners for color inputs
   ```

6. **Checkbox Loader for Hotel Form**
   ```javascript
   async function loadAccommodationTypeCheckboxes()
   ```

7. **Save Hotel - รวมประเภทที่พัก**
   ```javascript
   const selectedAccommodationTypes = [];
   const accommodationTypeCheckboxes = document.querySelectorAll('#accommodationTypesCheckboxes input[type="checkbox"]:checked');
   // ... add to hotel object
   ```

8. **Load Hotel Data - โหลดประเภทที่พักที่เลือกไว้**
   ```javascript
   if (hotel.accommodationTypes) {
       const selectedAccommodationTypes = hotel.accommodationTypes.split(',');
       // ... check checkboxes
   }
   ```

## ⏳ ยังไม่เริ่ม (Backend)

### 1. API Endpoints ใหม่ใน server.js:

```javascript
// GET /api/accommodation-types - ดึงข้อมูลทั้งหมด
// POST /api/admin/accommodation-types - เพิ่มใหม่
// PUT /api/admin/accommodation-types/:id - แก้ไข
// DELETE /api/admin/accommodation-types/:id - ลบ
```

### 2. Service ใหม่: services/accommodationTypes.js

```javascript
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/accommodation-types.json');

async function loadAccommodationTypes() { ... }
async function saveAccommodationTypes(data) { ... }
function getAccommodationTypes() { ... }
function addAccommodationType(accommodationType) { ... }
function updateAccommodationType(id, accommodationType) { ... }
function deleteAccommodationType(id) { ... }
```

### 3. Data File: data/accommodation-types.json

```json
[
  {
    "id": "hotel",
    "nameTh": "โรงแรม",
    "nameEn": "Hotel",
    "icon": "fa-hotel",
    "color": "#667eea"
  },
  {
    "id": "resort",
    "nameTh": "รีสอร์ท",
    "nameEn": "Resort",
    "icon": "fa-umbrella-beach",
    "color": "#00d2a0"
  }
]
```

### 4. อัพเดท Google Sheets Schema

เพิ่มคอลัมน์ใหม่ในตาราง Hotels:
- **Column Z**: `accommodationTypes` (เก็บ comma-separated IDs)

### 5. อัพเดท services/googleSheets.js

เพิ่มการจัดการคอลัมน์ `accommodationTypes` ใน:
- `getHotels()`
- `addHotel()`
- `updateHotel()`

## 📝 ตัวอย่างการใช้งาน

1. **เพิ่มประเภทที่พัก**:
   - ไปที่เมนู "ประเภทที่พัก"
   - กดปุ่ม "เพิ่มประเภทที่พัก"
   - กรอกข้อมูล: ชื่อ, ไอคอน, สี
   - บันทึก

2. **เลือกประเภทที่พักในฟอร์มโรงแรม**:
   - แก้ไขโรงแรม
   - เลื่อนลงไปที่ส่วน "ประเภทที่พัก"
   - เลือก checkbox ประเภทที่ต้องการ (เลือกได้หลายอัน)
   - บันทึก

3. **แสดงบนหน้าเว็บ** (ในอนาคต):
   - Badge แสดงประเภทที่พักบนการ์ดโรงแรม
   - ตัวกรองแยกตามประเภทที่พัก

## 🎯 Next Steps

1. ✅ HTML เสร็จแล้ว
2. ⏳ เพิ่ม JavaScript Functions (อยู่ระหว่างทำ)
3. ⏳ สร้าง Backend API
4. ⏳ สร้าง Service Layer  
5. ⏳ สร้าง Data File
6. ⏳ อัพเดท Google Sheets Integration

---

**หมายเหตุ**: ระบบนี้จะทำงานคล้ายกับ "สิ่งอำนวยความสะดวก" และ "ประเภทห้องพัก" ทุกประการ
