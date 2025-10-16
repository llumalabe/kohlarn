# 🔍 เพิ่มฟีเจอร์ค้นหาในประวัติการแก้ไข

**วันที่เพิ่ม**: 8 ตุลาคม 2568

---

## 📋 ฟีเจอร์ใหม่

### ✨ ช่องค้นหาชื่อโรงแรม
เพิ่มช่องค้นหาในหน้า "ประวัติการแก้ไข" เพื่อให้สามารถค้นหาประวัติการจัดการโรงแรมโดยใช้ชื่อโรงแรมได้

**ความสามารถ**:
- 🔍 ค้นหาด้วยชื่อโรงแรม (ภาษาไทยหรืออังกฤษ)
- 🔍 ค้นหาด้วยรายละเอียด (details)
- 🔍 ค้นหาด้วยการกระทำ (action)
- 🔄 ค้นหาแบบ real-time (พิมพ์แล้วกรองทันที)
- 🎯 รวมกับตัวกรองอื่นๆ ได้ (ประเภท + การกระทำ + ค้นหา)

---

## 🎨 UI/UX

### หน้าตา
```
┌─────────────────────────────────────────────────────────┐
│ ประวัติการแก้ไข                                        │
├─────────────────────────────────────────────────────────┤
│ [🔍 ค้นหาชื่อโรงแรม...] [ทั้งหมด ▼] [ทุกการกระทำ ▼]  │
└─────────────────────────────────────────────────────────┘
```

### Desktop Layout
```
┌───────────────────────────────────────────────────────────────┐
│ ประวัติการแก้ไข                                              │
├───────────────────────────────────────────────────────────────┤
│ [🔍 ค้นหาชื่อโรงแรม.....................]                    │
│ [ทั้งหมด ▼] [ทุกการกระทำ ▼]                                 │
└───────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────┐
│ ประวัติการแก้ไข        │
├─────────────────────────┤
│ [🔍 ค้นหาชื่อโรงแรม...] │
│ [ทั้งหมด ▼]             │
│ [ทุกการกระทำ ▼]         │
└─────────────────────────┘
```

---

## ✅ การเปลี่ยนแปลง

### 1. HTML - เพิ่มช่องค้นหา

**Before** (`admin_v2.html` - Line 287-293):
```html
<div class="activity-filters">
    <select id="activityTypeFilter" class="filter-select" onchange="filterActivity()">
        <option value="all">ทั้งหมด</option>
        <option value="hotel">โรงแรม</option>
    </select>
    <!-- ❌ ไม่มีช่องค้นหา -->
</div>
```

**After**:
```html
<div class="activity-filters">
    <!-- ✅ เพิ่มช่องค้นหา -->
    <input type="text" 
           id="activitySearchInput" 
           class="search-input" 
           placeholder="🔍 ค้นหาชื่อโรงแรม..." 
           oninput="filterActivity()">
    
    <select id="activityTypeFilter" class="filter-select" onchange="filterActivity()">
        <option value="all">ทั้งหมด</option>
        <option value="hotel">โรงแรม</option>
        <option value="amenity">สิ่งอำนวยความสะดวก</option>
        <option value="roomtype">ประเภทห้องพัก</option>
    </select>
    
    <select id="activityActionFilter" class="filter-select" onchange="filterActivity()">
        <option value="all">ทุกการกระทำ</option>
        <option value="add">เพิ่ม</option>
        <option value="edit">แก้ไข</option>
        <option value="delete">ลบ</option>
    </select>
</div>
```

**คุณสมบัติ**:
- `oninput="filterActivity()"` - กรองทันทีเมื่อพิมพ์
- `placeholder="🔍 ค้นหาชื่อโรงแรม..."` - แสดงคำแนะนำ
- `class="search-input"` - ใช้ CSS สำหรับจัดรูปแบบ

---

### 2. JavaScript - เพิ่มตัวแปรและฟังก์ชัน

#### 2.1 เพิ่มตัวแปร Global

**Before** (`admin_v2.js` - Line 10-12):
```javascript
let currentActivityType = 'all';
let currentActivityAction = 'all';
// ❌ ไม่มีตัวแปรสำหรับค้นหา
```

**After**:
```javascript
let currentActivityType = 'all'; // 'all', 'hotel', 'amenity', 'roomtype'
let currentActivityAction = 'all'; // 'all', 'latest', 'add', 'edit', 'delete'
let currentActivitySearch = ''; // ✅ เพิ่มตัวแปรค้นหา
```

---

#### 2.2 แก้ไขฟังก์ชัน filterActivity()

**Before** (`admin_v2.js` - Line 1927-1932):
```javascript
function filterActivity() {
    currentActivityType = document.getElementById('activityTypeFilter').value;
    currentActivityAction = document.getElementById('activityActionFilter').value;
    loadActivityLog();
}
```

