# 🔧 แก้ไขปัญหา Pagination ในประวัติการแก้ไข

**วันที่แก้ไข**: 8 ตุลาคม 2568

---

## 🐛 ปัญหาที่พบ

### Error Message
```
admin_v2.html:317 Uncaught ReferenceError: nextPage is not defined
    at HTMLButtonElement.onclick (admin_v2.html:317:93)
```

### ปัญหาหลัก
1. ❌ **ไม่มีฟังก์ชัน** `nextPage()` และ `prevPage()`
2. ❌ **currentPage เป็น const** - ไม่สามารถเปลี่ยนค่าได้
3. ❌ **ไม่ซ่อนปุ่ม** - ปุ่มแสดงตลอดเวลา แม้อยู่หน้าแรก/สุดท้าย
4. ❌ **ไม่รีเซ็ตหน้า** - เมื่อเปลี่ยนตัวกรอง ยังอยู่หน้าเดิม

### ความต้องการ
✅ ถ้าอยู่หน้าแรก → **ซ่อนปุ่ม "ก่อนหน้า"**
✅ ถ้าอยู่หน้าสุดท้าย → **ซ่อนปุ่ม "ถัดไป"**
✅ เมื่อเปลี่ยนตัวกรอง → **กลับไปหน้า 1**

---

## ✅ การแก้ไข

### 1. เพิ่มตัวแปร Global สำหรับหน้าปัจจุบัน

**Before** (`admin_v2.js` - Line 10-13):
```javascript
let currentActivityType = 'all';
let currentActivityAction = 'all';
let currentActivitySearch = '';
let currentStatusFilter = 'all';
// ❌ ไม่มีตัวแปรสำหรับหน้า
```

**After**:
```javascript
let currentActivityType = 'all'; // 'all', 'hotel', 'amenity', 'roomtype'
let currentActivityAction = 'all'; // 'all', 'latest', 'add', 'edit', 'delete'
let currentActivitySearch = ''; // Search term for filtering activities
let currentActivityPage = 1; // ✅ Current page for activity log pagination
let currentStatusFilter = 'all'; // 'all', 'active', 'inactive'
```

**เหตุผล**:
- ต้องเป็น **global variable** เพื่อให้ `nextPage()`, `prevPage()` เข้าถึงได้
- เริ่มต้นที่หน้า 1

---

### 2. แก้ไขการใช้ currentPage ใน displayActivityLog()

**Before** (`admin_v2.js` - Line 1674-1679):
```javascript
const itemsPerPage = 10;
const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
const currentPage = 1; // ❌ const - ไม่สามารถเปลี่ยนค่าได้
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
```

**After**:
```javascript
const itemsPerPage = 10;
const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
// ✅ ใช้ global variable แทน const
const startIndex = (currentActivityPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
```

**เหตุผล**:
- ใช้ `currentActivityPage` (global) แทน `currentPage` (const)
- ทำให้หน้าเปลี่ยนได้เมื่อกดปุ่ม

---

### 3. อัพเดทข้อความและสถานะปุ่ม

**Before** (`admin_v2.js` - Line 1789-1792):
```javascript
const pageInfo = document.getElementById('pageInfo');
if (pageInfo) {
    pageInfo.textContent = `หน้า ${currentPage} จาก ${totalPages} (${filteredLogs.length} รายการ)`;
}
// ❌ ไม่มีการควบคุมปุ่ม
```

**After**:
```javascript
// Update page info
const pageInfo = document.getElementById('pageInfo');
if (pageInfo) {
    pageInfo.textContent = `หน้า ${currentActivityPage} จาก ${totalPages} (${filteredLogs.length} รายการ)`;
}

// ✅ Update button states (hide if at first/last page)
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (prevBtn) {
    if (currentActivityPage <= 1) {
        prevBtn.style.display = 'none'; // ซ่อนถ้าอยู่หน้าแรก
    } else {
        prevBtn.style.display = ''; // แสดงถ้าไม่ใช่หน้าแรก
    }
}

if (nextBtn) {
    if (currentActivityPage >= totalPages) {
        nextBtn.style.display = 'none'; // ซ่อนถ้าอยู่หน้าสุดท้าย
    } else {
        nextBtn.style.display = ''; // แสดงถ้าไม่ใช่หน้าสุดท้าย
    }
}
```

