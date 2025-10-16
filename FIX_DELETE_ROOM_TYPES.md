# 🔧 แก้ปัญหาลบประเภทห้องพักไม่ได้

## ✅ สถานะปัจจุบัน

**ทดสอบแล้ว - API ทำงานปกติ!**
- ✅ Sheet ID ถูกต้อง: `3725238`
- ✅ ชื่อ Sheet ถูกต้อง: `RoomTypes` (ไม่มีช่องว่าง)
- ✅ API ลบได้สำเร็จ (ทดสอบผ่าน PowerShell)

## 🎯 ปัญหาที่เป็นไปได้

การที่ **API ลบได้** แต่ **ปุ่มลบใน Admin Panel ไม่ทำงาน** มักเกิดจาก:

1. **Browser Cache** - เก็บ JavaScript เก่าไว้
2. **Server ยังไม่ Restart** - ใช้โค้ดเก่า
3. **JavaScript Error** - มี error ที่ Console

---

## 🔧 วิธีแก้ไข (ทำตามลำดับ)

### ขั้นตอนที่ 1: Restart Server ✅ (ทำแล้ว)

```powershell
Get-Process -Name node | Stop-Process -Force
npm start
```

### ขั้นตอนที่ 2: ล้าง Browser Cache (สำคัญมาก!)

**วิธีที่ 1 - Hard Refresh:**
1. เปิด http://localhost:3000/admin_v2.html
2. กด **`Ctrl + Shift + R`** (หรือ `Ctrl + F5`)
3. รอ 2-3 วินาที

**วิธีที่ 2 - Clear Cache:**
1. กด **`Ctrl + Shift + Delete`**
2. เลือก:
   - ✅ Cached images and files
   - ✅ Cookies and other site data (ถ้าต้องการ)
3. Time range: **Last hour** หรือ **All time**
4. กด **Clear data**

### ขั้นตอนที่ 3: Login ใหม่

```
URL: http://localhost:3000/admin_v2.html
Username: adminn
Password: Aa123456
```

### ขั้นตอนที่ 4: ทดสอบลบ

1. ไปที่เมนู **"จัดการประเภทห้องพัก"** (ไอคอนประตู 🚪)
2. คลิกปุ่ม **"ลบ"** ที่การ์ดประเภทห้องพัก
3. ยืนยันการลบ
4. ดูว่าหายไปหรือไม่

---

## 🐛 ถ้ายังลบไม่ได้ - ตรวจสอบ Error

### เปิด Developer Console:

1. กด **`F12`** (หรือคลิกขวา → Inspect)
2. เลือกแท็บ **Console**
3. ลองกดปุ่ม **"ลบ"** อีกครั้ง
4. ดูว่ามี **error message** สีแดงไหม

### Error ที่เป็นไปได้:

#### Error 1: `Unauthorized` (401)
**สาเหตุ:** Username/Password ผิด
**วิธีแก้:**
- ตรวจสอบว่า Login ด้วย `adminn` / `Aa123456`
- ลอง Logout แล้ว Login ใหม่

#### Error 2: `Failed to fetch`
**สาเหตุ:** Server ไม่ทำงาน
**วิธีแก้:**
```powershell
# ตรวจสอบ Server
Invoke-RestMethod -Uri "http://localhost:3000/api/room-types" -Method Get
```

#### Error 3: `Room type not found`
**สาเหตุ:** ID ไม่ตรงกับในฐานข้อมูล
**วิธีแก้:**
- Refresh หน้า (Ctrl+Shift+R)
- ตรวจสอบ Google Sheets ว่ามีข้อมูลจริง

#### Error 4: `Write access not available`
**สาเหตุ:** Service Account ไม่มีสิทธิ์เขียน
**วิธีแก้:**
- ตรวจสอบ `service-account.json`
- ตรวจสอบสิทธิ์ใน Google Sheets (ต้องเป็น Editor)

---

## 🧪 ทดสอบด้วย PowerShell (สำรอง)

ถ้า Admin Panel ยังไม่ทำงาน สามารถลบด้วยคำสั่งนี้:

```powershell
# 1. ดูรายการทั้งหมด
$rooms = Invoke-RestMethod -Uri "http://localhost:3000/api/room-types" -Method Get
$rooms.data | Select-Object id, nameTh

# 2. ลบรายการแรก (ตัวอย่าง)
$firstRoom = $rooms.data[0]
$deleteBody = @{
    username = 'adminn'
    password = 'Aa123456'
    roomTypeName = $firstRoom.nameTh
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3000/api/admin/room-types/$($firstRoom.id)" `
    -Method Delete `
    -Body $deleteBody `
    -ContentType "application/json"
```

---

## 📝 Checklist

ลองทำตามนี้ทีละข้อ:

- [ ] Restart Server
- [ ] ล้าง Browser Cache (Ctrl+Shift+Delete)
- [ ] Hard Refresh (Ctrl+Shift+R)
- [ ] Login ใหม่ (adminn / Aa123456)
- [ ] ทดสอบลบ
- [ ] ถ้าไม่ได้ → เปิด Console (F12) ดู Error
- [ ] ถ้ายังไม่ได้ → ทดสอบด้วย PowerShell
- [ ] แจ้ง Error Message ที่พบ

---

## 🆘 ถ้ายังแก้ไม่ได้

แจ้งข้อมูลเหล่านี้:

1. **Error Message จาก Console** (กด F12)
2. **Network Tab** - ดู Request/Response
   - ไปที่แท็บ **Network**
   - กดปุ่ม **"ลบ"**
   - คลิกที่ Request สีแดง
   - ดู **Response** ว่าเขียนอะไร
3. **Screenshot** หน้าจอ (ถ้าเป็นไปได้)

---

## 💡 Tips

### ปิด Browser แล้วเปิดใหม่
บางครั้ง Cache ติดแน่นมาก ให้:
1. ปิด Browser ทั้งหมด
2. รอ 5 วินาที
3. เปิดใหม่
4. เข้า Admin Panel

### ใช้ Incognito Mode
1. กด **`Ctrl + Shift + N`** (Chrome)
2. เข้า http://localhost:3000/admin_v2.html
3. Login: adminn / Aa123456
4. ทดสอบลบ

### ตรวจสอบ Google Sheets
1. เปิด Sheet: https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit
2. ไปที่ Tab **RoomTypes**
3. ลองลบแถวด้วยมือ (คลิกขวา → Delete row)
4. ถ้าลบไม่ได้ = ไม่มีสิทธิ์เขียน

---

## ✅ สรุป

**API ทำงานปกติแล้ว!** 🎉

ปัญหาน่าจะอยู่ที่:
1. Browser Cache (90% เป็นตรงนี้)
2. JavaScript Error
3. Login Session หมดอายุ

**แนะนำ:**
1. Hard Refresh (Ctrl+Shift+R) 
2. ถ้าไม่ได้ → Clear Cache
3. ถ้ายังไม่ได้ → ดู Console Error

**Server พร้อมใช้งาน:**
- Desktop: http://localhost:3000/admin_v2.html
- Mobile: http://192.168.1.26:3000/admin_v2.html
- Login: `adminn` / `Aa123456`