**After**:
```javascript
function filterActivity() {
    currentActivityType = document.getElementById('activityTypeFilter').value;
    currentActivityAction = document.getElementById('activityActionFilter').value;
    currentActivitySearch = document.getElementById('activitySearchInput')?.value.toLowerCase().trim() || '';
    // ✅ อ่านค่าจากช่องค้นหา, แปลงเป็นตัวพิมพ์เล็ก, ตัด whitespace
    loadActivityLog();
}
```

---

#### 2.3 เพิ่มการกรองในฟังก์ชัน displayActivityLog()

**Before** (`admin_v2.js` - Line 1658):
```javascript
// Filter by action
if (currentActivityAction !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
        // ... filter logic ...
    });
}

// ❌ ไม่มีการกรองด้วยคำค้นหา

// Show only 10 items per page
const itemsPerPage = 10;
```

**After**:
```javascript
// Filter by action
if (currentActivityAction !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
        // ... filter logic ...
    });
}

// ✅ Filter by search term (hotel name or details)
if (currentActivitySearch && currentActivitySearch.length > 0) {
    filteredLogs = filteredLogs.filter(log => {
        const hotelName = (log.hotelName || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        
        return hotelName.includes(currentActivitySearch) ||
               details.includes(currentActivitySearch) ||
               action.includes(currentActivitySearch);
    });
}

// Show only 10 items per page
const itemsPerPage = 10;
```

**การทำงาน**:
1. เช็คว่ามีคำค้นหาหรือไม่ (`currentActivitySearch.length > 0`)
2. แปลงข้อมูลทั้งหมดเป็นตัวพิมพ์เล็ก (case-insensitive)
3. ค้นหาใน 3 ฟิลด์:
   - `hotelName` - ชื่อโรงแรม
   - `details` - รายละเอียด
   - `action` - การกระทำ
4. แสดงเฉพาะรายการที่ตรงกับคำค้นหา

---

### 3. CSS - จัดรูปแบบช่องค้นหา

#### 3.1 Desktop Styles

**Added** (`admin_v2.css` - After Line 1167):
```css
.search-input {
    flex: 1;
    max-width: 300px;
    padding: 10px 14px;
    border: 2px solid var(--light);
    border-radius: 8px;
    background: white;
    color: var(--dark);
    font-size: 0.9rem;
    font-weight: 400;
    transition: all 0.3s;
    min-height: 42px;
}

.search-input:hover {
    border-color: var(--primary-color);
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
}

.search-input::placeholder {
    color: #999;
    font-weight: 400;
}
```

**คุณสมบัติ**:
- ✅ Border 2px solid เมื่อไม่ได้ focus
- ✅ เปลี่ยนสีเป็นม่วงเมื่อ hover/focus
- ✅ มี shadow เบาๆ เมื่อ focus
- ✅ Placeholder สีเทา อ่านง่าย
- ✅ Transition smooth 0.3s

---

#### 3.2 Mobile Responsive

**Added** (`admin_v2.css` - Line 1552):
```css
@media (max-width: 768px) {
    .search-input {
        max-width: 100%;
        width: 100%;
    }
    
    .activity-filters {
        flex-direction: column;
    }
}
```

**การทำงาน**:
- ✅ บนมือถือ: ช่องค้นหาเต็มความกว้าง (100%)
- ✅ Filters แสดงแนวตั้ง (column)
- ✅ แต่ละ filter เต็มความกว้าง

---

## 🎯 วิธีใช้งาน

### การค้นหาแบบต่างๆ

#### 1. ค้นหาชื่อโรงแรมเฉพาะ
```
Input: "ทดสอบ"
Result: แสดงเฉพาะรายการที่เกี่ยวกับโรงแรมที่มีคำว่า "ทดสอบ" ในชื่อ
```

#### 2. ค้นหาร่วมกับตัวกรองประเภท
```
Input: "ทดสอบ"
Filter: ประเภท = โรงแรม
Result: แสดงเฉพาะประวัติโรงแรมที่มี "ทดสอบ" ในชื่อ
```

#### 3. ค้นหาร่วมกับตัวกรองการกระทำ
```
Input: "ทดสอบ"
Filter: การกระทำ = เพิ่ม
Result: แสดงเฉพาะการเพิ่มโรงแรมที่มี "ทดสอบ" ในชื่อ
```

#### 4. รวมทั้งหมด
```
Input: "ทดสอบ"
Filter: ประเภท = โรงแรม, การกระทำ = แก้ไข
Result: แสดงเฉพาะการแก้ไขโรงแรมที่มี "ทดสอบ" ในชื่อ
```

---

## 🧪 วิธีทดสอบ

