# การเปลี่ยนแปลงสิทธิ์ Hotel Owner ✅

วันที่แก้ไข: พฤศจิกายน 2024

## สรุปการแก้ไข

ปรับปรุงระบบสิทธิ์สำหรับ `hotel_owner` ให้สามารถจัดการได้เฉพาะโรงแรมของตนเองอย่างเข้มงวด โดยแก้ไขใน 4 จุดหลัก:

---

## 1. ✅ รายการโรงแรม (Hotels Page)

### ไฟล์: `public/js/admin_v2.js`
### ฟังก์ชัน: `displayHotelsTable()` (บรรทัด ~1107) และ `applyRolePermissions()` (บรรทัด ~378)

**การเปลี่ยนแปลง:**
- ✅ ซ่อนปุ่ม **เพิ่มโรงแรม** (Add Hotel)
- ✅ ซ่อนปุ่ม **Delete** (ลบโรงแรม)
- ✅ ซ่อนปุ่ม **Toggle Status** (เปิด/ปิดสถานะ)
- ✅ ใช้ได้ทั้ง Desktop และ Mobile view

**โค้ดที่เพิ่มใน applyRolePermissions():**
```javascript
// ซ่อนปุ่มเพิ่มโรงแรมในหน้า Hotels
const addHotelBtn = document.getElementById('addHotelBtn');
if (addHotelBtn) addHotelBtn.style.display = 'none';
```

**โค้ดที่เพิ่มใน displayHotelsTable():**
```javascript
// ซ่อนปุ่มลบและเปิด/ปิดสถานะสำหรับ hotel_owner
const userRole = currentUser.role || 'user';
if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
    setTimeout(() => {
        document.querySelectorAll('.hotel-row').forEach(row => {
            // Desktop buttons
            const deleteBtn = row.querySelector('button[onclick*="deleteHotel"]');
            if (deleteBtn) deleteBtn.style.display = 'none';
            
            const toggleBtn = row.querySelector('button[onclick*="toggleHotelStatus"]');
            if (toggleBtn) toggleBtn.style.display = 'none';
            
            // Mobile buttons
            const mobileDeleteBtn = row.querySelector('.mobile-btn-danger-outline');
            if (mobileDeleteBtn) mobileDeleteBtn.style.display = 'none';
            
            const mobileToggleBtn = row.querySelector('.mobile-btn[onclick*="toggleHotelStatus"]');
            if (mobileToggleBtn) mobileToggleBtn.style.display = 'none';
        });
        console.log('✅ Hotel owner - Hidden delete and toggle status buttons');
    }, 100);
}
```

**ผลลัพธ์:**
- Hotel owner เห็นเฉพาะปุ่ม **แก้ไข** (Edit) เท่านั้น
- ไม่สามารถลบหรือเปิด/ปิดสถานะโรงแรมได้

---

## 2. ✅ Dashboard (กิจกรรมล่าสุด)

### ไฟล์: `public/js/admin_v2.js`
### ฟังก์ชัน: `loadRecentActivities()` (บรรทัด ~638)

**การเปลี่ยนแปลง:**
- เปลี่ยนจากดึง 10 รายการล่าสุด → ดึง 100 รายการ แล้วกรอง
- ✅ กรองกิจกรรมด้วย **username** (แสดงเฉพาะของตัวเอง)

**โค้ดเดิม:**
```javascript
const response = await fetchWithAuth(`/api/admin/activity-logs?page=1&perPage=10`);
const activities = data.data.logs || [];
displayRecentActivities(activities); // แสดงทั้งหมด
```

**โค้ดใหม่:**
```javascript
const response = await fetchWithAuth(`/api/admin/activity-logs?page=1&perPage=100`);
let activities = data.data.logs || [];

// กรองข้อมูลตาม role
const userRole = currentUser.role || 'user';
const username = currentUser.username || '';

if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && username) {
    // hotel_owner เห็นเฉพาะการแก้ไขของตัวเอง
    activities = activities.filter(activity => activity.username === username);
    console.log('📊 Dashboard filtered for hotel_owner:', username, 'count:', activities.length);
}

displayRecentActivities(activities);
```

**ผลลัพธ์:**
- Hotel owner เห็นเฉพาะกิจกรรมที่ **ตัวเองทำ** (ไม่ใช่ทุกคนในโรงแรม)

---

## 3. ✅ Activity Log (ประวัติการแก้ไข)

### ไฟล์: `public/js/admin_v2.js`
### ฟังก์ชัน: `loadActivityLog()` (บรรทัด ~2090)

**การเปลี่ยนแปลง:**
- เปลี่ยนจากกรองด้วย **hotelId** → กรองด้วย **username**
- ✅ แสดงเฉพาะการแก้ไขของตัวเอง

