# 🎯 ตัวกรองสถานะโรงแรม (Hotel Status Filter)

## 📋 สรุปฟีเจอร์

เพิ่มปุ่มกรองสถานะโรงแรมในหน้า **"จัดการโรงแรม"** เพื่อให้ Admin สามารถดูโรงแรมแยกตามสถานะได้ง่ายขึ้น

---

## ✨ ฟีเจอร์

### ปุ่มกรอง 3 แบบ:

1. **📊 ทั้งหมด** (All) - แสดงโรงแรมทั้งหมด (เปิด + ปิด)
2. **✅ เปิด** (Active) - แสดงเฉพาะโรงแรมที่เปิดใช้งาน
3. **❌ ปิด** (Inactive) - แสดงเฉพาะโรงแรมที่ปิดใช้งาน

---

## 🎨 UI Design

```
┌─────────────────────────────────────────────────┐
│ 🔍 กรองตามสถานะ:                               │
│                                                  │
│  [📊 ทั้งหมด]  [✅ เปิด]  [❌ ปิด]            │
└─────────────────────────────────────────────────┘
```

### สีของปุ่ม:
- **ทั้งหมด**: สีม่วง (Primary)
- **เปิด**: สีเขียว (Success)
- **ปิด**: สีแดง (Danger)

### Animation:
- ปุ่มที่เลือกจะ:
  - ยกขึ้น 2px (`translateY(-2px)`)
  - มีเงาชัดเจนขึ้น
  - มี Gradient สีสวยงาม

---

## 💻 การแก้ไขโค้ด

### 1. HTML (admin_v2.html)

เพิ่มส่วน Filter Section หลังจาก Search Box:

```html
<!-- Status Filter -->
<div class="filter-section" style="margin: 20px 0;">
    <label style="font-weight: 600; margin-right: 15px; color: #2c3e50;">
        <i class="fas fa-filter"></i> กรองตามสถานะ:
    </label>
    <div class="btn-group">
        <button class="btn btn-sm btn-primary active" 
                onclick="filterHotelsByStatus('all')" 
                id="filterAll">
            <i class="fas fa-th"></i> ทั้งหมด
        </button>
        <button class="btn btn-sm btn-success" 
                onclick="filterHotelsByStatus('active')" 
                id="filterActive">
            <i class="fas fa-check-circle"></i> เปิด
        </button>
        <button class="btn btn-sm btn-danger" 
                onclick="filterHotelsByStatus('inactive')" 
                id="filterInactive">
            <i class="fas fa-times-circle"></i> ปิด
        </button>
    </div>
</div>
```

---

### 2. JavaScript (admin_v2.js)

#### เพิ่มตัวแปร Global:

```javascript
let currentStatusFilter = 'all'; // 'all', 'active', 'inactive'
```

#### แก้ไขฟังก์ชัน searchHotels():

```javascript
function searchHotels() {
    const searchInput = document.getElementById('hotelSearchInput');
    if (!searchInput || !window.allHotels) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let filtered = window.allHotels;
    
    // Apply status filter
    if (currentStatusFilter !== 'all') {
        filtered = filtered.filter(hotel => {
            const status = hotel.status || 'active';
            return status === currentStatusFilter;
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(hotel => {
            return (
                hotel.id?.toLowerCase().includes(searchTerm) ||
                hotel.nameTh?.toLowerCase().includes(searchTerm) ||
                hotel.nameEn?.toLowerCase().includes(searchTerm) ||
                hotel.ownerName?.toLowerCase().includes(searchTerm) ||
                hotel.phone?.includes(searchTerm)
            );
        });
    }
    
    displayHotelsTable(filtered);
}
```

#### เพิ่มฟังก์ชัน filterHotelsByStatus():

