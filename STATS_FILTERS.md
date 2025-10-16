# 🔍 เพิ่มตัวกรองและค้นหาในหน้าสถิติทั้งหมด

**วันที่เพิ่ม**: 8 ตุลาคม 2568

---

## ✨ ฟีเจอร์ใหม่

### 1. ตัวกรองระยะเวลา (Period Filter)
- 📅 **รายวัน** (Day) - แสดงสถิติวันนี้
- 📅 **รายสัปดาห์** (Week) - แสดงสถิติ 7 วันย้อนหลัง
- 📅 **รายเดือน** (Month) - แสดงสถิติ 30 วันย้อนหลัง
- 📅 **รายปี** (Year) - แสดงสถิติ 365 วันย้อนหลัง
- 📅 **ทั้งหมด** (All) - แสดงสถิติทั้งหมดตั้งแต่เริ่มต้น

### 2. ช่องค้นหาโรงแรม (Search Input)
- 🔍 ค้นหาด้วยชื่อภาษาไทย
- 🔍 ค้นหาด้วยชื่อภาษาอังกฤษ
- 🔄 Real-time search (กรองทันทีเมื่อพิมพ์)

---

## 🎨 UI Design

### Desktop Layout
```
┌────────────────────────────────────────────────────────────┐
│ สถิติทั้งหมด                                              │
├────────────────────────────────────────────────────────────┤
│ [❤️ หัวใจ] [🖱️ การ์ด] │ [↓ มากสุด] [↑ น้อยสุด]          │
│                                                            │
│ [📅 รายวัน] [📅 รายสัปดาห์] [📅 รายเดือน] [📅 รายปี] [∞ ทั้งหมด] │
│ [🔍 ค้นหาชื่อโรงแรม....................]                  │
│                                                            │
│ ┌──────────────┐  ┌────────────────┐                     │
│ │ รวมหัวใจ     │  │ รวมการคลิก     │                     │
│ │   1,234      │  │   5,678        │                     │
│ └──────────────┘  └────────────────┘                     │
│                                                            │
│ #1 โรงแรมทดสอบ                                           │
│    ❤️ 456 หัวใจ  •  🖱️ 1,234 คลิก                         │
└────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────────────┐
│ สถิติทั้งหมด            │
├──────────────────────────┤
│ [❤️] [🖱️] │ [↓] [↑]     │
│                          │
│ [รายวัน] [รายสัปดาห์]   │
│ [รายเดือน] [รายปี]       │
│ [ทั้งหมด]                │
│                          │
│ [🔍 ค้นหา.............]  │
│                          │
│ ┌────────┐ ┌──────────┐ │
│ │ หัวใจ  │ │ คลิก     │ │
│ │ 1,234  │ │ 5,678    │ │
│ └────────┘ └──────────┘ │
└──────────────────────────┘
```

---

## ✅ การเปลี่ยนแปลง

### 1. HTML - เพิ่มตัวกรองและช่องค้นหา

**File**: `public/admin_v2.html` (Line ~343)

**Added**:
```html
<!-- Period and Search Filters -->
<div class="stats-filters" style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
    <!-- Period Buttons -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="period-btn active" data-period="day" onclick="changeStatsPeriod('day')">
            <i class="fas fa-calendar-day"></i> รายวัน
        </button>
        <button class="period-btn" data-period="week" onclick="changeStatsPeriod('week')">
            <i class="fas fa-calendar-week"></i> รายสัปดาห์
        </button>
        <button class="period-btn" data-period="month" onclick="changeStatsPeriod('month')">
            <i class="fas fa-calendar-alt"></i> รายเดือน
        </button>
        <button class="period-btn" data-period="year" onclick="changeStatsPeriod('year')">
            <i class="fas fa-calendar"></i> รายปี
        </button>
        <button class="period-btn" data-period="all" onclick="changeStatsPeriod('all')">
            <i class="fas fa-infinity"></i> ทั้งหมด
        </button>
    </div>
    
    <!-- Search Input -->
    <input type="text" 
           id="statsSearchInput" 
           class="search-input" 
           placeholder="🔍 ค้นหาชื่อโรงแรม..." 
           oninput="filterStatsSearch()"
           style="flex: 1; max-width: 300px; padding: 10px 14px; border: 2px solid var(--light); border-radius: 8px;">
</div>
```

**Placement**: อยู่ระหว่าง `<div class="page-header">` และ `<div class="stats-summary">`

---

### 2. JavaScript - เพิ่มตัวแปร Global

**File**: `public/js/admin_v2.js` (Line ~9)

**Added**:
```javascript
let currentStatsPeriod = 'day'; // 'day', 'week', 'month', 'year', 'all' for stats page
let currentStatsSearch = ''; // Search term for filtering stats
```

---

### 3. JavaScript - แก้ไข loadLikesStats

**Before**:
```javascript
async function loadLikesStats() {
    try {
        const response = await fetch(`/api/admin/stats?username=...&period=${currentPeriod}`);
        //                                                            ↑ ใช้ currentPeriod (สำหรับหน้า Dashboard)
```

