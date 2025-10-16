# Activity Log v2.0 - อัพเดทรายละเอียดเต็มรูปแบบ

**วันที่:** 7 ตุลาคม 2568  
**เวอร์ชัน:** 2.0  
**สถานะ:** ✅ เสร็จสมบูรณ์

---

## 📋 สรุปการอัพเดท

เพิ่มฟิลด์ `type` และ `details` ในระบบ Activity Log เพื่อแสดงรายละเอียดแบบเต็มพร้อมป้ายกำกับสีสัน

---

## 🎯 ฟีเจอร์ใหม่

### 1. ฟิลด์ใหม่
- **type** (คอลัมน์ F) - ประเภทกิจกรรม
- **details** (คอลัมน์ G) - รายละเอียดเต็ม

### 2. การแสดงผลใหม่
- ✅ ป้ายกำกับประเภท (Type Badge) พร้อมสีสัน
- ✅ กล่องรายละเอียดแบบเต็ม (Details Box)
- ✅ แสดงชื่อโรงแรมแยกต่างหาก
- ✅ ไอคอนและสีอัตโนมัติตามประเภท

### 3. ประเภทที่รองรับ (Type)

| Type      | ชื่อไทย                   | สี             | ตัวอย่างการใช้              |
|-----------|--------------------------|----------------|----------------------------|
| `hotel`   | โรงแรม                   | 🟣 #667eea     | เพิ่ม/แก้ไข/ลบโรงแรม        |
| `amenity` | สิ่งอำนวยความสะดวก       | 🟢 #00d2a0     | เพิ่ม/แก้ไขตัวกรอง          |
| `login`   | การเข้าสู่ระบบ           | 🔵 #3b82f6     | เข้าสู่ระบบ                 |
| `logout`  | ออกจากระบบ               | ⚪ #64748b     | ออกจากระบบ                  |
| `system`  | ระบบ                     | 🟣 #8b5cf6     | การตั้งค่า/บำรุงรักษา       |

---

## 📊 โครงสร้าง Google Sheets

### ActivityLog Sheet (คอลัมน์ A-G)

| Column | Field      | ตัวอย่างข้อมูล                           | Required |
|--------|------------|----------------------------------------|----------|
| A      | timestamp  | `07/10/2568 18:57:40`                  | ✅       |
| B      | username   | `adminn`                               | ✅       |
| C      | nickname   | `art lighthouse`                       | ✅       |
| D      | action     | `แก้ไขโรงแรม`                          | ✅       |
| E      | hotelName  | `เดอะไลท์เฮ้าส์รีสอร์ทเกาะล้าน`        | ❌       |
| F      | type       | `hotel`                                | ❌       |
| G      | details    | `แก้ไขข้อมูลห้องพัก เพิ่มราคาพิเศษ`     | ❌       |

---

## 🎨 ตัวอย่างการแสดงผล

### แบบเดิม (ก่อนอัพเดท)
```
┌────────────────────────────────────┐
│ 🔧 แก้ไขโรงแรม                     │
│ ไม่มีรายละเอียดเพิ่มเติม           │
│ 👤 art lighthouse (@adminn)       │
│ 🕐 07/10/2568 18:57:40            │
└────────────────────────────────────┘
```

### แบบใหม่ (หลังอัพเดท)
```
┌────────────────────────────────────────────┐
│ 🔧 แก้ไขโรงแรม [โรงแรม]              │
│ ┌────────────────────────────────────┐   │
│ │ แก้ไขข้อมูลห้องพัก เพิ่มราคาพิเศษ │   │
│ └────────────────────────────────────┘   │
│ 🏨 เดอะไลท์เฮ้าส์รีสอร์ทเกาะล้าน       │
│ 👤 art lighthouse (@adminn)           │
│ 🕐 07/10/2568 18:57:40                │
└────────────────────────────────────────────┘
```

---

## 📝 วิธีเพิ่มข้อมูลใน Google Sheets

### ตัวอย่าง 1: เพิ่มโรงแรม
```
A: 07/10/2568 19:30:00
B: adminn
C: art lighthouse
D: เพิ่มโรงแรม
E: บีช รีสอร์ท เกาะล้าน
F: hotel
G: เพิ่มโรงแรมใหม่ จำนวน 25 ห้อง พร้อมสระว่ายน้ำ
```