**การทำงาน**:
1. แสดงข้อมูลหน้า: `หน้า 1 จาก 5 (42 รายการ)`
2. เช็คหน้าปัจจุบัน:
   - ถ้า `currentActivityPage <= 1` → ซ่อนปุ่ม "ก่อนหน้า"
   - ถ้า `currentActivityPage >= totalPages` → ซ่อนปุ่ม "ถัดไป"
3. ใช้ `style.display = ''` เพื่อรีเซ็ตเป็นค่า default

---

### 4. สร้างฟังก์ชัน nextPage() และ prevPage()

**Added** (`admin_v2.js` - After Line 1969):
```javascript
// Activity log pagination
function nextPage() {
    currentActivityPage++;
    loadActivityLog();
}

function prevPage() {
    if (currentActivityPage > 1) {
        currentActivityPage--;
        loadActivityLog();
    }
}
```

**การทำงาน**:

**nextPage()**:
1. เพิ่มหน้า: `currentActivityPage++`
2. โหลดข้อมูลใหม่: `loadActivityLog()`
3. `displayActivityLog()` จะเช็คและซ่อนปุ่มถ้าถึงหน้าสุดท้าย

**prevPage()**:
1. เช็คว่า `currentActivityPage > 1` (ป้องกันติดลบ)
2. ลดหน้า: `currentActivityPage--`
3. โหลดข้อมูลใหม่: `loadActivityLog()`
4. `displayActivityLog()` จะเช็คและซ่อนปุ่มถ้าถึงหน้าแรก

---

### 5. รีเซ็ตหน้าเมื่อเปลี่ยนตัวกรอง

**Before** (`admin_v2.js` - Line 1963-1968):
```javascript
function filterActivity() {
    currentActivityType = document.getElementById('activityTypeFilter').value;
    currentActivityAction = document.getElementById('activityActionFilter').value;
    currentActivitySearch = document.getElementById('activitySearchInput')?.value.toLowerCase().trim() || '';
    loadActivityLog();
    // ❌ ไม่รีเซ็ตหน้า - อาจติดอยู่หน้า 5 ทั้งที่มีแค่ 2 หน้า
}
```

**After**:
```javascript
function filterActivity() {
    currentActivityType = document.getElementById('activityTypeFilter').value;
    currentActivityAction = document.getElementById('activityActionFilter').value;
    currentActivitySearch = document.getElementById('activitySearchInput')?.value.toLowerCase().trim() || '';
    currentActivityPage = 1; // ✅ Reset to page 1 when filter changes
    loadActivityLog();
}
```

**เหตุผล**:
- เมื่อเปลี่ยนตัวกรอง ข้อมูลเปลี่ยน → จำนวนหน้าอาจเปลี่ยน
- ต้องกลับไปหน้า 1 เพื่อไม่ให้แสดงหน้าว่าง

**ตัวอย่าง**:
```
สถานะเดิม:
- อยู่หน้า 5 จาก 10 (filter: "ทั้งหมด")

เปลี่ยนตัวกรอง:
- filter: "โรงแรม" → เหลือ 15 รายการ = 2 หน้า
- ❌ ถ้าไม่รีเซ็ต → ยังอยู่หน้า 5 (ไม่มีข้อมูล)
- ✅ หลังรีเซ็ต → กลับไปหน้า 1 (แสดงข้อมูลปกติ)
```

---

## 🎯 ผลลัพธ์

### Pagination Logic

```
หน้าที่ 1 (แรกสุด):
┌──────────────────────────────────────┐
│ [ซ่อน]   หน้า 1 จาก 5   [ถัดไป →]  │
└──────────────────────────────────────┘

หน้าที่ 3 (กลางๆ):
┌──────────────────────────────────────┐
│ [← ก่อนหน้า]  หน้า 3 จาก 5  [ถัดไป →] │
└──────────────────────────────────────┘

หน้าที่ 5 (สุดท้าย):
┌──────────────────────────────────────┐
│ [← ก่อนหน้า]  หน้า 5 จาก 5   [ซ่อน] │
└──────────────────────────────────────┘
```

### Flow Diagram

```
[กดปุ่ม "ถัดไป"]
    ↓
nextPage() ถูกเรียก
    ↓
currentActivityPage++ (เช่น 1 → 2)
    ↓
loadActivityLog() ถูกเรียก
    ↓
displayActivityLog() ถูกเรียก
    ↓
คำนวณ startIndex, endIndex
    ↓
แสดง 10 รายการของหน้าใหม่
    ↓
อัพเดทข้อความ "หน้า 2 จาก 5"
    ↓
เช็คและซ่อน/แสดงปุ่ม
    ↓
✅ เสร็จสิ้น
```