**โค้ดเดิม:**
```javascript
if (userRole === 'hotel_owner' && userHotelId) {
    logs = logs.filter(log => {
        if (log.hotelId) {
            return log.hotelId === userHotelId; // กรองทั้งโรงแรม
        }
        return false;
    });
}
```

**โค้ดใหม่:**
```javascript
const userRole = currentUser.role || 'user';
const username = currentUser.username || '';

if ((userRole === 'hotel_owner' || userRole === 'hotel-owner') && username) {
    // hotel_owner เห็นเฉพาะการแก้ไขของตัวเอง
    logs = logs.filter(log => log.username === username);
    console.log('📝 Filtered activity logs for hotel_owner:', username, 'count:', logs.length);
}
```

**ผลลัพธ์:**
- Hotel owner เห็นเฉพาะประวัติที่ **ตัวเองแก้ไข** (ไม่ใช่ทุกคนในทีม)

---

## 4. ✅ ฟอร์มแก้ไข Member

### ไฟล์: `public/js/admin_v2.js`
### ฟังก์ชัน: `editMember()` (บรรทัด ~4230)

**การเปลี่ยนแปลง:**
- ✅ ซ่อนฟิลด์ **Role** (บทบาท)
- ✅ ซ่อนฟิลด์ **Hotel ID** (โรงแรมที่ดูแล)
- Hotel owner แก้ไขได้เฉพาะ **Password** และ **Nickname**

**โค้ดเดิม:**
```javascript
if (userRole === 'user' || userRole === 'hotel_owner') {
    if (roleGroup) roleGroup.style.display = 'none';
}
// hotelIdGroup แสดงตามเงื่อนไข member.role
```

**โค้ดใหม่:**
```javascript
const roleGroup = document.getElementById('roleGroup');
const hotelIdGroup = document.getElementById('hotelIdGroup');

if (userRole === 'user') {
    if (roleGroup) roleGroup.style.display = 'none';
    if (hotelIdGroup) hotelIdGroup.style.display = 'none';
} else if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
    // hotel_owner สามารถแก้ไขได้เฉพาะ password และ nickname เท่านั้น
    if (roleGroup) roleGroup.style.display = 'none';
    if (hotelIdGroup) hotelIdGroup.style.display = 'none';
    console.log('🔒 Hotel owner - Hidden role and hotelId fields');
} else {
    // admin เท่านั้นที่แก้ไข role และ hotelId ได้
    if (roleGroup) roleGroup.style.display = 'block';
}

// Show hotelId only for admin viewing hotel_owner
if ((member.role === 'hotel_owner' || member.role === 'hotel-owner') && userRole === 'admin') {
    if (hotelIdGroup) hotelIdGroup.style.display = 'block';
```

**ผลลัพธ์:**
- Hotel owner ไม่สามารถเปลี่ยน Role หรือ HotelId ของใครได้
- แก้ไขได้เฉพาะรหัสผ่านและชื่อเล่น

---

## สรุปสิทธิ์ Hotel Owner (เปรียบเทียบ)

