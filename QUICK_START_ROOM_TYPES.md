# 🚀 Quick Start - ตั้งค่าประเภทห้องพัก

## ⚡ ขั้นตอนรวดเร็ว (5 นาที)

### 1. สร้าง Sheet ใน Google Sheets

เปิด Google Sheets แล้วทำตามนี้:

1. **คลิกปุ่ม +** (ด้านล่างซ้าย) สร้าง Sheet ใหม่
2. **ตั้งชื่อ:** `RoomTypes` (ต้องตรงทุกตัว!)
3. **ใส่หัวตาราง** (แถวที่ 1):
   ```
   A1: id
   B1: nameTh  
   C1: nameEn
   D1: icon
   E1: enabled
   F1: color
   ```

---

### 2. ใส่ข้อมูลตัวอย่าง (คัดลอกทั้งหมด)

**แถว 2:**
```
standard | ห้องธรรมดา | Standard Room | fa-bed | true | #667eea
```

**แถว 3:**
```
deluxe | ห้องดีลักซ์ | Deluxe Room | fa-star | true | #f093fb
```

**แถว 4:**
```
suite | ห้องสวีท | Suite | fa-crown | true | #4facfe
```

**แถว 5:**
```
villa | วิลล่า | Villa | fa-home | true | #43e97b
```

**แถว 6:**
```
bungalow | บังกะโล | Bungalow | fa-tree | true | #fa709a
```

**แถว 7:**
```
familyRoom | ห้องครอบครัว | Family Room | fa-users | true | #30cfd0
```

**แถว 8:**
```
dormitory | ห้องรวม/ดอร์ม | Dormitory | fa-bed-bunk | true | #a8edea
```

💡 **Tip:** ใช้ | (Pipe) แทนการกด Tab เพื่อย้ายไปคอลัมน์ถัดไป

---

### 3. หา Sheet ID (สำหรับการลบข้อมูล)

1. **คลิกขวา** ที่ Tab `RoomTypes`
2. **เลือก** "Copy link to this sheet"
3. **Paste** ลิงก์ จะเห็น: `https://...#gid=123456789`
4. **คัดลอก** ตัวเลขหลัง `gid=` (เช่น `123456789`)

---

### 4. แก้ไข Sheet ID ในโค้ด

1. **เปิดไฟล์:** `services/roomTypes.js`
2. **หาบรรทัดที่ 190** (ค้นหา `sheetId: 0`)
3. **แก้ไขเป็น:**
   ```javascript
   sheetId: 123456789, // RoomTypes sheet ID (ใส่ตัวเลขที่คัดลอกมา)
   ```

---

### 5. Restart Server

รันคำสั่งนี้ใน PowerShell:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\User\OneDrive\เดสก์ท็อป\kohlarn'; npm start"
```

---

## ✅ ทดสอบระบบ

1. เข้า Admin Panel: `http://localhost:3000/admin_v2.html`
2. Login: `adminn` / `Aa123456`
3. คลิกเมนู **"ประเภทห้องพัก"** (ไอคอนประตู 🚪)
4. จะเห็นประเภทห้องพัก 7 รายการที่เพิ่มไว้

---

## 📊 โครงสร้าง Sheet (สรุป)

| คอลัมน์ | ชื่อ | ตัวอย่าง | หมายเหตุ |
|---------|------|----------|----------|
| **A** | id | `standard` | รหัสภาษาอังกฤษ |
| **B** | nameTh | `ห้องธรรมดา` | ชื่อไทย |
| **C** | nameEn | `Standard Room` | ชื่ออังกฤษ |
| **D** | icon | `fa-bed` | ไอคอน Font Awesome |
| **E** | enabled | `true` | เปิด/ปิด |
| **F** | color | `#667eea` | สี HEX |

---

## 🎨 ไอคอนแนะนำ

```
fa-bed          - เตียง
fa-star         - ดาว
fa-crown        - มงกุฎ
fa-home         - บ้าน
fa-tree         - ต้นไม้
fa-users        - กลุ่มคน
fa-bed-bunk     - เตียง 2 ชั้น
fa-door-open    - ประตูเปิด
fa-gem          - เพชร
fa-award        - รางวัล
```

ดูเพิ่มเติม: https://fontawesome.com/icons

---

## 🎨 สีแนะนำ

```
#667eea  - ม่วง
#f093fb  - ชมพู
#4facfe  - ฟ้า
#43e97b  - เขียว
#fa709a  - ชมพูเข้ม
#30cfd0  - น้ำเงินอ่อน
#a8edea  - เขียวอ่อน
#ffa502  - ส้ม
#ff6b6b  - แดง
#48dbfb  - ฟ้าอ่อน
```

---

## ❓ แก้ปัญหาเร็ว

### ไม่เห็นเมนู "ประเภทห้องพัก"
👉 กด `Ctrl+Shift+R` (Hard Refresh)

### Error: "Failed to get room types"
👉 ตรวจสอบชื่อ Sheet ว่าเป็น `RoomTypes` (ตรงทุกตัว)

### ลบข้อมูลไม่ได้
👉 ตรวจสอบ Sheet ID ในไฟล์ `services/roomTypes.js`

### สีไม่แสดง
👉 ต้องขึ้นต้นด้วย `#` และมี 6 ตัว (เช่น `#FF5733`)

### ไอคอนไม่แสดง
👉 ต้องขึ้นต้นด้วย `fa-` (เช่น `fa-bed`)

---

## 📚 เอกสารเพิ่มเติม

- **ROOM_TYPES_SETUP.md** - คู่มือฉบับเต็ม
- **GOOGLE_SHEETS_SETUP_GUIDE.md** - คู่มือ Google Sheets
- **ACTUAL_GOOGLE_SHEETS_STRUCTURE.md** - โครงสร้างทั้งหมด

---

## 🎯 ขั้นต่อไป

หลังตั้งค่าเสร็จ คุณสามารถ:

✅ จัดการประเภทห้องพักใน Admin Panel  
✅ เพิ่มประเภทห้องพักใหม่ได้เอง  
✅ เลือกประเภทห้องเมื่อเพิ่ม/แก้ไขโรงแรม  
✅ แสดงผลบนหน้าเว็บด้วยสีและไอคอนสวยงาม  

**Happy Coding! 💻🎉**