---

## 🧪 การทดสอบ

### Test 1: หน้าแรก
```
✅ ปุ่ม "ก่อนหน้า" ถูกซ่อน
✅ ปุ่ม "ถัดไป" แสดง (ถ้ามีมากกว่า 1 หน้า)
✅ แสดงข้อความ "หน้า 1 จาก X"
```

### Test 2: กดปุ่ม "ถัดไป"
```
1. อยู่หน้า 1
2. กดปุ่ม "ถัดไป"
✅ ไปหน้า 2
✅ ปุ่ม "ก่อนหน้า" ปรากฏ
✅ ข้อมูลเปลี่ยน (แสดงรายการที่ 11-20)
```

### Test 3: กดปุ่ม "ก่อนหน้า"
```
1. อยู่หน้า 3
2. กดปุ่ม "ก่อนหน้า"
✅ ไปหน้า 2
✅ ข้อมูลเปลี่ยน (แสดงรายการที่ 11-20)
```

### Test 4: หน้าสุดท้าย
```
1. กดปุ่ม "ถัดไป" จนถึงหน้าสุดท้าย
✅ ปุ่ม "ถัดไป" ถูกซ่อน
✅ ปุ่ม "ก่อนหน้า" แสดง
✅ แสดงข้อความ "หน้า X จาก X"
```

### Test 5: เปลี่ยนตัวกรอง
```
1. อยู่หน้า 5 (filter: "ทั้งหมด")
2. เปลี่ยน filter เป็น "โรงแรม"
✅ กลับไปหน้า 1 อัตโนมัติ
✅ ปุ่ม "ก่อนหน้า" ถูกซ่อน
✅ แสดงข้อมูลหน้า 1 ของผลลัพธ์ใหม่
```

### Test 6: ค้นหา
```
1. อยู่หน้า 3
2. พิมพ์ชื่อโรงแรมในช่องค้นหา
✅ กลับไปหน้า 1 อัตโนมัติ
✅ แสดงผลลัพธ์ที่ค้นหา (หน้า 1)
```

### Test 7: ข้อมูลน้อยกว่า 10 รายการ
```
Scenario: มี 7 รายการทั้งหมด (< 10)
✅ แสดง "หน้า 1 จาก 1"
✅ ปุ่ม "ก่อนหน้า" ถูกซ่อน
✅ ปุ่ม "ถัดไป" ถูกซ่อน
```

### Test 8: ไม่พบข้อมูล
```
Scenario: ค้นหา "ไม่มีโรงแรมนี้" → 0 รายการ
✅ แสดง "ไม่พบข้อมูลตามเงื่อนไขที่เลือก"
✅ ซ่อนปุ่มทั้งหมด
```

---

## 📊 Technical Details

### Pagination Calculation

```javascript
// Given
const itemsPerPage = 10;
const totalLogs = 42; // จำนวนรายการทั้งหมด
let currentActivityPage = 3; // หน้าปัจจุบัน

// Calculate
const totalPages = Math.ceil(42 / 10); // = 5 หน้า
const startIndex = (3 - 1) * 10; // = 20
const endIndex = 20 + 10; // = 30
const paginatedLogs = filteredLogs.slice(20, 30); // รายการที่ 21-30
```

### Example Pagination

```
ข้อมูลทั้งหมด 42 รายการ (10 รายการ/หน้า):

หน้า 1: รายการที่  1-10  (index  0-10)
หน้า 2: รายการที่ 11-20  (index 10-20)
หน้า 3: รายการที่ 21-30  (index 20-30)
หน้า 4: รายการที่ 31-40  (index 30-40)
หน้า 5: รายการที่ 41-42  (index 40-42) ← หน้าสุดท้าย (แสดง 2 รายการ)
```

### Button State Logic

```javascript
// Prev Button
if (currentActivityPage <= 1) {
    prevBtn.style.display = 'none';
    // หน้า 1 → ซ่อน (ไม่มีหน้าก่อนหน้า)
} else {
    prevBtn.style.display = '';
    // หน้า 2, 3, 4, ... → แสดง
}

// Next Button
if (currentActivityPage >= totalPages) {
    nextBtn.style.display = 'none';
    // หน้าสุดท้าย → ซ่อน (ไม่มีหน้าถัดไป)
} else {
    nextBtn.style.display = '';
    // ยังไม่ถึงหน้าสุดท้าย → แสดง
}
```

### Edge Cases