### Test 1: ค้นหาพื้นฐาน
```
1. เข้า Admin Panel
2. กดเมนู "ประวัติการแก้ไข"
3. พิมพ์ชื่อโรงแรมในช่องค้นหา (เช่น "ทดสอบ")
✅ ควรเห็นเฉพาะรายการที่เกี่ยวข้อง
✅ รายการควรกรองทันทีที่พิมพ์
```

### Test 2: ค้นหาภาษาไทย
```
1. พิมพ์ "โรงแรม"
✅ ควรเห็นรายการที่มีคำว่า "โรงแรม"
```

### Test 3: ค้นหาภาษาอังกฤษ
```
1. พิมพ์ "hotel"
✅ ควรเห็นรายการที่มีคำว่า "hotel"
```

### Test 4: ค้นหา Case-Insensitive
```
1. พิมพ์ "HOTEL" (ตัวพิมพ์ใหญ่)
✅ ควรเห็นรายการเหมือนพิมพ์ "hotel" (ตัวพิมพ์เล็ก)
```

### Test 5: รวมกับตัวกรอง
```
1. พิมพ์ "ทดสอบ"
2. เลือกประเภท = "โรงแรม"
3. เลือกการกระทำ = "เพิ่ม"
✅ ควรเห็นเฉพาะการเพิ่มโรงแรมที่มี "ทดสอบ"
```

### Test 6: ไม่พบข้อมูล
```
1. พิมพ์ "ไม่มีโรงแรมนี้แน่นอน"
✅ ควรแสดง "ไม่พบข้อมูลตามเงื่อนไขที่เลือก"
```

### Test 7: ลบคำค้นหา
```
1. พิมพ์ "ทดสอบ" → เห็นรายการกรอง
2. ลบคำค้นหาทั้งหมด
✅ ควรแสดงรายการทั้งหมดกลับมา
```

### Test 8: Responsive Mobile
```
1. กด F12 → Ctrl+Shift+M (Device Mode)
2. เลือก iPhone 12 Pro
3. ทดสอบช่องค้นหา
✅ ควรเต็มความกว้าง
✅ ควรใช้งานได้สะดวก (ไม่ zoom)
```

---

## 🔍 Technical Details

### Search Algorithm

**Input Processing**:
```javascript
// 1. Get input value
const rawInput = document.getElementById('activitySearchInput').value;

// 2. Convert to lowercase
const lowerInput = rawInput.toLowerCase();

// 3. Trim whitespace
const cleanInput = lowerInput.trim();

// Result
currentActivitySearch = cleanInput;
```

**Filtering Logic**:
```javascript
filteredLogs = filteredLogs.filter(log => {
    // Prepare fields
    const hotelName = (log.hotelName || '').toLowerCase();
    const details = (log.details || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    
    // Check if search term exists in any field
    return hotelName.includes(currentActivitySearch) ||
           details.includes(currentActivitySearch) ||
           action.includes(currentActivitySearch);
});
```

**Why Case-Insensitive?**:
- ผู้ใช้ไม่ต้องกังวลเรื่องตัวพิมพ์ใหญ่/เล็ก
- ค้นหา "HOTEL", "hotel", "Hotel" ได้ผลลัพธ์เหมือนกัน

**Why Trim?**:
- ลบช่องว่างหน้า-หลังที่ไม่ได้ตั้งใจพิมพ์
- `"  hotel  "` → `"hotel"`

---

### Filter Priority

**Order of Filtering**:
```
1. Filter by Type (hotel/amenity/roomtype)
   ↓
2. Filter by Action (add/edit/delete)
   ↓
3. Filter by Search Term
   ↓
4. Pagination (10 items per page)
```

**Why This Order?**:
1. **Type** - ลดข้อมูลมากที่สุดก่อน (กว้าง → แคบ)
2. **Action** - ลดเพิ่มเติม
3. **Search** - กรองแบบละเอียด (keyword matching)
4. **Pagination** - แสดงผลเฉพาะหน้าปัจจุบัน

---

### Performance Considerations

**String Operations**:
```javascript
// ❌ Bad: Create new strings every time
log.hotelName.toLowerCase().includes(search.toLowerCase())

// ✅ Good: Convert once, reuse
const hotelName = (log.hotelName || '').toLowerCase();
return hotelName.includes(currentActivitySearch);
```

**Null Safety**:
```javascript
// ❌ Bad: Might throw error if null
log.hotelName.toLowerCase()

// ✅ Good: Handle null/undefined
(log.hotelName || '').toLowerCase()
```

**Empty Check**:
```javascript
// ❌ Bad: Run filter even when empty
filteredLogs = filteredLogs.filter(...)

// ✅ Good: Skip filter if no search term
if (currentActivitySearch && currentActivitySearch.length > 0) {
    filteredLogs = filteredLogs.filter(...)
}
```