**After**:
```javascript
async function loadLikesStats() {
    try {
        const response = await fetch(`/api/admin/stats?username=...&period=${currentStatsPeriod}`);
        //                                                            ↑ ใช้ currentStatsPeriod (สำหรับหน้าสถิติทั้งหมด)
```

**เหตุผล**: แยก period ของหน้า Dashboard (`currentPeriod`) กับหน้าสถิติทั้งหมด (`currentStatsPeriod`)

---

### 4. JavaScript - เพิ่มฟังก์ชัน changeStatsPeriod

**File**: `public/js/admin_v2.js` (After Line ~2025)

**Added**:
```javascript
// Change stats period (day, week, month, year, all)
function changeStatsPeriod(period) {
    currentStatsPeriod = period;
    loadLikesStats();
    
    // Update button states for period
    document.querySelectorAll('.period-btn[data-period]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.period === period) {
            btn.classList.add('active');
        }
    });
}
```

**การทำงาน**:
1. อัพเดท `currentStatsPeriod`
2. โหลดข้อมูลใหม่ด้วย `loadLikesStats()`
3. อัพเดทปุ่ม active state

---

### 5. JavaScript - เพิ่มฟังก์ชัน filterStatsSearch

**File**: `public/js/admin_v2.js` (After changeStatsPeriod)

**Added**:
```javascript
// Filter stats by search term
function filterStatsSearch() {
    currentStatsSearch = document.getElementById('statsSearchInput')?.value.toLowerCase().trim() || '';
    loadLikesStats();
}
```

**การทำงาน**:
1. อ่านค่าจาก input field
2. แปลงเป็นตัวพิมพ์เล็ก + trim whitespace
3. โหลดข้อมูลใหม่

---

### 6. JavaScript - แก้ไข displayLikesStats เพื่อกรองข้อมูล

**Before**:
```javascript
// Combine likes and clicks data
const statsData = hotels.map(hotel => {
    ...
});

// Sort by current criteria
statsData.sort((a, b) => {
    ...
});

// Calculate totals
const totalLikes = statsData.reduce(...);
```

**After**:
```javascript
// Combine likes and clicks data
const statsData = hotels.map(hotel => {
    ...
});

// ✅ Filter by search term
let filteredStatsData = statsData;
if (currentStatsSearch && currentStatsSearch.length > 0) {
    filteredStatsData = statsData.filter(item => {
        const nameTh = (item.hotel.nameTh || '').toLowerCase();
        const nameEn = (item.hotel.nameEn || '').toLowerCase();
        return nameTh.includes(currentStatsSearch) || nameEn.includes(currentStatsSearch);
    });
}

// Sort by current criteria
filteredStatsData.sort((a, b) => {
    ...
});

// Calculate totals (from filtered data)
const totalLikes = filteredStatsData.reduce(...);
```

**การเปลี่ยนแปลง**:
1. ✅ กรองข้อมูลก่อน sort
2. ✅ คำนวณ total จากข้อมูลที่กรองแล้ว
3. ✅ แสดงเฉพาะข้อมูลที่กรอง

---

### 7. JavaScript - แก้ไขข้อความเมื่อไม่พบข้อมูล

**Before**:
```javascript
if (statsData.length === 0) {
    container.innerHTML = '<p>ยังไม่มีข้อมูล</p>';
    return;
}

container.innerHTML = statsData.map((item, index) => {
    ...
```

**After**:
```javascript
if (filteredStatsData.length === 0) {
    container.innerHTML = '<p>ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>';
    return;
}

container.innerHTML = filteredStatsData.map((item, index) => {
    ...
```

---

## 🎯 การใช้งาน

### ตัวอย่างที่ 1: ดูสถิติรายวัน
```
1. เข้าหน้า "สถิติทั้งหมด"
2. กดปุ่ม "📅 รายวัน"
3. ✅ แสดงสถิติวันนี้
4. ✅ รวมหัวใจและคลิกเฉพาะวันนี้
```

### ตัวอย่างที่ 2: ดูสถิติรายเดือน
```
1. กดปุ่ม "📅 รายเดือน"
2. ✅ แสดงสถิติ 30 วันย้อนหลัง
3. ✅ รวมหัวใจและคลิก 30 วัน
```

### ตัวอย่างที่ 3: ค้นหาโรงแรมเฉพาะ
```
1. พิมพ์ "ทดสอบ" ในช่องค้นหา
2. ✅ แสดงเฉพาะโรงแรมที่มี "ทดสอบ" ในชื่อ
3. ✅ รวมหัวใจและคลิกเฉพาะโรงแรมที่ค้นหา
```

### ตัวอย่างที่ 4: รวมทั้งหมด
```
1. เลือกระยะเวลา "📅 รายเดือน"
2. พิมพ์ "โรงแรม" ในช่องค้นหา
3. ✅ แสดงโรงแรมที่มี "โรงแรม" ในชื่อ
4. ✅ สถิติเฉพาะรายเดือน
5. ✅ เรียงตาม หัวใจ/การ์ด และ มาก/น้อย
```

---

## 📊 Logic Flow

### การกรองข้อมูล