**Case 1: ข้อมูล 0 รายการ**
```javascript
totalPages = Math.ceil(0 / 10) = 0
currentActivityPage = 1
// 1 >= 0 → ซ่อนปุ่ม "ถัดไป" ✅
// 1 <= 1 → ซ่อนปุ่ม "ก่อนหน้า" ✅
```

**Case 2: ข้อมูล 10 รายการพอดี**
```javascript
totalPages = Math.ceil(10 / 10) = 1
currentActivityPage = 1
// หน้าเดียว → ซ่อนปุ่มทั้งหมด ✅
```

**Case 3: ข้อมูล 11 รายการ**
```javascript
totalPages = Math.ceil(11 / 10) = 2

หน้า 1:
- currentActivityPage = 1
- 1 <= 1 → ซ่อน "ก่อนหน้า" ✅
- 1 < 2 → แสดง "ถัดไป" ✅

หน้า 2:
- currentActivityPage = 2
- 2 > 1 → แสดง "ก่อนหน้า" ✅
- 2 >= 2 → ซ่อน "ถัดไป" ✅
```

---

## 📄 ไฟล์ที่แก้ไข

### `public/js/admin_v2.js`

**เพิ่ม #1**: Global variable (Line 13)
```javascript
+ let currentActivityPage = 1; // Current page for activity log pagination
```

**แก้ไข #2**: ใช้ global variable (Line 1675)
```javascript
- const currentPage = 1; // You can add pagination later
- const startIndex = (currentPage - 1) * itemsPerPage;
+ const startIndex = (currentActivityPage - 1) * itemsPerPage;
```

**เพิ่ม #3**: ซ่อน/แสดงปุ่ม (Line 1789-1810)
```javascript
+ // Update button states (hide if at first/last page)
+ const prevBtn = document.getElementById('prevBtn');
+ const nextBtn = document.getElementById('nextBtn');
+ 
+ if (prevBtn) {
+     if (currentActivityPage <= 1) {
+         prevBtn.style.display = 'none';
+     } else {
+         prevBtn.style.display = '';
+     }
+ }
+ 
+ if (nextBtn) {
+     if (currentActivityPage >= totalPages) {
+         nextBtn.style.display = 'none';
+     } else {
+         nextBtn.style.display = '';
+     }
+ }
```

**เพิ่ม #4**: ฟังก์ชัน pagination (After Line 1969)
```javascript
+ // Activity log pagination
+ function nextPage() {
+     currentActivityPage++;
+     loadActivityLog();
+ }
+ 
+ function prevPage() {
+     if (currentActivityPage > 1) {
+         currentActivityPage--;
+         loadActivityLog();
+     }
+ }
```

**แก้ไข #5**: รีเซ็ตหน้าเมื่อกรอง (Line 1968)
```javascript
function filterActivity() {
    currentActivityType = document.getElementById('activityTypeFilter').value;
    currentActivityAction = document.getElementById('activityActionFilter').value;
    currentActivitySearch = document.getElementById('activitySearchInput')?.value.toLowerCase().trim() || '';
+   currentActivityPage = 1; // Reset to page 1 when filter changes
    loadActivityLog();
}
```

---

## ✅ สรุป

### ปัญหาที่แก้ไข
- ✅ **Error**: `nextPage is not defined` → เพิ่มฟังก์ชันแล้ว
- ✅ **Pagination**: ไม่สามารถเปลี่ยนหน้าได้ → ใช้ global variable
- ✅ **UX**: ปุ่มแสดงตลอด → ซ่อนเมื่อไม่จำเป็น
- ✅ **Filter**: ติดอยู่หน้าเดิม → รีเซ็ตเป็นหน้า 1

### Features ใหม่
- 🎯 **Smart Buttons**: ซ่อน/แสดงปุ่มตามสถานะหน้า
- 🔄 **Auto Reset**: กลับหน้า 1 เมื่อเปลี่ยนตัวกรอง
- 📊 **Page Info**: แสดงหน้าปัจจุบัน/ทั้งหมด/จำนวนรายการ
- ⚡ **Smooth Navigation**: เปลี่ยนหน้าได้อย่างราบรื่น

### การทดสอบ
1. Hard Refresh: **Ctrl+Shift+R**
2. เข้า "ประวัติการแก้ไข"
3. ทดสอบกดปุ่ม "ถัดไป", "ก่อนหน้า"
4. ทดสอบเปลี่ยนตัวกรอง
5. ทดสอบค้นหา

---

**✅ Pagination พร้อมใช้งาน! กดปุ่มได้แล้ว** 🎉