---

## 📄 ไฟล์ที่แก้ไข

### 1. `public/admin_v2.html`

**เพิ่ม**: ช่องค้นหา (Line 287-293)
```html
+ <input type="text" 
+        id="activitySearchInput" 
+        class="search-input" 
+        placeholder="🔍 ค้นหาชื่อโรงแรม..." 
+        oninput="filterActivity()">
```

---

### 2. `public/js/admin_v2.js`

**เพิ่ม #1**: ตัวแปร global (Line 11)
```javascript
+ let currentActivitySearch = '';
```

**แก้ไข #2**: ฟังก์ชัน filterActivity() (Line 1927-1933)
```javascript
+ currentActivitySearch = document.getElementById('activitySearchInput')?.value.toLowerCase().trim() || '';
```

**เพิ่ม #3**: การกรองด้วยคำค้นหา (Line 1659-1669)
```javascript
+ if (currentActivitySearch && currentActivitySearch.length > 0) {
+     filteredLogs = filteredLogs.filter(log => {
+         const hotelName = (log.hotelName || '').toLowerCase();
+         const details = (log.details || '').toLowerCase();
+         const action = (log.action || '').toLowerCase();
+         
+         return hotelName.includes(currentActivitySearch) ||
+                details.includes(currentActivitySearch) ||
+                action.includes(currentActivitySearch);
+     });
+ }
```

---

### 3. `public/css/admin_v2.css`

**เพิ่ม #1**: Desktop styles (After Line 1167)
```css
+ .search-input {
+     flex: 1;
+     max-width: 300px;
+     padding: 10px 14px;
+     border: 2px solid var(--light);
+     border-radius: 8px;
+     background: white;
+     transition: all 0.3s;
+ }
+ 
+ .search-input:focus {
+     border-color: var(--primary-color);
+     box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
+ }
```

**เพิ่ม #2**: Mobile responsive (Line 1552)
```css
+ @media (max-width: 768px) {
+     .search-input {
+         max-width: 100%;
+         width: 100%;
+     }
+ }
```

---

## 🎯 สรุป

### ฟีเจอร์ที่เพิ่ม
✅ **ช่องค้นหา** - ค้นหาชื่อโรงแรมได้
✅ **Real-time Search** - กรองทันทีเมื่อพิมพ์
✅ **Case-Insensitive** - ไม่สนใจตัวพิมพ์ใหญ่/เล็ก
✅ **Multi-field Search** - ค้นหาใน hotelName, details, action
✅ **Combined Filters** - ใช้ร่วมกับตัวกรองอื่นได้
✅ **Mobile Responsive** - รองรับมือถือ

### ผลลัพธ์
- 🎯 **UX**: ดีขึ้น - หาข้อมูลได้เร็วขึ้น
- 🔍 **Usability**: ดีขึ้น - ไม่ต้องเลื่อนหาทีละรายการ
- 📊 **Efficiency**: ดีขึ้น - กรองข้อมูลได้แม่นยำ
- 📱 **Mobile**: รองรับเต็มรูปแบบ

---

## ✅ Checklist

### ก่อนใช้งาน
- [x] เพิ่ม HTML - input field
- [x] เพิ่ม JavaScript - ตัวแปร currentActivitySearch
- [x] แก้ไข JavaScript - filterActivity()
- [x] เพิ่ม JavaScript - search logic ใน displayActivityLog()
- [x] เพิ่ม CSS - .search-input styles
- [x] เพิ่ม CSS - mobile responsive

### หลังใช้งาน
- [ ] Hard Refresh (Ctrl+Shift+R)
- [ ] เข้า "ประวัติการแก้ไข"
- [ ] ทดสอบค้นหาชื่อโรงแรม
- [ ] ทดสอบรวมกับตัวกรองอื่น
- [ ] ทดสอบบนมือถือ
- [ ] ตรวจสอบ performance (ไม่ช้า)

---

## 💡 Tips

### สำหรับ Admin
1. ใช้คำสั้นๆ เพื่อค้นหาได้เร็ว (เช่น "ทด" แทน "โรงแรมทดสอบ")
2. รวมกับตัวกรองเพื่อผลลัพธ์ที่แม่นยำ
3. ใช้ภาษาไทยหรืออังกฤษก็ได้

### สำหรับ Developer
1. ใช้ `oninput` แทน `onchange` เพื่อ real-time search
2. ใช้ `toLowerCase()` สำหรับ case-insensitive search
3. ใช้ `trim()` เพื่อลบช่องว่างที่ไม่ต้องการ
4. เช็ค null/undefined ด้วย `|| ''`
5. Skip filter ถ้า search term ว่างเปล่า

---

**พร้อมใช้งาน! ค้นหาประวัติโรงแรมได้แล้ว** 🔍✨
