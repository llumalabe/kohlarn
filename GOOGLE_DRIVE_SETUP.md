# การตั้งค่า Google Drive สำหรับอัพโหลดรูปภาพโรงแรม

## 🎯 ข้อดีของ Google Drive

✅ **ลบไฟล์เก่าได้** - ระบบจะลบรูปเก่าอัตโนมัติเมื่ออัพโหลดรูปใหม่  
✅ **จัดการโฟลเดอร์ได้** - สร้างโฟลเดอร์แยกสำหรับแต่ละโรงแรม  
✅ **ใช้ Service Account เดียวกัน** - ใช้ Service Account ที่มีอยู่แล้ว  
✅ **ฟรี 15 GB** - Google Drive Free tier  
✅ **ทำงานบน Vercel ได้** - ไม่มีปัญหา read-only file system  
✅ **Public Access** - สามารถเข้าถึงรูปภาพได้จาก URL  

## 📁 โครงสร้างโฟลเดอร์

```
Google Drive/
└── Kohlarn Hotel Images/          (โฟลเดอร์หลัก - สร้างอัตโนมัติ)
    ├── hotel-1 - ชื่อโรงแรมที่ 1/
    │   ├── hotel-1-1729123456789.jpg
    │   ├── hotel-1-1729123456790.jpg
    │   └── ...
    ├── hotel-2 - ชื่อโรงแรมที่ 2/
    │   ├── hotel-2-1729123456791.jpg
    │   └── ...
    └── ...
```

## 🔧 การตั้งค่า

### ⚠️ ขั้นตอนที่ 1: Enable Google Drive API (สำคัญ!)

**ต้องทำก่อนใช้งาน:**

1. **เปิด Google Cloud Console:**
   - ไปที่: https://console.developers.google.com/
   - เลือก Project ที่ใช้ Service Account

2. **Enable Google Drive API:**
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Google Drive API"
   - คลิก "ENABLE" (เปิดใช้งาน)
   - รอ 1-2 นาที ให้ระบบประมวลผล

3. **ตรวจสอบสถานะ:**
   - ไปที่ "APIs & Services" > "Enabled APIs"
   - ต้องเห็น "Google Drive API" ในรายการ

**หรือใช้ Direct Link:**
```
https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=YOUR_PROJECT_ID
```

### ⚠️ ขั้นตอนที่ 2: สร้างโฟลเดอร์และ Share ให้ Service Account

**เนื่องจาก Service Account ไม่มี Storage Quota ของตัวเอง** ต้องใช้โฟลเดอร์ที่ถูก share จาก Google Drive ส่วนตัวของคุณ:

1. **หา Service Account Email:**
   - ไปที่ Vercel Dashboard → Project "kohlarn" → Deployments
   - คลิก Deployment ล่าสุด → ดู Runtime Logs
   - จะเห็นข้อความ: `📧 Service Account Email: xxxxx@xxxxx.iam.gserviceaccount.com`
   - Copy email นี้ไว้

2. **สร้างโฟลเดอร์ใน Google Drive ของคุณ:**
   - เปิด https://drive.google.com
   - สร้างโฟลเดอร์ใหม่ชื่อ **"Kohlarn Hotel Images"**

3. **Share โฟลเดอร์ให้ Service Account:**
   - Right-click โฟลเดอร์ → **"Share"** (แชร์)
   - ใส่ Service Account Email ที่ copy มา
   - ตั้งสิทธิ์เป็น **"Editor"** (ผู้แก้ไข)
   - คลิก **"Send"** (ส่ง)

4. **คัดลอก Folder ID:**
   - เปิดโฟลเดอร์ **"Kohlarn Hotel Images"**
   - ดู URL ในช่อง address bar:
     ```
     https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
                                             ^^^^^^^^^^^^^^^^^^^
                                             นี่คือ Folder ID
     ```
   - Copy Folder ID (ส่วนหลัง `/folders/`)

5. **ตั้งค่า Environment Variable ใน Vercel:**
   - ไปที่ Vercel Dashboard → Project "kohlarn"
   - ไปที่ **Settings** → **Environment Variables**
   - เพิ่ม variable ใหม่:
     - **Name:** `GOOGLE_DRIVE_FOLDER_ID`
     - **Value:** (Folder ID ที่ copy มา)
     - **Environment:** เลือกทั้ง 3 (Production, Preview, Development)
   - คลิก **Save**

6. **Redeploy:**
   - ไปที่ **Deployments**
   - คลิก Deployment ล่าสุด → 3 จุด → **Redeploy**

### ✅ เสร็จแล้ว!

หลังจากนี้ Service Account จะสามารถ:
- ✅ อัพโหลดรูปภาพไปยังโฟลเดอร์ที่ share ไว้
- ✅ สร้างโฟลเดอร์ย่อยสำหรับแต่ละโรงแรม
- ✅ ลบรูปภาพเก่าได้
- ✅ ตั้งค่า public access ให้รูปภาพ

## 🎨 การทำงานของระบบ

### 1. อัพโหลดรูปภาพใหม่

```
1. Admin เลือกรูปภาพ → คลิก "อัพโหลด"
2. ระบบตรวจสอบ Hotel ID และชื่อโรงแรม
3. สร้างโฟลเดอร์ของโรงแรม (ถ้ายังไม่มี)
4. อัพโหลดรูปไปที่ Google Drive
5. ตั้งค่า Permission เป็น "anyone can view"
6. ส่ง Direct Link กลับมา
7. บันทึก URL ใน Google Sheets
```

### 2. ลบรูปภาพเก่า (อัตโนมัติ)