### ตัวอย่าง 2: แก้ไขสิ่งอำนวยความสะดวก
```
A: 07/10/2568 19:45:00
B: adminn
C: art lighthouse
D: แก้ไขตัวกรอง
E: WiFi ฟรี
F: amenity
G: อัพเดทไอคอนและสีของตัวกรอง WiFi
```

### ตัวอย่าง 3: Login
```
A: 07/10/2568 20:00:00
B: adminn
C: art lighthouse
D: เข้าสู่ระบบ
E: (เว้นว่าง)
F: login
G: เข้าสู่ระบบจาก IP: 192.168.1.100
```

---

## 🔧 ไฟล์ที่แก้ไข

### 1. Backend (Services)
**File:** `services/activityLog.js`
```javascript
// เปลี่ยนจาก
range: `${ACTIVITY_SHEET}!A2:E`

// เป็น
range: `${ACTIVITY_SHEET}!A2:G`

// เพิ่มฟิลด์ใหม่
activities = rows.map(row => ({
  timestamp: row[0] || '',
  username: row[1] || '',
  nickname: row[2] || '',
  action: row[3] || '',
  hotelName: row[4] || '',
  type: row[5] || '',      // ใหม่
  details: row[6] || ''    // ใหม่
}))
```

### 2. Frontend (JavaScript)
**File:** `public/js/admin_v2.js`

**การปรับปรุง:**
- เพิ่มตรรกะจัดการ `type` และ `details`
- สร้างป้ายกำกับสีตาม `type`
- แสดงรายละเอียดในกล่องข้อความ
- แยกแสดง `hotelName` เป็นส่วนเสริม

### 3. Frontend (CSS)
**File:** `public/css/admin_v2.css`

**สไตล์ใหม่:**
```css
.activity-details {
  background: #f8f9fa;
  border-left: 3px solid #667eea;
  padding: 8px 12px;
  border-radius: 6px;
}

.activity-hotel {
  background: #667eea10;
  color: #667eea;
  padding: 6px 10px;
  border-radius: 4px;
}

.activity-type-badge {
  background: [type-color]20;
  color: [type-color];
  padding: 2px 8px;
  border-radius: 4px;
}
```

---

## 🧪 การทดสอบ

### ขั้นตอนทดสอบ:

1. **เข้า Admin Panel**
   ```
   http://localhost:3000/admin_v2.html
   Login: adminn / Aa123456
   ```

2. **ไปหน้า "ประวัติการแก้ไข"**

3. **ตรวจสอบการแสดงผล:**
   - ✅ มีป้ายกำกับประเภท (ถ้ามี `type`)
   - ✅ แสดงรายละเอียดในกล่อง (ถ้ามี `details`)
   - ✅ แสดงชื่อโรงแรมแยกต่างหาก (ถ้ามี `hotelName`)
   - ✅ สีและไอคอนถูกต้องตามประเภท

4. **ทดสอบเพิ่ม/แก้ไขข้อมูล:**
   - เพิ่มโรงแรมใหม่
   - แก้ไขโรงแรม
   - ดู Activity Log ว่าบันทึกถูกต้อง

---

## 📌 หมายเหตุสำคัญ

### สำหรับข้อมูลเก่า
- ข้อมูลเก่าที่ไม่มี `type` และ `details` จะแสดงปกติ
- ไม่มีป้ายกำกับประเภท
- แสดงเฉพาะ `hotelName` หรือข้อความ "ไม่มีรายละเอียดเพิ่มเติม"

### สำหรับข้อมูลใหม่
- ควรระบุ `type` เสมอเพื่อให้มีป้ายกำกับสี
- ควรระบุ `details` เพื่อให้ข้อมูลครบถ้วน
- `hotelName` เป็น optional แต่แนะนำให้ใส่

### ประสิทธิภาพ
- API ดึงสูงสุด 1000 รายการเพื่อ pagination
- แสดง 10 รายการต่อหน้า
- รองรับการกรองตามประเภทและการกระทำ