```javascript
// 1. ดึงข้อมูลทั้งหมด
const statsData = hotels.map(hotel => ({
    hotel: hotel,
    likes: ...,
    clicks: ...
}));

// 2. กรองตามคำค้นหา
let filteredStatsData = statsData;
if (currentStatsSearch) {
    filteredStatsData = statsData.filter(item => 
        item.hotel.nameTh.includes(search) ||
        item.hotel.nameEn.includes(search)
    );
}

// 3. เรียงลำดับ
filteredStatsData.sort((a, b) => 
    currentSort === 'likes' ? 
        (currentOrder === 'most' ? b.likes - a.likes : a.likes - b.likes) :
        (currentOrder === 'most' ? b.clicks - a.clicks : a.clicks - b.clicks)
);

// 4. คำนวณรวม
const totalLikes = filteredStatsData.reduce((sum, item) => sum + item.likes, 0);
const totalClicks = filteredStatsData.reduce((sum, item) => sum + item.clicks, 0);

// 5. แสดงผล
display(filteredStatsData, totalLikes, totalClicks);
```

---

## 🧪 การทดสอบ

### Test 1: ตัวกรองระยะเวลา
```
1. Hard Refresh (Ctrl+Shift+R)
2. เข้าหน้า "สถิติทั้งหมด"
3. ทดสอบปุ่มแต่ละระยะเวลา:
   ✅ รายวัน → ข้อมูลเปลี่ยน
   ✅ รายสัปดาห์ → ข้อมูลเปลี่ยน
   ✅ รายเดือน → ข้อมูลเปลี่ยน
   ✅ รายปี → ข้อมูลเปลี่ยน
   ✅ ทั้งหมด → แสดงทั้งหมด
4. ✅ ปุ่มที่เลือกเป็น active (สีต่าง)
```

### Test 2: ช่องค้นหา
```
1. พิมพ์ชื่อโรงแรม (เช่น "ทดสอบ")
2. ✅ กรองทันทีเมื่อพิมพ์
3. ✅ แสดงเฉพาะโรงแรมที่ตรงกับคำค้นหา
4. ✅ รวมหัวใจและคลิกอัพเดทตามที่กรอง
5. ลบคำค้นหา
6. ✅ แสดงข้อมูลทั้งหมดกลับมา
```

### Test 3: รวมทั้งหมด
```
Scenario: ค้นหา "ทดสอบ" + รายเดือน
1. เลือก "รายเดือน"
2. พิมพ์ "ทดสอบ"
3. ✅ แสดงเฉพาะโรงแรมที่มี "ทดสอบ"
4. ✅ สถิติเฉพาะรายเดือน
5. ✅ รวมหัวใจและคลิกถูกต้อง
```

### Test 4: ไม่พบข้อมูล
```
1. พิมพ์ "ไม่มีโรงแรมนี้แน่นอน"
2. ✅ แสดง "ไม่พบข้อมูลตามเงื่อนไขที่เลือก"
3. ✅ รวมหัวใจและคลิก = 0
```

### Test 5: Mobile Responsive
```
1. กด F12 → Ctrl+Shift+M
2. เลือก iPhone 12 Pro
3. ✅ ปุ่มระยะเวลาแสดงเต็มความกว้าง
4. ✅ ช่องค้นหาแสดงเต็มความกว้าง
5. ✅ ใช้งานได้สะดวก
```

---

## 📄 ไฟล์ที่แก้ไข

### `public/admin_v2.html`
**เพิ่ม**: Period filters + Search input (Line ~343-365)

### `public/js/admin_v2.js`
**เพิ่ม #1**: Global variables (Line ~9-10)
```javascript
+ let currentStatsPeriod = 'day';
+ let currentStatsSearch = '';
```

**แก้ไข #2**: loadLikesStats() (Line ~855)
```javascript
- period=${currentPeriod}
+ period=${currentStatsPeriod}
```

**เพิ่ม #3**: changeStatsPeriod() (Line ~2027)
**เพิ่ม #4**: filterStatsSearch() (Line ~2040)

**แก้ไข #5**: displayLikesStats() - เพิ่มการกรอง (Line ~952-966)

---

## ✅ สรุป

### ฟีเจอร์ที่เพิ่ม
- ✅ **5 ระยะเวลา**: รายวัน, รายสัปดาห์, รายเดือน, รายปี, ทั้งหมด
- ✅ **ช่องค้นหา**: ค้นหาชื่อโรงแรม (ไทย/อังกฤษ)
- ✅ **Real-time Filter**: กรองทันทีเมื่อพิมพ์
- ✅ **รวมค่าที่ถูกต้อง**: คำนวณจากข้อมูลที่กรองแล้ว
- ✅ **Mobile Responsive**: ใช้งานได้บนมือถือ

### การใช้งาน
1. เลือกระยะเวลา → ข้อมูลเปลี่ยน
2. พิมพ์ค้นหา → กรองทันที
3. รวมกันได้ → ระยะเวลา + ค้นหา + เรียงลำดับ

---

**✅ เพิ่มตัวกรองและค้นหาเสร็จสมบูรณ์!** 🔍📊✨