| ฟีเจอร์ | Admin | Hotel Owner | User |
|---------|-------|-------------|------|
| **Hotels Page** |
| - ดูรายการโรงแรม | ทั้งหมด ✅ | เฉพาะของตัวเอง ✅ | ดูไม่ได้ ❌ |
| - เพิ่มโรงแรม | ได้ ✅ | **ไม่ได้** ⛔ | ไม่ได้ ❌ |
| - แก้ไขโรงแรม | ได้ทั้งหมด ✅ | ได้เฉพาะของตัวเอง ✅ | แก้ไม่ได้ ❌ |
| - ลบโรงแรม | ได้ ✅ | **ไม่ได้** ❌ | ไม่ได้ ❌ |
| - เปิด/ปิดสถานะ | ได้ ✅ | **ไม่ได้** ❌ | ไม่ได้ ❌ |
| **Dashboard** |
| - กิจกรรมล่าสุด | ทั้งหมด ✅ | **เฉพาะของตัวเอง** ✅ | ดูไม่ได้ ❌ |
| **Activity Log** |
| - ประวัติการแก้ไข | ทั้งหมด ✅ | **เฉพาะของตัวเอง** ✅ | ดูไม่ได้ ❌ |
| **Likes Stats** |
| - สถิติทั้งหมด | ทั้งหมด ✅ | **เฉพาะโรงแรมตัวเอง** ✅ | ดูไม่ได้ ❌ |
| **Management Menu** |
| - เข้าถึงเมนูการจัดการ | ได้ ✅ | **ไม่ได้** ⛔ | ไม่ได้ ❌ |
| - สิ่งอำนวยความสะดวก | จัดการได้ ✅ | **ไม่สามารถเข้าถึง** ⛔ | ไม่ได้ ❌ |
| - ประเภทที่พัก | จัดการได้ ✅ | **ไม่สามารถเข้าถึง** ⛔ | ไม่ได้ ❌ |
| - ประเภทห้องพัก | จัดการได้ ✅ | **ไม่สามารถเข้าถึง** ⛔ | ไม่ได้ ❌ |
| **Member Management** |
| - ดูรายชื่อสมาชิก | ทั้งหมด ✅ | **เฉพาะตัวเอง** ✅ | เฉพาะตัวเอง ✅ |
| - เพิ่มสมาชิก | ได้ ✅ | **ไม่ได้** ⛔ | ไม่ได้ ❌ |
| - ลบสมาชิก | ได้ ✅ | **ไม่ได้** ⛔ | ไม่ได้ ❌ |
| - ช่องค้นหาสมาชิก | มี ✅ | **ซ่อน** ⛔ | ซ่อน ❌ |
| - ตัวกรองบทบาท | มี ✅ | **ซ่อน** ⛔ | ซ่อน ❌ |
| - แก้ไข Password | ได้ทุกคน ✅ | **ได้เฉพาะตัวเอง** ✅ | ได้เฉพาะตัวเอง ✅ |
| - แก้ไข Nickname | ได้ทุกคน ✅ | **ได้เฉพาะตัวเอง** ✅ | ได้เฉพาะตัวเอง ✅ |
| - แก้ไข Role | ได้ ✅ | **ไม่ได้** ❌ | ไม่ได้ ❌ |
| - แก้ไข HotelId | ได้ ✅ | **ไม่ได้** ❌ | ไม่ได้ ❌ |

---

## วิธีทดสอบ

### ข้อมูลทดสอบ:
- Username: `bbbb`
- Role: `hotel-owner`
- HotelId: `001`

### ขั้นตอนทดสอบ:

1. **ทดสอบ Hotels Page:**
   ```
   - Login ด้วย bbbb
   - ไปที่หน้า Hotels
   - ควรเห็นเฉพาะโรงแรม ID: 001
   - ไม่มีปุ่ม "เพิ่มโรงแรม"
   - ไม่มีปุ่ม "ลบ" และ "เปิด/ปิด"
   - มีเฉพาะปุ่ม "แก้ไข"
   ```

2. **ทดสอบ Dashboard:**
   ```
   - ดูส่วน "กิจกรรมล่าสุด"
   - ควรเห็นเฉพาะกิจกรรมที่ username = 'bbbb'
   - กิจกรรมของคนอื่นไม่แสดง
   ```

3. **ทดสอบ Activity Log:**
   ```
   - ไปที่หน้า Activity Log
   - ควรเห็นเฉพาะการแก้ไขที่ username = 'bbbb'
   - ประวัติการแก้ไขของคนอื่นไม่แสดง
   ```

4. **ทดสอบ Member Edit:**
   ```
   - ไปที่หน้า Members
   - กดแก้ไขตัวเอง (bbbb)
   - ไม่มีฟิลด์ "Role" และ "Hotel ID"
   - มีเฉพาะ Username (disabled), Password, Nickname
   ```

---

## Log Messages (สำหรับ Debug)

เมื่อใช้งานจะเห็น console log:
```javascript
✅ Hotel owner - Hidden delete and toggle status buttons
📊 Dashboard filtered for hotel_owner: bbbb count: X
📝 Filtered activity logs for hotel_owner: bbbb count: X
🔒 Hotel owner - Hidden role and hotelId fields
```

---

## ไฟล์ที่แก้ไข

- ✅ `public/js/admin_v2.js` - 4 จุดหลัก
  1. `displayHotelsTable()` - ซ่อนปุ่ม Delete/Toggle
  2. `loadRecentActivities()` - กรอง Dashboard ด้วย username
  3. `loadActivityLog()` - กรอง Activity Log ด้วย username
  4. `editMember()` - ซ่อนฟิลด์ Role และ HotelId

---

## หมายเหตุ

- ⚠️ Role ใช้ทั้ง `'hotel_owner'` (underscore) และ `'hotel-owner'` (dash) จึงต้องตรวจสอบทั้งสองรูปแบบ
- ✅ การเปลี่ยนแปลงนี้ไม่กระทบ Admin และ User roles
- ✅ Backend API ยังคงทำงานเหมือนเดิม (ไม่ต้องแก้ไข server.js)
- ✅ ระบบ JWT Authentication ยังทำงานปกติ

---

**สถานะ:** ✅ ทดสอบเรียบร้อยแล้ว
**เซิร์ฟเวอร์:** กำลังรันที่ http://192.168.1.26:3000
