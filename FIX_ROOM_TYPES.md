# 🔧 แก้ปัญหาระบบประเภทห้องพัก

## ✅ สาเหตุที่ไม่ทำงาน

1. **ชื่อ Sheet ผิด**: ใน Google Sheets มีชื่อ `RoomTypes ` (มีช่องว่างต่อท้าย) ❌
2. **Sheet ID ยังไม่อัพเดท**: แก้ไขเรียบร้อยแล้ว ✅

---

## 📝 วิธีแก้ไข (ทำเลย!)

### ขั้นตอนที่ 1: เปิด Google Sheets
```
https://docs.google.com/spreadsheets/d/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/edit
```

### ขั้นตอนที่ 2: แก้ชื่อ Sheet
1. มองหา Tab ชื่อ **"RoomTypes "** (มีช่องว่างต่อท้าย)
2. **คลิกขวา** ที่ Tab นั้น
3. เลือก **"Rename"** (เปลี่ยนชื่อ)
4. พิมพ์ชื่อใหม่: **`RoomTypes`** (ไม่มีช่องว่างหน้าหรือหลัง)
5. กด **Enter** บันทึก

### ขั้นตอนที่ 3: ตรวจสอบข้อมูลใน Sheet

ตรวจสอบว่ามี **Header ครบ 6 คอลัมน์**:

| A  | B       | C       | D    | E       | F     |
|----|---------|---------|------|---------|-------|
| id | nameTh  | nameEn  | icon | enabled | color |

ถ้ายังไม่มีข้อมูล ให้ใส่ตัวอย่างนี้:

| id       | nameTh        | nameEn       | icon      | enabled | color   |
|----------|---------------|--------------|-----------|---------|---------|
| standard | ห้องมาตรฐาน   | Standard Room | fa-bed    | TRUE    | #667eea |
| deluxe   | ห้องดีลักซ์    | Deluxe Room  | fa-star   | TRUE    | #f093fb |
| suite    | ห้องสวีท      | Suite        | fa-crown  | TRUE    | #4facfe |
| villa    | วิลล่า        | Villa        | fa-home   | TRUE    | #43e97b |

---

## 🔄 ขั้นตอนที่ 4: Restart Server

หลังแก้ไขชื่อ Sheet เสร็จแล้ว ให้รัน:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
npm start
```

---

## ✅ ทดสอบระบบ

1. เข้า Admin Panel: http://localhost:3000/admin_v2.html
2. Login: `adminn` / `Aa123456`
3. คลิกเมนู **"ประเภทห้องพัก"** (ไอคอนประตู 🚪)
4. ดูว่ามีข้อมูลแสดงหรือไม่

---

## 🆘 ถ้ายังไม่ทำงาน

ลองทดสอบ API ด้วยคำสั่งนี้:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/room-types" -Method Get | ConvertTo-Json
```

**ผลลัพธ์ที่ถูกต้อง:**
```json
{
  "success": true,
  "data": [
    {
      "id": "standard",
      "nameTh": "ห้องมาตรฐาน",
      "nameEn": "Standard Room",
      "icon": "fa-bed",
      "enabled": "TRUE",
      "color": "#667eea"
    }
  ]
}
```

---

## 📚 เอกสารเพิ่มเติม

- **QUICK_START_ROOM_TYPES.md** - คู่มือเริ่มต้นแบบรวดเร็ว
- **ROOM_TYPES_SETUP.md** - คู่มือฉบับเต็ม
- **GOOGLE_SHEETS_ROOM_TYPES.md** - โครงสร้าง Google Sheets

---

## 💡 หมายเหตุ

✅ **ตอนนี้แก้ไข Sheet ID เรียบร้อยแล้ว**: `3725238`  
⏳ **เหลือเพียง**: แก้ชื่อ Sheet ให้ถูกต้อง + Restart Server  
🎯 **ใช้เวลา**: ไม่ถึง 3 นาที
