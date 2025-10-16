# 🔐 ระบบสิทธิ์ตาม Role - อัพเดทล่าสุด

## 📋 สรุปการเปลี่ยนแปลง

### ✅ ไฟล์ที่แก้ไข
1. **public/js/admin_v2.js** - ระบบ Frontend
2. **server.js** - JWT Token และ Session Management
3. **services/users.js** - การ Validate User

---

## 👥 สิทธิ์แต่ละ Role

### 🔵 USER (ผู้ใช้ทั่วไป)

**เมนูที่เห็น:**
- ✅ ระบบสมาชิก (เท่านั้น)

**ข้อจำกัด:**
- ❌ ไม่เห็นเมนู: Dashboard, โรงแรม, การจัดการ, ประวัติการแก้ไข, สถิติทั้งหมด
- ❌ ไม่มีปุ่ม "เพิ่มสมาชิก"
- ❌ ไม่มีตัวกรองบทบาท
- ❌ ไม่มีช่องค้นหา
- ❌ ไม่สามารถแก้ไข role ได้

**สิ่งที่ทำได้:**
- ✅ ดูข้อมูลตัวเองเท่านั้น
- ✅ แก้ไขข้อมูลตัวเอง (nickname, password)

---

### 🟠 HOTEL OWNER (เจ้าของโรงแรม)

**เมนูที่เห็น:**
- ✅ Dashboard
- ✅ โรงแรม (เฉพาะโรงแรมที่มี HotelID ตรงกับ `currentUser.hotelId`)
- ✅ ประวัติการแก้ไข (เฉพาะโรงแรมตัวเอง)
- ✅ สถิติทั้งหมด (เฉพาะโรงแรมตัวเอง)
- ✅ ระบบสมาชิก (เฉพาะ user ที่มี hotelId เดียวกัน)

**เมนูที่ซ่อน:**
- ❌ การจัดการ (สิ่งอำนวยความสะดวก, ประเภทที่พัก, ประเภทห้องพัก)

**ข้อจำกัด:**
- ❌ ไม่มีช่องค้นหาและตัวกรองใน "ประวัติการแก้ไข"
- ❌ ไม่สามารถแก้ไข role ได้
- ❌ เห็นเฉพาะข้อมูลที่เกี่ยวข้องกับโรงแรมของตัวเอง

**สิ่งที่ทำได้:**
- ✅ จัดการโรงแรมของตัวเอง
- ✅ ดูสถิติโรงแรมของตัวเอง
- ✅ ดูประวัติการแก้ไขโรงแรมของตัวเอง
- ✅ จัดการสมาชิกที่ดูแลโรงแรมเดียวกัน

**ข้อมูลที่แสดง:**
```javascript
// ในหน้าแก้ไขสมาชิก จะแสดงโรงแรมที่ตัวเองดูแลอยู่
{
  "hotelId": "001",
  "hotelName": "โรงแรมตัวอย่าง"
}
```

---

### 🔴 ADMIN (ผู้ดูแลระบบ)

**เมนูที่เห็น:**
- ✅ ทุกเมนู (เข้าถึงได้หมด)

**สิ่งที่ทำได้:**
- ✅ เห็นข้อมูลทั้งหมด
- ✅ จัดการได้ทุกส่วน
- ✅ แก้ไข role ของสมาชิก
- ✅ เพิ่ม/ลบ/แก้ไข โรงแรม, สิ่งอำนวยความสะดวก, ประเภทที่พัก, ประเภทห้องพัก
- ✅ ดูสถิติและประวัติทั้งหมด

---

## 🔧 การทำงานของระบบ

### 1. Session Management

```javascript
// ข้อมูลที่เก็บใน localStorage
{
  "authToken": "JWT_TOKEN",
  "currentUser": {
    "username": "user123",
    "nickname": "ชื่อผู้ใช้",
    "role": "hotel_owner",
    "hotelId": "001"  // เฉพาะ hotel_owner
  }
}
```

### 2. JWT Token

```javascript
// ข้อมูลใน JWT Payload
{
  "username": "user123",
  "nickname": "ชื่อผู้ใช้",
  "role": "hotel_owner",
  "hotelId": "001",
  "exp": 1234567890
}
```