---

## 🎯 ตัวอย่างการใช้งาน

### Use Case 1: เพิ่มโรงแรมพร้อมรายละเอียด
```javascript
await logActivity(
  'adminn',
  'art lighthouse',
  'เพิ่มโรงแรม',
  'Sunset Beach Resort',
  'hotel',
  'เพิ่มโรงแรมใหม่ 40 ห้อง วิวทะเล มีสระว่ายน้ำและฟิตเนส'
)
```

**ผลลัพธ์:**
```
🟣 เพิ่มโรงแรม [โรงแรม]
┌─────────────────────────────────────────────────┐
│ เพิ่มโรงแรมใหม่ 40 ห้อง วิวทะเล             │
│ มีสระว่ายน้ำและฟิตเนส                        │
└─────────────────────────────────────────────────┘
🏨 Sunset Beach Resort
```

### Use Case 2: Login
```javascript
await logActivity(
  'adminn',
  'art lighthouse',
  'เข้าสู่ระบบ',
  '',
  'login',
  'เข้าสู่ระบบจาก Chrome 120.0.0.0 (Windows 11)'
)
```

**ผลลัพธ์:**
```
🔵 เข้าสู่ระบบ [การเข้าสู่ระบบ]
┌──────────────────────────────────────────────────┐
│ เข้าสู่ระบบจาก Chrome 120.0.0.0 (Windows 11) │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps (แนะนำ)

### 1. อัพเดท logActivity Function
แก้ไขฟังก์ชัน `logActivity()` ให้รับพารามิเตอร์ `type` และ `details`:

```javascript
// services/activityLog.js
async function logActivity(username, nickname, action, hotelName = '', type = '', details = '') {
  const timestamp = new Date().toLocaleString('th-TH', { 
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(',', '');

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${ACTIVITY_SHEET}!A:G`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[timestamp, username, nickname, action, hotelName, type, details]]
    }
  });
}
```

### 2. อัพเดท Server.js
เพิ่ม `type` และ `details` ในทุก log activity:

```javascript
// server.js - ตัวอย่างการเพิ่มโรงแรม
await activityLogService.logActivity(
  validation.user.username,
  validation.user.nickname,
  'เพิ่มโรงแรม',
  newHotel.name,
  'hotel',  // type
  `เพิ่มโรงแรมใหม่ ${newHotel.rooms} ห้อง ราคา ${newHotel.minPrice}-${newHotel.maxPrice} บาท`  // details
);
```

### 3. เพิ่ม Auto-fill Details
สร้างฟังก์ชันสร้าง details อัตโนมัติ:

```javascript
function generateHotelDetails(hotel, action) {
  switch(action) {
    case 'add':
      return `เพิ่มโรงแรมใหม่ ${hotel.rooms} ห้อง ราคา ${hotel.minPrice}-${hotel.maxPrice} บาท`;
    case 'edit':
      return `อัพเดทข้อมูล: ${hotel.updated_fields.join(', ')}`;
    case 'delete':
      return `ลบโรงแรม ID: ${hotel.id}`;
  }
}
```

---

## ✅ Checklist

- [x] แก้ไข `services/activityLog.js` - อ่านคอลัมน์ F, G
- [x] แก้ไข `public/js/admin_v2.js` - แสดงผล type & details
- [x] แก้ไข `public/css/admin_v2.css` - เพิ่ม styles ใหม่
- [x] ทดสอบ API response
- [x] รีสตาร์ท server
- [ ] เพิ่มข้อมูล type/details ใน Google Sheets
- [ ] อัพเดท logActivity function (แนะนำ)
- [ ] อัพเดท server.js ทุก log activity (แนะนำ)

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Google Sheets มีคอลัมน์ F (type) และ G (details)
2. รีสตาร์ท server: `Get-Process -Name node | Stop-Process; npm start`
3. Clear cache: Ctrl+Shift+R
4. ตรวจสอบ Console (F12) หาข้อผิดพลาด

---

**สร้างโดย:** GitHub Copilot  
**วันที่:** 7 ตุลาคม 2568  
**เวอร์ชัน:** 2.0