```
1. เมื่อแก้ไขโรงแรมและอัพโหลดรูปใหม่
2. ระบบจะดึง File ID จาก URL เก่า
3. เก็บ File ID ของรูปใหม่ไว้
4. ลบไฟล์เก่าที่ไม่ได้ใช้ออกจาก Google Drive
5. ประหยัด Storage และจัดการไฟล์ได้ดีขึ้น
```

## 🔗 รูปแบบ URL ที่ได้

```
https://drive.google.com/uc?export=view&id=FILE_ID
```

- ✅ สามารถใช้ใน `<img>` tag ได้โดยตรง
- ✅ Public access (ไม่ต้อง login)
- ✅ รองรับ hotlinking
- ✅ รวดเร็วและเสถียร

## 📝 API Endpoints

### POST /api/upload

อัพโหลดรูปภาพไปยัง Google Drive

**Request:**
```javascript
FormData {
  image: File,           // ไฟล์รูปภาพ
  hotelId: String,      // รหัสโรงแรม (เช่น "hotel-1")
  hotelName: String     // ชื่อโรงแรม (เช่น "โรงแรมทดสอบ")
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://drive.google.com/uc?export=view&id=...",
  "fileId": "1a2b3c4d5e6f...",
  "webViewLink": "https://drive.google.com/file/d/..."
}
```

## 🔐 Security

### Service Account Permissions
- **Scope**: `https://www.googleapis.com/auth/drive.file`
- **Access**: สามารถสร้าง/อ่าน/ลบไฟล์ที่สร้างเองเท่านั้น
- **Folder**: จำกัดเฉพาะโฟลเดอร์ "Kohlarn Hotel Images"

### File Permissions
- **Type**: `anyone`
- **Role**: `reader` (อ่านอย่างเดียว)
- **Access**: สาธารณะ (public)

## 🎯 ข้อดีเมื่อเทียบกับ Cloudinary

| Feature | Google Drive | Cloudinary |
|---------|-------------|------------|
| **ลบไฟล์เก่าอัตโนมัติ** | ✅ ได้ | ⚠️ ต้องใช้ API + Secret |
| **จัดการโฟลเดอร์** | ✅ แยกโฟลเดอร์ต่อโรงแรม | ❌ ใช้ folder เดียว |
| **Service Account** | ✅ ใช้ที่มีอยู่แล้ว | ❌ ต้องสมัครใหม่ |
| **Setup** | ✅ ไม่ต้องตั้งค่าเพิ่ม | ⚠️ ต้องสร้าง Upload Preset |
| **Storage** | 15 GB (Free) | 25 GB (Free) |
| **Image Transform** | ❌ ไม่มี | ✅ มี (resize, crop) |
| **CDN Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 📊 การใช้งาน Storage

### ประมาณการขนาดไฟล์:
- รูปคุณภาพปานกลาง: 200-500 KB/รูป
- รูปคุณภาพสูง: 500 KB - 2 MB/รูป
- โรงแรม 1 แห่ง (10 รูป): ~5-10 MB

### Storage Free Tier (15 GB):
- **~1,500 โรงแรม** (ถ้ารูปละ 1 MB, 10 รูป/โรงแรม)
- **~300,000 รูป** (ถ้ารูปละ 500 KB)

## 🔧 Maintenance

### ดูรายการไฟล์:
```javascript
const files = await googleDriveService.listFiles(hotelFolderId);
```

### ลบไฟล์:
```javascript
await googleDriveService.deleteFile(fileId);
```

### ลบรูปเก่าอัตโนมัติ:
```javascript
await googleDriveService.deleteOldImages(
  hotelId, 
  hotelName, 
  [keepFileId1, keepFileId2]
);
```

## 🆘 Troubleshooting

### ❌ Error: "Google Drive not initialized"
**สาเหตุ:** Service Account ไม่ได้ตั้งค่า  
**แก้ไข:** ตรวจสอบ `SERVICE_ACCOUNT_BASE64` ใน Vercel

### ❌ Error: "Permission denied"
**สาเหตุ:** Service Account ไม่มีสิทธิ์เข้าถึงโฟลเดอร์  
**แก้ไข:** ระบบจะสร้างโฟลเดอร์ใหม่อัตโนมัติ

### ❌ รูปภาพไม่แสดง
**สาเหตุ:** Permission ไม่ถูกต้อง  
**แก้ไข:** ระบบจะตั้งค่า public access อัตโนมัติเมื่ออัพโหลด

### ❌ Error: "File too large"
**สาเหตุ:** ไฟล์ใหญ่เกิน 10 MB  
**แก้ไข:** ลดขนาดไฟล์หรือใช้รูปคุณภาพต่ำลง

## 📚 เอกสารอ้างอิง

- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [File Permissions](https://developers.google.com/drive/api/guides/manage-sharing)

## ✅ สรุป

การใช้ Google Drive มีข้อดีคือ:
1. ✅ **ไม่ต้องตั้งค่าเพิ่ม** - ใช้ Service Account เดิม
2. ✅ **ลบรูปเก่าได้** - จัดการไฟล์สะดวก
3. ✅ **จัดระเบียบดี** - แยกโฟลเดอร์ต่อโรงแรม
4. ✅ **ฟรี 15 GB** - เพียงพอสำหรับเว็บไซต์ขนาดกลาง
5. ✅ **ทำงานบน Vercel** - ไม่มีปัญหา serverless

🎉 **พร้อมใช้งานทันที!** ไม่ต้องตั้งค่าอะไรเพิ่ม
