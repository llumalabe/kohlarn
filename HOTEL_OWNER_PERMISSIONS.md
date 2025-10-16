# 🏨 การปรับปรุงสิทธิ์ Hotel Owner

## 📋 สรุปความต้องการ

### สิทธิ์ของ Hotel Owner:

1. **Dashboard**
   - ✅ แสดงกิจกรรมล่าสุดของตัวเองเท่านั้น (ไม่แสดง user คนอื่น)

2. **โรงแรม**
   - ✅ แสดงเฉพาะโรงแรมที่รับผิดชอบ
   - ❌ ไม่สามารถลบโรงแรมได้
   - ❌ ไม่สามารถเปิด/ปิดสถานะโรงแรมได้
   - ✅ แก้ไขข้อมูลโรงแรมได้

3. **การจัดการ**
   - ❌ ซ่อนเมนูนี้ทั้งหมด (hotel owner ไม่ควรใช้)

4. **ประวัติการแก้ไข**
   - ✅ แสดงเฉพาะประวัติที่ตัวเองแก้ไข
   - ❌ ไม่แสดงประวัติของ user อื่น

5. **สถิติทั้งหมด**
   - ✅ แสดงสถิติของโรงแรมที่รับผิดชอบเท่านั้น

6. **ระบบสมาชิก**
   - ✅ แก้ไขได้เฉพาะ: รหัสผ่าน และ ชื่อที่แสดง
   - ❌ ไม่สามารถแก้ไข: บทบาท (role) และ โรงแรมที่รับผิดชอบ (hotelId)

---

## 🔄 การเปลี่ยนแปลงที่ต้องทำ

### 1. Dashboard - กรองกิจกรรมล่าสุด
```javascript
// แสดงเฉพาะกิจกรรมของ currentUser.username
if (userRole === 'hotel_owner') {
  activities = activities.filter(activity => 
    activity.username === currentUser.username
  );
}
```

### 2. โรงแรม - ซ่อนปุ่มลบและเปิด/ปิดสถานะ
```javascript
// ในฟังก์ชัน displayHotelsTable()
if (userRole === 'hotel_owner') {
  // ซ่อนปุ่มลบ
  deleteButton.style.display = 'none';
  // ซ่อนปุ่มเปิด/ปิดสถานะ
  toggleStatusButton.style.display = 'none';
}
```

### 3. ประวัติการแก้ไข - กรองเฉพาะของตัวเอง
```javascript
// ในฟังก์ชัน loadActivityLog()
if (userRole === 'hotel_owner') {
  logs = logs.filter(log => log.username === currentUser.username);
}
```

### 4. สถิติทั้งหมด - กรองตาม hotelId
```javascript
// ในฟังก์ชัน loadLikesStats()
if (userRole === 'hotel_owner' && userHotelId) {
  stats = stats.filter(stat => stat.hotelId === userHotelId);
}
```

### 5. ระบบสมาชิก - จำกัดฟิลด์แก้ไขได้
```javascript
// ในฟังก์ชัน editMember()
if (userRole === 'hotel_owner') {
  // ซ่อนฟิลด์ role
  roleField.style.display = 'none';
  // ซ่อนฟิลด์ hotelId  
  hotelIdField.style.display = 'none';
  // แสดงเฉพาะ nickname และ password
}
```

---

## ✅ สิทธิ์ที่ไม่กระทบ

### User (role: 'user')
- ✅ ยังคงเห็นเฉพาะเมนู "ระบบสมาชิก"
- ✅ ยังคงเห็นเฉพาะข้อมูลตัวเอง

### Admin (role: 'admin')
- ✅ ยังคงเห็นและจัดการได้ทุกอย่าง
- ✅ Full access ไม่เปลี่ยนแปลง

---

## 📊 ตารางสรุปสิทธิ์

| ฟังก์ชัน | Admin | Hotel Owner | User |
|---------|-------|-------------|------|
| Dashboard | ทั้งหมด | เฉพาะตัวเอง | ❌ |
| โรงแรม - ดู | ทั้งหมด | เฉพาะที่รับผิดชอบ | ❌ |
| โรงแรม - แก้ไข | ✅ | ✅ | ❌ |
| โรงแรม - ลบ | ✅ | ❌ | ❌ |
| โรงแรม - เปิด/ปิด | ✅ | ❌ | ❌ |
| การจัดการ | ✅ | ❌ | ❌ |
| ประวัติการแก้ไข | ทั้งหมด | เฉพาะตัวเอง | ❌ |
| สถิติทั้งหมด | ทั้งหมด | เฉพาะโรงแรมตัวเอง | ❌ |
| สมาชิก - แก้ไขชื่อ/รหัสผ่าน | ✅ | ✅ | ✅ (ตัวเอง) |
| สมาชิก - แก้ไข role | ✅ | ❌ | ❌ |
| สมาชิก - แก้ไข hotelId | ✅ | ❌ | ❌ |

---

## 🎯 ขั้นตอนการ Implement

1. ✅ แก้ไข `applyRolePermissions()` - ซ่อนเมนู "การจัดการ"
2. ⏳ แก้ไข `loadDashboard()` - กรองกิจกรรมล่าสุด
3. ⏳ แก้ไข `displayHotelsTable()` - ซ่อนปุ่มลบและเปิด/ปิด
4. ⏳ แก้ไข `loadActivityLog()` - กรองประวัติ
5. ⏳ แก้ไข `loadLikesStats()` - กรองสถิติ
6. ⏳ แก้ไข `editMember()` - ซ่อนฟิลด์ role และ hotelId

---

**เวอร์ชัน:** 1.0  
**วันที่:** October 10, 2025  
**ผู้พัฒนา:** AI Assistant
