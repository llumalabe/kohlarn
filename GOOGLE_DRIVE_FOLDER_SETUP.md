# 🔧 Google Drive Folder Setup Guide

## ⚠️ ปัญหา: Service Accounts do not have storage quota

Service Account ไม่สามารถสร้างไฟล์ใน Drive ของตัวเองได้ เพราะไม่มี storage quota  
**วิธีแก้:** ใช้ folder จาก Google Drive ของคุณแล้ว share ให้กับ Service Account

---

## 📋 ขั้นตอนการแก้ไข (5 นาที)

### 1. หา Service Account Email
รันคำสั่งนี้ใน terminal:
```bash
node -e "const sa = require('./service-account.json'); console.log('Service Account Email:', sa.client_email);"
```

คัดลอก email ที่ได้ (จะเป็นรูปแบบ: `xxx@xxx.iam.gserviceaccount.com`)

---

### 2. สร้าง Folder ใน Google Drive ของคุณ

1. เปิด [Google Drive](https://drive.google.com)
2. คลิก **New** → **Folder**
3. ตั้งชื่อ: `Kohlarn Hotel Images` (หรือชื่ออื่นก็ได้)
4. คลิก **Create**

---

### 3. Share Folder กับ Service Account

1. **คลิกขวา** ที่ folder ที่สร้าง → เลือก **Share**
2. ใน **Add people and groups**:
   - วาง Service Account Email ที่คัดลอกไว้
   - เลือกสิทธิ์: **Editor** (ต้องเป็น Editor ไม่ใช่ Viewer)
3. **ปิด Notification**: คลิก ⚙️ (Settings) → **ยกเลิกติ๊ก** "Notify people"
4. คลิก **Share**

---

### 4. คัดลอก Folder ID

1. เปิด folder ที่สร้างใน Google Drive
2. ดู URL ใน address bar:
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          นี่คือ FOLDER ID
   ```
3. คัดลอก FOLDER ID (ส่วนหลัง `/folders/`)

---

### 5. เพิ่มใน .env

แก้ไขไฟล์ `.env` เพิ่มบรรทัดนี้:

```env
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
```

แทนที่ `1AbCdEfGhIjKlMnOpQrStUvWxYz` ด้วย FOLDER ID ที่คัดลอกไว้

---

### 6. เพิ่มใน Vercel (สำหรับ Production)

1. ไป [Vercel Dashboard](https://vercel.com)
2. เลือก project **kohlarn**
3. ไปที่ **Settings** → **Environment Variables**
4. คลิก **Add New**
5. เพิ่ม:
   - **Key**: `GOOGLE_DRIVE_FOLDER_ID`
   - **Value**: `1AbCdEfGhIjKlMnOpQrStUvWxYz` (Folder ID ของคุณ)
   - **Environment**: เลือกทั้ง 3 (Production, Preview, Development)
6. คลิก **Save**
7. **Redeploy** project (Settings → Deployments → คลิก ... → Redeploy)

---

## ✅ ทดสอบ

หลังจาก restart server (local) หรือ redeploy (Vercel):

1. เข้า Admin Panel
2. ลองอัพโหลดรูปโรงแรม
3. ถ้าสำเร็จจะเห็น:
   ```
   ✅ Using shared folder: Kohlarn Hotel Images (FOLDER_ID)
   ✅ Uploaded image to Google Drive
   ```

---

## 🔍 Troubleshooting

### ❌ "Cannot access folder FOLDER_ID"
**สาเหตุ:** Service Account ยังไม่มีสิทธิ์เข้าถึง folder

**แก้ไข:**
1. ตรวจสอบว่า share folder ถูกต้องหรือไม่
2. ให้สิทธิ์เป็น **Editor** (ไม่ใช่ Viewer)
3. รอสัก 1-2 นาทีแล้วลองใหม่

### ❌ "GOOGLE_DRIVE_FOLDER_ID not configured"
**สาเหตุ:** ยังไม่ได้เพิ่ม FOLDER_ID ใน .env

**แก้ไข:**
1. ทำตามขั้นตอนที่ 4-6
2. Restart server

### ✅ วิธีตรวจสอบว่า Service Account มีสิทธิ์หรือไม่:
```bash
# Local
npm start

# ถ้าเห็นข้อความนี้ = สำเร็จ
✅ Using shared folder: Kohlarn Hotel Images (FOLDER_ID)
```

---

## 📊 โครงสร้าง Folder

หลังจาก setup เสร็จ Google Drive จะมีโครงสร้างแบบนี้:

```
📁 Kohlarn Hotel Images (YOUR FOLDER - shared with Service Account)
  ├── 📁 001 - โรงแรม A
  │   ├── 🖼️ hotel-001-1729680000000.jpg
  │   └── 🖼️ hotel-001-1729680123456.jpg
  ├── 📁 002 - โรงแรม B
  │   └── 🖼️ hotel-002-1729680234567.jpg
  └── 📁 003 - เดอะไลท์เฮ้าส์รีสอร์ท เกาะล้าน
      └── 🖼️ hotel-003-1729680345678.jpg
```

- **Main folder** = ที่คุณสร้างและ share
- **Sub-folders** = ระบบสร้างอัตโนมัติสำหรับแต่ละโรงแรม
- **Images** = มี timestamp ไม่ซ้ำกัน

---

## 💡 Tips

1. **ไม่ต้องกังวลเรื่อง quota** - ใช้ quota ของ Google Drive ของคุณ (15 GB ฟรี)
2. **สามารถดูรูปใน Drive ได้** - เข้า folder ปกติเหมือน Drive ทั่วไป
3. **ลบรูปเก่าได้** - ลบใน Drive ได้เลย ระบบจะไม่หา
4. **Backup ง่าย** - Download folder ทั้งหมดได้จาก Google Drive

---

## 🎯 สรุป

| ขั้นตอน | ใช้เวลา |
|---------|---------|
| 1. หา Service Account Email | 30 วิ |
| 2. สร้าง Folder | 30 วิ |
| 3. Share กับ Service Account | 1 นาที |
| 4. คัดลอก Folder ID | 30 วิ |
| 5. เพิ่มใน .env | 1 นาที |
| 6. Deploy Vercel | 2 นาที |
| **รวม** | **~5 นาที** |

---

## 📞 ต้องการความช่วยเหลือ?

ถ้ายังมีปัญหา:
1. เช็ค console logs
2. ดู error message ใน Admin Panel
3. ตรวจสอบว่า Service Account Email ถูกต้อง
4. ลอง revoke permission แล้ว share ใหม่
