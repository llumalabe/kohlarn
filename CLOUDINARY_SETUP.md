# การตั้งค่า Cloudinary สำหรับอัพโหลดรูปภาพ

## 🎯 เหตุผลที่ใช้ Cloudinary

Vercel เป็น serverless platform ที่มี **read-only file system** ไม่สามารถบันทึกไฟล์ลงในเซิร์ฟเวอร์ได้ 
ดังนั้นจึงต้องใช้ Cloudinary สำหรับเก็บรูปภาพโรงแรม

## 📝 ขั้นตอนการตั้งค่า

### 1. สร้างบัญชี Cloudinary (ฟรี!)

1. ไปที่ https://cloudinary.com/
2. คลิก **Sign Up for Free**
3. กรอกข้อมูลและยืนยันอีเมล

**Free Plan ให้:**
- ✅ 25 GB Storage
- ✅ 25 GB Bandwidth/เดือน
- ✅ 25,000 transformations/เดือน
- ✅ เพียงพอสำหรับเว็บไซต์ขนาดกลาง

### 2. หา Cloud Name

1. เข้าสู่ระบบ Cloudinary
2. ที่หน้า Dashboard จะเห็น:
   - **Cloud name**: `dxxxxxxxxx` (คัดลอกค่านี้)
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxx`

### 3. สร้าง Upload Preset

1. ไปที่เมนู **Settings** (⚙️) → **Upload**
2. เลื่อนลงไปหา **Upload presets**
3. คลิก **Add upload preset**
4. ตั้งค่าดังนี้:
   - **Upload preset name**: `kohlarn_hotels`
   - **Signing Mode**: เลือก **Unsigned** (สำคัญ!)
   - **Folder**: `kohlarn-hotels` (หรือชื่ออื่นที่ต้องการ)
   - **Access Mode**: `public`
   - **Unique filename**: เปิด (Enable)
   - **Overwrite**: ปิด (Disable)
5. คลิก **Save**

### 4. เพิ่มค่าใน Environment Variables

#### 4.1 สำหรับ Local Development (.env)

เพิ่มใน `.env`:
```env
CLOUDINARY_CLOUD_NAME=dxxxxxxxxx
CLOUDINARY_UPLOAD_PRESET=kohlarn_hotels
```

#### 4.2 สำหรับ Vercel (Production)

1. ไปที่ Vercel Dashboard
2. เลือกโปรเจค `kohlarn`
3. ไปที่ **Settings** → **Environment Variables**
4. เพิ่ม 2 ตัวแปร:

| Name | Value | Environment |
|------|-------|-------------|
| `CLOUDINARY_CLOUD_NAME` | `dxxxxxxxxx` | Production, Preview, Development |
| `CLOUDINARY_UPLOAD_PRESET` | `kohlarn_hotels` | Production, Preview, Development |

5. คลิก **Save**
6. Redeploy โปรเจค

### 5. ทดสอบการอัพโหลด

1. เข้าหน้า Admin → เพิ่มโรงแรม
2. กด **อัพโหลดรูปภาพ**
3. เลือกไฟล์รูปภาพ
4. ระบบจะอัพโหลดตรงไปที่ Cloudinary
5. ตรวจสอบที่ Cloudinary Dashboard → Media Library

## ⚙️ การทำงานของระบบ

### ก่อน (Vercel Read-Only Error):
```
Browser → Server (save to disk) → ❌ ERROR: Read-only file system
```

### หลัง (Cloudinary Direct Upload):
```
Browser → Cloudinary API → ✅ รูปภาพถูกบันทึก
         ↓
     รับ URL กลับมา → บันทึกใน Google Sheets
```

## 🔒 ความปลอดภัย

- ใช้ **Unsigned Upload Preset** = ไม่ต้องเปิดเผย API Secret
- จำกัดขนาดไฟล์ที่ 5MB
- จำกัดประเภทไฟล์ (JPG, PNG, GIF, WebP)
- เก็บในโฟลเดอร์เฉพาะ `kohlarn-hotels`

## 📁 โครงสร้างไฟล์ใน Cloudinary

```
Cloudinary/
└── kohlarn-hotels/
    ├── hotel-1234567890-123456789.jpg
    ├── hotel-1234567891-987654321.png
    └── ...
```

## 🛠️ การจัดการรูปภาพ

### ลบรูปภาพเก่า (Manual)
1. ไปที่ Cloudinary Dashboard
2. Media Library → โฟลเดอร์ `kohlarn-hotels`
3. เลือกรูปที่ต้องการลบ
4. คลิก Delete

### ลบรูปภาพเก่าอัตโนมัติ (ถ้าต้องการ)
- ต้องใช้ Cloudinary API with Authentication
- ต้องเพิ่ม API Key และ API Secret
- ต้องเขียนโค้ดเพิ่มเติมในฝั่ง Backend

## 🆘 Troubleshooting

### ❌ Error: "ไม่สามารถโหลดการตั้งค่าการอัพโหลดได้"
- ตรวจสอบว่าตั้งค่า Environment Variables ใน Vercel แล้ว
- Redeploy โปรเจค

### ❌ Error: "Upload preset not found"
- ตรวจสอบชื่อ Upload Preset ใน Cloudinary
- ต้องเป็น **Unsigned** mode
- ตรวจสอบว่า `CLOUDINARY_UPLOAD_PRESET` ตรงกัน

### ❌ รูปภาพไม่แสดง
- ตรวจสอบ URL ที่บันทึกใน Google Sheets
- ลอง Access URL โดยตรง
- ตรวจสอบว่า Access Mode = `public`

## 📚 อ้างอิง

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Unsigned Upload](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)