### 3. Google Sheets - Users Sheet

| Column | Field | Description |
|--------|-------|-------------|
| A | username | ชื่อผู้ใช้ |
| B | password | รหัสผ่าน |
| C | nickname | ชื่อเล่น |
| D | role | บทบาท (admin, hotel_owner, user) |
| E | hotelId | เลข ID โรงแรม (เฉพาะ hotel_owner) |

**ตัวอย่าง:**
```
username    | password | nickname      | role         | hotelId
------------|----------|---------------|--------------|--------
adminn      | pass123  | ผู้ดูแลระบบ   | admin        | 
hotel1      | pass456  | เจ้าของโรงแรม1| hotel_owner  | 001
users       | pass789  | ผู้ใช้ทั่วไป | user         |
```

---

## 🎯 ฟังก์ชันสำคัญที่ปรับปรุง

### 1. `applyRolePermissions()` - admin_v2.js

```javascript
function applyRolePermissions() {
    const userRole = currentUser.role || 'user';
    const userHotelId = currentUser.hotelId || '';
    
    if (userRole === 'user') {
        // ซ่อนเมนูทั้งหมดยกเว้น "ระบบสมาชิก"
        // ซ่อนปุ่ม "เพิ่มสมาชิก", ตัวกรอง, ช่องค้นหา
        
    } else if (userRole === 'hotel_owner') {
        // แสดงเมนู: Dashboard, โรงแรม, ประวัติ, สถิติ, สมาชิก
        // ซ่อนเมนู "การจัดการ"
        // ซ่อนช่องค้นหาและตัวกรองในประวัติ
        
    } else if (userRole === 'admin') {
        // แสดงทุกเมนู
    }
}
```

### 2. `loadHotels()` - admin_v2.js

```javascript
async function loadHotels() {
    let hotels = data.data;
    
    // กรองตาม role
    if (userRole === 'hotel_owner' && userHotelId) {
        hotels = hotels.filter(hotel => hotel.id === userHotelId);
    }
    
    window.allHotels = hotels;
    await displayHotelsTable(hotels);
}
```

### 3. `loadActivityLog()` - admin_v2.js

```javascript
async function loadActivityLog() {
    let logs = data.data.logs || [];
    
    // กรองตาม role
    if (userRole === 'hotel_owner' && userHotelId) {
        logs = logs.filter(log => log.hotelId === userHotelId);
    }
    
    displayActivityLog(logs);
}
```

### 4. `loadLikesStats()` - admin_v2.js

```javascript
async function loadLikesStats() {
    let topHotels = data.data.topHotels;
    let topClickedHotels = data.data.topClickedHotels;
    
    // กรองตาม role
    if (userRole === 'hotel_owner' && userHotelId) {
        // กรอง topHotels และ topClickedHotels
        // เฉพาะโรงแรมที่มี hotelId ตรงกัน
    }
    
    displayLikesStats(topHotels, topClickedHotels);
}
```

### 5. `loadMembers()` - admin_v2.js

```javascript
async function loadMembers() {
    let allMembers = data.data || [];
    
    // กรองตาม role
    if (userRole === 'user') {
        // แสดงเฉพาะตัวเอง
        allMembers = allMembers.filter(m => m.username === currentUser.username);
        
    } else if (userRole === 'hotel_owner' && userHotelId) {
        // แสดงเฉพาะ user ที่มี hotelId เดียวกัน
        allMembers = allMembers.filter(m => m.hotelId === userHotelId);
    }
    
    displayMembers(allMembers);
}
```

### 6. `editMember()` - admin_v2.js

```javascript
async function editMember(memberUsername) {
    // ซ่อนฟิลด์ role ตาม role ของผู้ใช้
    if (userRole === 'user' || userRole === 'hotel_owner') {
        // ซ่อนฟิลด์ role
        roleGroup.style.display = 'none';
    } else {
        // admin เท่านั้นที่แก้ไข role ได้
        roleGroup.style.display = 'block';
    }
    
    // แสดงข้อมูลโรงแรมที่ดูแล (เฉพาะ hotel_owner)
    if (member.role === 'hotel_owner' && member.hotelId) {
        // แสดงชื่อโรงแรมที่ดูแล
    }
}
```

