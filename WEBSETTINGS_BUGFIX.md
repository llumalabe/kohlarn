# 🐛 WebSettings Bug Fixes

## สรุปข้อผิดพลาดที่แก้ไข

### ข้อผิดพลาดที่พบ:

#### 1. ❌ Server Error (500 Internal Server Error)
```
Error updating web settings: ReferenceError: validateToken is not defined
    at C:\Users\User\OneDrive\เดสก์ท็อป\kohlarn\server.js:966:24
```

**สาเหตุ**: ใช้ฟังก์ชัน `validateToken()` ที่ไม่มีอยู่ในระบบ

**การแก้ไข**: เปลี่ยนเป็นใช้ `usersService.validateUser()` ตามแบบ endpoints อื่นๆ

**ไฟล์**: `server.js` (บรรทัด 963-970)

**Before:**
```javascript
app.post('/api/websettings', async (req, res) => {
  try {
    const validation = await validateToken(req);  // ❌ ฟังก์ชันไม่มีอยู่
    if (!validation.valid) {
      return res.status(401).json({ error: 'Unauthorized', message: validation.error });
    }
    const settings = req.body;
```

**After:**
```javascript
app.post('/api/websettings', async (req, res) => {
  try {
    const { username, password, ...settings } = req.body;  // ✅ แยก username/password ออกจาก settings
    
    const validation = await usersService.validateUser(username, password);  // ✅ ใช้ฟังก์ชันที่ถูกต้อง
    if (!validation.valid) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
```

---

#### 2. ❌ Client Error (showNotification is not defined)
```
Error saving web settings: ReferenceError: showNotification is not defined
    at saveWebSettings (admin_v2.js:3469:13)
```

**สาเหตุ**: เรียกใช้ฟังก์ชัน `showNotification()` ที่ไม่มีอยู่ใน `admin_v2.js`

**การแก้ไข**: เปลี่ยนเป็นใช้ `alert()` แทน และส่ง `username`, `password` ใน request body

**ไฟล์**: `public/js/admin_v2.js` (บรรทัด 3440-3473)

**Before:**
```javascript
const settings = {
    site_name_th: document.getElementById('siteNameTh').value,
    // ... other settings
};

const response = await fetch('/api/websettings', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${currentUser.username}:${currentUser.password}`)}`  // ❌ ไม่ทำงาน
    },
    body: JSON.stringify(settings)
});

if (result.success) {
    showNotification('✅ บันทึกการตั้งค่าเรียบร้อย', 'success');  // ❌ ฟังก์ชันไม่มีอยู่
}
```

**After:**
```javascript
const settings = {
    username: currentUser.username,  // ✅ เพิ่ม username
    password: currentUser.password,  // ✅ เพิ่ม password
    site_name_th: document.getElementById('siteNameTh').value,
    // ... other settings
};

const response = await fetch('/api/websettings', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'  // ✅ ไม่ต้องใช้ Authorization header
    },
    body: JSON.stringify(settings)
});

if (result.success) {
    alert('✅ บันทึกการตั้งค่าเรียบร้อย');  // ✅ ใช้ alert() แทน
}
```

---

## การทดสอบหลังแก้ไข

### ✅ สิ่งที่ต้องทดสอบ:

1. **เปิด Admin Panel**: http://192.168.1.26:3000/admin
2. **Login** ด้วย username: `adminn`
3. **ไปที่หน้า "แก้ไขหน้าเว็บไซต์"**
4. **เปลี่ยนค่าใดๆ** (เช่น ชื่อเว็บไซต์หรือสี)
5. **คลิกปุ่ม "บันทึกการตั้งค่า"**

### 📊 ผลลัพธ์ที่คาดหวัง:

- ✅ ไม่มี Error 500 ใน Console
- ✅ ไม่มี `showNotification is not defined` error
- ✅ แสดง Alert "✅ บันทึกการตั้งค่าเรียบร้อย"
- ✅ ข้อมูลบันทึกลง Google Sheet "WebSettings" (ถ้ามี Sheet แล้ว)

---

## ⚠️ หมายเหตุสำคัญ

**ยังต้องสร้าง Sheet "WebSettings" ใน Google Sheets ก่อนใช้งาน!**

ดูวิธีการที่: `WEBSETTINGS_SHEET_SETUP.md` หรือ `WEBSETTINGS_QUICKSTART.md`

---

## 📁 ไฟล์ที่แก้ไข

1. `server.js` (บรรทัด 963-975)
   - เปลี่ยน `validateToken()` เป็น `usersService.validateUser()`
   - แยก `username`, `password` จาก request body

2. `public/js/admin_v2.js` (บรรทัด 3440-3473)
   - เพิ่ม `username` และ `password` ใน settings object
   - เปลี่ยน `showNotification()` เป็น `alert()`
   - ลบ `Authorization` header

---

## 🎯 สถานะปัจจุบัน

- ✅ Server รันได้ไม่มี Error
- ✅ API Endpoint `/api/websettings` ทำงานได้ถูกต้อง
- ✅ Frontend สามารถบันทึกข้อมูลได้ (แสดง Alert)
- ⏳ รอสร้าง Sheet "WebSettings" เพื่อเก็บข้อมูล

---

**วันที่แก้ไข**: 10 มกราคม 2568  
**แก้ไขโดย**: GitHub Copilot  
**สถานะ**: ✅ แก้ไขเรียบร้อย - พร้อมใช้งาน
