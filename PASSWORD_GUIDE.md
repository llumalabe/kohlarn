# 🔐 คู่มือรหัสผ่านแอดมิน

## รหัสผ่านที่ใช้ได้

### 1. รหัสชั่วคราว (สำหรับทดสอบ) ⚡

**รหัส:** `123456`

**คุณสมบัติ:**
- ✅ ใช้ทดสอบระบบได้ทันที
- ✅ ไม่ต้องตั้งค่า Google Sheets
- ✅ ใช้ได้ฟีเจอร์ครบทุกอย่าง
- ✅ แสดงคำเตือนเมื่อเข้าสู่ระบบ
- ⚠️ ไม่แนะนำสำหรับการใช้งานจริง

**การใช้งาน:**
1. ไปที่ http://localhost:3000/admin
2. ใส่รหัส: `123456`
3. คลิก "เข้าสู่ระบบ"
4. จะเห็นข้อความเตือนสีเหลือง

---

### 2. รหัสจาก Google Sheets (สำหรับใช้งานจริง) 🔒

**ตั้งค่า:**
1. เปิด Google Sheet
2. ไปที่ Sheet "Admin"
3. ใส่รหัสผ่านใน cell B2
4. บันทึก

**ตัวอย่าง:**
```
A1: username  | B1: password
A2: admin     | B2: MySecurePassword2024!
```

**คุณสมบัติ:**
- ✅ ปลอดภัยกว่า
- ✅ เปลี่ยนได้ง่าย
- ✅ ไม่ต้องแก้โค้ด
- ✅ แนะนำสำหรับการใช้งานจริง

---

## 🔧 วิธีลบรหัสชั่วคราว

### ขั้นตอนที่ 1: เปิดไฟล์

เปิดไฟล์: `services/googleSheets.js`

### ขั้นตอนที่ 2: หา Function validateAdminPassword

ค้นหาโค้ดนี้ (ประมาณบรรทัดที่ 40-60):

```javascript
/**
 * Validate admin password (includes temporary password)
 */
async function validateAdminPassword(inputPassword) {
  // Temporary password for testing
  const TEMP_PASSWORD = '123456';
  
  // Check temporary password first
  if (inputPassword === TEMP_PASSWORD) {
    return { 
      valid: true, 
      isTemporary: true,
      message: '⚠️ คุณกำลังใช้รหัสชั่วคราวสำหรับทดสอบระบบ'
    };
  }
  
  // ... rest of the code
}
```

### ขั้นตอนที่ 3: ลบหรือ Comment โค้ด

**วิธีที่ 1: ลบทิ้ง**
```javascript
async function validateAdminPassword(inputPassword) {
  // เอาส่วน temporary password ออก
  
  // Check Google Sheets password
  const actualPassword = await getAdminPassword();
  if (inputPassword === actualPassword) {
    return { 
      valid: true, 
      isTemporary: false,
      message: '✅ เข้าสู่ระบบสำเร็จ'
    };
  }
  
  return { 
    valid: false, 
    isTemporary: false,
    message: '❌ รหัสผ่านไม่ถูกต้อง'
  };
}
```

**วิธีที่ 2: Comment ไว้ (สำหรับใช้ภายหลัง)**
```javascript
async function validateAdminPassword(inputPassword) {
  // Temporary password for testing - DISABLED
  // const TEMP_PASSWORD = '123456';
  
  // if (inputPassword === TEMP_PASSWORD) {
  //   return { 
  //     valid: true, 
  //     isTemporary: true,
  //     message: '⚠️ คุณกำลังใช้รหัสชั่วคราวสำหรับทดสอบระบบ'
  //   };
  // }
  
  // Check Google Sheets password
  const actualPassword = await getAdminPassword();
  // ... rest of the code
}
```

### ขั้นตอนที่ 4: Restart Server

```bash
# หยุด server (Ctrl+C)
# เริ่มใหม่
npm start
```

---

## 🔄 วิธีเปลี่ยนรหัสชั่วคราว

### แก้ไขรหัส 123456 เป็นอย่างอื่น

เปิดไฟล์: `services/googleSheets.js`

แก้ไขบรรทัดนี้:
```javascript
// เดิม
const TEMP_PASSWORD = '123456';

// เปลี่ยนเป็น
const TEMP_PASSWORD = 'YourNewPassword';
```

บันทึกและ restart server

---

## 📋 คำถามที่พบบ่อย

### Q: รหัสชั่วคราวปลอดภัยหรือไม่?
**A:** ไม่แนะนำสำหรับใช้งานจริง ใช้เฉพาะการทดสอบบน localhost เท่านั้น

### Q: ถ้าลืมรหัส Google Sheets?
**A:** 
1. ใช้รหัสชั่วคราว `123456` เข้าระบบ
2. ไปแก้ไขรหัสใน Google Sheet
3. ออกจากระบบและเข้าใหม่ด้วยรหัสที่แก้ไข

### Q: รหัส Google Sheets ไม่ทำงาน?
**A:** ตรวจสอบ:
- มี Sheet ชื่อ "Admin" หรือไม่
- รหัสอยู่ใน cell B2 หรือไม่
- Google Sheet ถูกแชร์และ API Key ถูกต้องหรือไม่
- ลองใช้รหัสชั่วคราวเพื่อเข้าระบบทดสอบ

### Q: ต้องการรหัสชั่วคราวหลายตัว?
**A:** แก้ไขโค้ดใน `validateAdminPassword()`:

```javascript
const TEMP_PASSWORDS = ['123456', 'test123', 'demo'];

if (TEMP_PASSWORDS.includes(inputPassword)) {
  return { 
    valid: true, 
    isTemporary: true,
    message: '⚠️ คุณกำลังใช้รหัสชั่วคราวสำหรับทดสอบระบบ'
  };
}
```

---

## 🎯 Best Practices

### สำหรับการพัฒนา (Development)
- ✅ ใช้รหัสชั่วคราว `123456`
- ✅ เปิดบน localhost เท่านั้น
- ⚠️ ไม่ต้องตั้งค่า Google Sheets

### สำหรับการใช้งานจริง (Production)
- ✅ ลบรหัสชั่วคราวออก
- ✅ ใช้รหัสจาก Google Sheets
- ✅ ตั้งรหัสที่ซับซ้อน (ตัวพิมพ์ใหญ่-เล็ก, ตัวเลข, สัญลักษณ์)
- ✅ เปลี่ยนรหัสเป็นประจำ

### ตัวอย่างรหัสที่แข็งแรง
```
KohLarn2024!Secure
Hotel@Pattaya#2024
MyAdm!nP@ssw0rd2024
```

---

## 📝 สรุป

| รหัส | ใช้เมื่อ | ความปลอดภัย | ตั้งค่า |
|------|---------|------------|---------|
| `123456` | ทดสอบระบบ | ⚠️ ต่ำ | ไม่ต้อง |
| Google Sheets | ใช้งานจริง | ✅ สูง | ง่าย |

**คำแนะนำ:**
- 🧪 **ทดสอบ:** ใช้ `123456`
- 🚀 **Production:** ใช้ Google Sheets
- 🔒 **ปลอดภัย:** ลบรหัสชั่วคราว + ใช้รหัสแข็งแรง

---

**เริ่มใช้งานได้เลย! 🎉**