---

## 🧪 การทดสอบ

### Test Case 1: User Role

1. ล็อกอินด้วย username: `users` (role: user)
2. ตรวจสอบ:
   - ✅ เห็นเฉพาะเมนู "ระบบสมาชิก"
   - ✅ ไม่มีปุ่ม "เพิ่มสมาชิก"
   - ✅ ไม่มีตัวกรองบทบาท
   - ✅ ไม่มีช่องค้นหา
   - ✅ เห็นเฉพาะข้อมูลตัวเอง
   - ✅ แก้ไขได้เฉพาะ nickname และ password

### Test Case 2: Hotel Owner Role

1. ล็อกอินด้วย username: `hotel1` (role: hotel_owner, hotelId: "001")
2. ตรวจสอบ:
   - ✅ เห็นเมนู: Dashboard, โรงแรม, ประวัติ, สถิติ, สมาชิก
   - ✅ ไม่เห็นเมนู "การจัดการ"
   - ✅ ใน "โรงแรม" เห็นเฉพาะโรงแรม ID: 001
   - ✅ ใน "ประวัติ" เห็นเฉพาะประวัติโรงแรม ID: 001
   - ✅ ไม่มีช่องค้นหาและตัวกรองในประวัติ
   - ✅ ใน "สถิติ" เห็นเฉพาะสถิติโรงแรม ID: 001
   - ✅ ใน "สมาชิก" เห็นเฉพาะ user ที่มี hotelId: 001
   - ✅ ไม่สามารถแก้ไข role ได้
   - ✅ แสดงโรงแรมที่ตัวเองดูแลในหน้าแก้ไขสมาชิก

### Test Case 3: Admin Role

1. ล็อกอินด้วย username: `adminn` (role: admin)
2. ตรวจสอบ:
   - ✅ เห็นทุกเมนู
   - ✅ เห็นข้อมูลทั้งหมด
   - ✅ แก้ไข role ได้
   - ✅ จัดการได้ทุกส่วน

---

## 📝 หมายเหตุสำหรับนักพัฒนา

### การเพิ่ม Hotel Owner ใหม่

1. เข้า Google Sheets → Users
2. เพิ่มข้อมูล:
   ```
   username   | password | nickname    | role        | hotelId
   hotel2     | pass123  | เจ้าของโรงแรม2 | hotel_owner | 002
   ```

### การตรวจสอบ hotelId

```javascript
// ใน console.log
console.log('Current User:', currentUser);
// Output: { username: 'hotel1', role: 'hotel_owner', hotelId: '001' }

// ใน localStorage
localStorage.getItem('currentUser')
// Output: {"username":"hotel1","nickname":"เจ้าของโรงแรม1","role":"hotel_owner","hotelId":"001"}
```

### การ Debug

```javascript
// ดูสิทธิ์ที่ใช้งาน
console.log('🔒 Applying permissions for role:', userRole, 'hotelId:', userHotelId);

// ดูข้อมูลที่กรองแล้ว
console.log('🏨 Filtered hotels for hotel_owner:', userHotelId, 'count:', hotels.length);
console.log('📝 Filtered activity logs for hotel_owner:', userHotelId, 'count:', logs.length);
console.log('📊 Filtered stats for hotel_owner:', userHotelId);
```

---

## 🔄 เวอร์ชัน

- **Version:** 2.0
- **Last Updated:** 2025-10-10
- **Author:** GitHub Copilot

---

## ✨ การปรับปรุงในอนาคต

- [ ] เพิ่มระบบ Audit Log สำหรับการเปลี่ยนแปลง role
- [ ] เพิ่มระบบแจ้งเตือนเมื่อมีการเข้าถึงข้อมูลที่ไม่ได้รับอนุญาต
- [ ] เพิ่มการกำหนด multiple hotelId สำหรับ hotel_owner (ดูแลหลายโรงแรม)
- [ ] เพิ่มระบบ Two-Factor Authentication (2FA)