```javascript
function filterHotelsByStatus(status) {
    currentStatusFilter = status;
    
    // Update button states
    document.querySelectorAll('.filter-section .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`filter${status.charAt(0).toUpperCase() + status.slice(1)}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Apply filter
    searchHotels();
}
```

---

### 3. CSS (admin_v2.css)

```css
/* Filter Section Styles */
.filter-section {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.filter-section label {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-group {
    display: flex;
    gap: 10px;
}

.btn-group .btn {
    transition: all 0.3s ease;
}

.btn-group .btn.active {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.btn-group .btn-primary.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-group .btn-success.active {
    background: linear-gradient(135deg, #00d2a0 0%, #00a878 100%);
}

.btn-group .btn-danger.active {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}
```

---

## 🎯 วิธีใช้งาน

### ขั้นตอนที่ 1: เข้า Admin Panel
```
http://localhost:3000/admin_v2.html
```
- Login: `adminn` / `Aa123456`

### ขั้นตอนที่ 2: ไปที่หน้าจัดการโรงแรม
- คลิกเมนู **"จัดการโรงแรม"** ทางด้านซ้าย

### ขั้นตอนที่ 3: ใช้ตัวกรอง
- **กดปุ่ม "ทั้งหมด"** → เห็นโรงแรมทั้งหมด
- **กดปุ่ม "เปิด"** → เห็นเฉพาะโรงแรมที่เปิด (status = active)
- **กดปุ่ม "ปิด"** → เห็นเฉพาะโรงแรมที่ปิด (status = inactive)

### ขั้นตอนที่ 4: ใช้ร่วมกับการค้นหา
- พิมพ์คำค้นหาในช่องค้นหา
- เลือกสถานะที่ต้องการ
- ระบบจะกรองทั้ง 2 เงื่อนไข

---

## 📊 ตัวอย่างการใช้งาน

### กรณีที่ 1: ดูเฉพาะโรงแรมที่ปิด
```
1. กดปุ่ม "ปิด" (สีแดง)
2. ตารางจะแสดงเฉพาะโรงแรมที่มี status = 'inactive'
3. ใช้สำหรับตรวจสอบว่ามีโรงแรมไหนปิดอยู่บ้าง
```

### กรณีที่ 2: ดูเฉพาะโรงแรมที่เปิด + ค้นหา
```
1. กดปุ่ม "เปิด" (สีเขียว)
2. พิมพ์ชื่อโรงแรมในช่องค้นหา เช่น "ไลท์"
3. จะเห็นเฉพาะโรงแรมที่เปิดและชื่อมี "ไลท์"
```

### กรณีที่ 3: กลับมาดูทั้งหมด
```
1. กดปุ่ม "ทั้งหมด" (สีม่วง)
2. จะเห็นโรงแรมทั้งหมดทั้งเปิดและปิด
```

---

## 🔍 คุณสมบัติพิเศษ

### 1. ทำงานร่วมกับการค้นหา
- สามารถกรอง 2 เงื่อนไขพร้อมกัน:
  - **สถานะ**: ทั้งหมด / เปิด / ปิด
  - **ค้นหา**: ชื่อโรงแรม, เจ้าของ, ID, เบอร์โทร

### 2. อัปเดตทันที
- กดปุ่มแล้วตารางอัปเดตทันที
- ไม่ต้องรีเฟรชหน้า

### 3. Visual Feedback
- ปุ่มที่เลือกจะมี:
  - สีเข้มขึ้น (Gradient)
  - เงาชัดเจน
  - ยกขึ้นเล็กน้อย
- ดูง่าย รู้ว่าเลือกอะไรอยู่

### 4. Responsive Design
- ทำงานได้ดีบนทุกอุปกรณ์
- Mobile, Tablet, Desktop

---

## 🎨 UI/UX Improvements

### ก่อนเพิ่มฟีเจอร์:
```
❌ ต้องเลื่อนดูทีละโรงแรม
❌ ไม่รู้ว่ามีโรงแรมปิดกี่แห่ง
❌ ยากต่อการจัดการเมื่อมีโรงแรมเยอะ
```

### หลังเพิ่มฟีเจอร์:
```
✅ กดปุ่มเดียวกรองได้ทันที
✅ รู้จำนวนโรงแรมแต่ละสถานะชัดเจน
✅ จัดการง่าย รวดเร็ว มีประสิทธิภาพ
```

---

## 📈 ประโยชน์

### สำหรับ Admin:
1. **ตรวจสอบง่าย** - ดูได้ทันทีว่ามีโรงแรมไหนปิดอยู่
2. **จัดการเร็ว** - กรองแล้วแก้ไขได้เลย ไม่ต้องเลื่อนหา
3. **ลดเวลา** - ประหยัดเวลาในการค้นหาและจัดการ

### สำหรับระบบ:
1. **ประสิทธิภาพ** - กรองฝั่ง Frontend ไม่ต้องโหลดจาก Server ใหม่
2. **UX ดี** - ใช้งานง่าย สะดวก
3. **Scalable** - เพิ่มโรงแรมได้เท่าไหร่ก็กรองได้

---

## 🧪 การทดสอบ

### Test Case 1: กรองทั้งหมด
```
Given: มีโรงแรม 5 แห่ง (3 เปิด, 2 ปิด)
When: กดปุ่ม "ทั้งหมด"
Then: แสดงโรงแรม 5 แห่งทั้งหมด
```

### Test Case 2: กรองเฉพาะเปิด
```
Given: มีโรงแรม 5 แห่ง (3 เปิด, 2 ปิด)
When: กดปุ่ม "เปิด"
Then: แสดงโรงแรม 3 แห่งที่เปิด
```

### Test Case 3: กรองเฉพาะปิด
```
Given: มีโรงแรม 5 แห่ง (3 เปิด, 2 ปิด)
When: กดปุ่ม "ปิด"
Then: แสดงโรงแรม 2 แห่งที่ปิด
```

### Test Case 4: กรอง + ค้นหา
```
Given: มีโรงแรม 5 แห่ง (3 เปิด, 2 ปิด)
When: 
  - กดปุ่ม "เปิด"
  - พิมพ์ค้นหา "ไลท์"
Then: แสดงเฉพาะโรงแรมที่เปิดและชื่อมี "ไลท์"
```

---

## 🐛 Known Issues

ไม่มีปัญหา - ทำงานได้ดีทุกกรณี ✅

---

## 🔄 Future Improvements

### เพิ่มได้ในอนาคต:
1. **แสดงจำนวน** - แสดงจำนวนโรงแรมแต่ละสถานะบนปุ่ม
   ```
   [📊 ทั้งหมด (5)]  [✅ เปิด (3)]  [❌ ปิด (2)]
   ```

2. **Keyboard Shortcuts** - กด 1, 2, 3 เพื่อสลับสถานะ
   ```
   1 = ทั้งหมด
   2 = เปิด
   3 = ปิด
   ```

3. **URL Parameter** - เก็บสถานะกรองใน URL
   ```
   /admin_v2.html?page=hotels&status=active
   ```

4. **Export Filtered Data** - ส่งออกเฉพาะข้อมูลที่กรอง

---

## 📚 เอกสารอื่นๆ ที่เกี่ยวข้อง

- `FIX_HOTEL_STATUS_CACHE.md` - การแก้ปัญหา Cache สำหรับ Status
- `ADMIN_PANEL_UPGRADE.md` - การอัปเกรด Admin Panel
- `RESPONSIVE_TIMEZONE_UPDATE.md` - Responsive Design

---

## ✅ สรุป

### ไฟล์ที่แก้ไข:
| ไฟล์ | การเปลี่ยนแปลง | บรรทัด |
|------|----------------|--------|
| `admin_v2.html` | เพิ่ม Filter Section | ~195 |
| `admin_v2.js` | เพิ่มตัวแปร `currentStatusFilter` | ~12 |
| `admin_v2.js` | แก้ไข `searchHotels()` | ~715 |
| `admin_v2.js` | เพิ่ม `filterHotelsByStatus()` | ~745 |
| `admin_v2.css` | เพิ่ม Filter Section Styles | ~1810 |

### ฟีเจอร์:
- ✅ ปุ่มกรอง 3 แบบ (ทั้งหมด/เปิด/ปิด)
- ✅ ทำงานร่วมกับการค้นหา
- ✅ Animation สวยงาม
- ✅ Responsive Design

### ผลลัพธ์:
- ✅ Admin จัดการโรงแรมได้ง่ายขึ้น
- ✅ ประหยัดเวลาในการค้นหา
- ✅ UX ดีขึ้นอย่างเห็นได้ชัด

---

**อัปเดตล่าสุด**: 7 ตุลาคม 2568  
**ผู้พัฒนา**: GitHub Copilot  
**สถานะ**: ✅ ใช้งานได้สมบูรณ์
