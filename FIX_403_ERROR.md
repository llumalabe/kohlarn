# 🔧 แก้ไข Error 403 Forbidden

## ปัญหา: Google Sheets API Error 403

### สาเหตุที่พบ:
```
Error: (403) Forbidden
Message: Method doesn't allow unregistered callers
```

---

## ✅ วิธีแก้ไข (ทำตามลำดับ)

### 1️⃣ ตรวจสอบว่า Google Sheets แชร์เป็น Public

1. **เปิด Google Sheets** ที่คุณสร้าง
2. **คลิกปุ่ม "Share"** (มุมขวาบน)
3. ดูว่าตรง **"General access"** เป็นอะไร:
   
   ❌ **ผิด:** "Restricted" (เฉพาะคนที่เชิญเท่านั้น)
   
   ✅ **ถูกต้อง:** "Anyone with the link" (ใครมี link ก็เข้าได้)

4. **ถ้ายังไม่ได้แชร์:**
   - คลิก "Restricted"
   - เปลี่ยนเป็น **"Anyone with the link"**
   - Role: **"Viewer"** (ให้ดูอย่างเดียว)
   - คลิก **"Done"**

---

### 2️⃣ ตรวจสอบ API Key Restrictions

1. **เปิด [Google Cloud Console](https://console.cloud.google.com)**
2. ไปที่ **"APIs & Services"** → **"Credentials"**
3. **คลิกที่ API Key ของคุณ** (จะเห็น key ที่ขึ้นต้นด้วย AIzaSy...)
4. ตรวจสอบ **"Application restrictions"**:

   **วิธีที่ 1: ไม่จำกัด (เพื่อทดสอบ)**
   - เลือก **"None"**
   - คลิก **"SAVE"**
   
   **วิธีที่ 2: จำกัดเฉพาะ IP/Domain (ปลอดภัยกว่า)**
   - เลือก **"HTTP referrers (websites)"**
   - เพิ่ม referrers:
     ```
     http://192.168.1.26:3000/*
     http://localhost:3000/*
     ```
   - คลิก **"SAVE"**

5. ตรวจสอบ **"API restrictions"**:
   - เลือก **"Restrict key"**
   - เลือกเฉพาะ **"Google Sheets API"**
   - คลิก **"SAVE"**

---

### 3️⃣ รอให้ API Key Activate

**สำคัญ:** หลังสร้าง API Key ใหม่ หรือแก้ไข restrictions:
- ต้องรอ **1-5 นาที** ให้ระบบอัพเดท
- บางครั้งอาจนานถึง **10 นาที**

---

### 4️⃣ ทดสอบ API Key

**เปิด PowerShell แล้วพิมพ์:**

```powershell
# ทดสอบ API Key (แทน YOUR_API_KEY ด้วย API Key จริง)
curl "https://sheets.googleapis.com/v4/spreadsheets/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA?key=YOUR_API_KEY"
```

**ผลลัพธ์ที่ถูกต้อง:**
```json
{
  "spreadsheetId": "1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA",
  "properties": {
    "title": "Koh Larn Hotels Database",
    ...
  }
}
```

**ถ้ายัง Error 403:**
- รอ 2-3 นาที แล้วลองใหม่
- ตรวจสอบว่าแชร์ Sheets เป็น Public แล้ว
- ตรวจสอบว่า API restrictions ตั้งค่าถูกต้อง

---

### 5️⃣ ตรวจสอบไฟล์ .env

เปิดไฟล์ `.env` แล้วตรวจสอบ:

```env
# ต้องไม่มีช่องว่างหรือเครื่องหมายพิเศษ
GOOGLE_SHEET_ID=1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA
GOOGLE_API_KEY=AIzaSyAk0B-Zxx6F5adbq_faIpC308-KygHwo6E
PORT=3000
```

**ตรวจสอบ:**
- ✅ ไม่มีช่องว่างก่อนหรือหลัง `=`
- ✅ ไม่มี quote `"` หรือ `'`
- ✅ API Key ถูกต้อง (ไม่มีช่องว่างคั่น)
- ✅ Spreadsheet ID ถูกต้อง (44 ตัวอักษร)

---

### 6️⃣ Restart Server

```powershell
# หยุด server เก่า
Get-Process -Name node | Stop-Process -Force

# เริ่มใหม่
npm start
```

---

## 🐛 วิธีแก้ไขเฉพาะจุด

### ปัญหา: API Key มีช่องว่าง

จากคำสั่งที่คุณรัน:
```powershell
curl "...key=AIzaSy yAk0B-Zxx6F5adbq..."
                  ^ มีช่องว่างตรงนี้!
```

**แก้ไข:**
1. เปิดไฟล์ `.env`
2. ตรวจสอบ `GOOGLE_API_KEY` ว่าไม่มีช่องว่าง
3. ถ้ามีช่องว่าง ให้ลบออก
4. บันทึกไฟล์
5. Restart server

---

## 🎯 Quick Fix (แก้ไขเร็ว)

**ถ้าต้องการให้ทำงานเร็วที่สุด:**

### Option 1: ปิด API Restrictions ชั่วคราว

1. ไปที่ [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. คลิก API Key
3. **Application restrictions**: เลือก **"None"**
4. **API restrictions**: เลือก **"Don't restrict key"**
5. คลิก **"SAVE"**
6. **รอ 2-3 นาที**
7. ลองใหม่

### Option 2: สร้าง API Key ใหม่

1. ไปที่ [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. คลิก **"+ CREATE CREDENTIALS"** → **"API key"**
3. คัดลอก API Key ใหม่
4. **ไม่ต้องตั้งค่า restrictions** (ทดสอบก่อน)
5. แก้ `.env`:
   ```env
   GOOGLE_API_KEY=API_KEY_ใหม่ตรงนี้
   ```
6. Restart server

---

## ✅ Checklist การแก้ไข

ทำตามลำดับ:

- [ ] 1. Google Sheets แชร์เป็น "Anyone with the link - Viewer"
- [ ] 2. API Key ไม่มี restrictions (เพื่อทดสอบ)
- [ ] 3. รอ 2-3 นาที ให้ API Key activate
- [ ] 4. ไฟล์ .env ถูกต้อง (ไม่มีช่องว่าง)
- [ ] 5. ทดสอบด้วย curl
- [ ] 6. Restart server
- [ ] 7. เปิดเว็บทดสอบ

---

## 🧪 คำสั่งทดสอบ

### ทดสอบ 1: Spreadsheet Info
```powershell
curl "https://sheets.googleapis.com/v4/spreadsheets/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA?key=AIzaSyAk0B-Zxx6F5adbq_faIpC308-KygHwo6E"
```

**ควรได้:** JSON ที่มี `spreadsheetId` และ `properties`

### ทดสอบ 2: Read Hotels Data
```powershell
curl "https://sheets.googleapis.com/v4/spreadsheets/1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA/values/Hotels!A2:Z?key=AIzaSyAk0B-Zxx6F5adbq_faIpC308-KygHwo6E"
```

**ควรได้:** JSON ที่มี `values` array

---

## 💡 หมายเหตุ

1. **API Key เป็น Public** - ใช้ได้แค่อ่านข้อมูล (Read-only)
2. **ไม่มีการเขียนข้อมูล** - เว็บจะอ่านอย่างเดียว
3. **ปลอดภัย** - เพราะ Sheet เป็น "Viewer" อยู่แล้ว

---

**ลองทำตาม Checklist แล้วบอกผลลัพธ์ครับ!** 🚀
