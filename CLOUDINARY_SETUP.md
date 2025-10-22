# 🌟 Cloudinary Setup Guide

## ขั้นตอนที่ 1: สร้างบัญชี Cloudinary

1. ไปที่ https://cloudinary.com/users/register_free
2. สมัครบัญชีฟรี (Free tier: 25 GB storage, 25 GB bandwidth/month)
3. ยืนยัน email
4. เข้าสู่ระบบ

---

## ขั้นตอนที่ 2: รับ API Credentials

1. หลังจาก login เข้าไปที่ **Dashboard**
2. จะเห็นข้อมูลส่วน **Account Details** ด้านบน:
   ```
   Cloud name:    dxxxxx
   API Key:       123456789012345
   API Secret:    xxxxxxxxxxxxxxxxxxxxx
   ```
3. **คัดลอกข้อมูลทั้ง 3 ค่า** (จะใช้ในขั้นตอนถัดไป)

---

## ขั้นตอนที่ 3: เพิ่ม Environment Variables ใน Local

แก้ไขไฟล์ `.env`:

```bash
# เปลี่ยนตรงนี้ (ลบหรือคอมเมนต์ตัวเก่า)
# GOOGLE_DRIVE_FOLDER_ID=...

# เพิ่มตัวใหม่ของ Cloudinary
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

**หมายเหตุ:** ใส่ค่าจริงจาก Dashboard ของคุณ

---

## ขั้นตอนที่ 4: เพิ่ม Environment Variables ใน Vercel

เลือกวิธีใดวิธีหนึ่ง:

### วิธีที่ 1: ใช้ Vercel Dashboard (แนะนำ)

1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **Settings** > **Environment Variables**
4. เพิ่มตัวแปรทั้ง 3 ตัว:
   - Name: `CLOUDINARY_CLOUD_NAME` → Value: `dxxxxx`
   - Name: `CLOUDINARY_API_KEY` → Value: `123456789012345`
   - Name: `CLOUDINARY_API_SECRET` → Value: `xxxxxxxxxxxxxxxxxxxxx`
5. เลือก Environment: **Production**, **Preview**, **Development** (ทั้ง 3 ตัว)
6. คลิก **Save**

### วิธีที่ 2: ใช้ Vercel CLI

```powershell
vercel env add CLOUDINARY_CLOUD_NAME
# กด Enter และใส่ค่า: dxxxxx
# เลือก environment: production, preview, development (กด Space เพื่อเลือก)

vercel env add CLOUDINARY_API_KEY
# ใส่ค่า: 123456789012345

vercel env add CLOUDINARY_API_SECRET
# ใส่ค่า: xxxxxxxxxxxxxxxxxxxxx
```

---

## ขั้นตอนที่ 5: ทดสอบใน Local

```powershell
# ตรวจสอบว่า .env ถูกต้อง
node -e "require('dotenv').config(); console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME); console.log('Configured:', !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));"

# รัน server
npm start
# หรือ
node server.js
```

**ผลลัพธ์ที่ควรเห็น:**
```
✅ Cloudinary configured successfully
   Cloud Name: dxxxxx
Server started on port 3000
```

---

## ขั้นตอนที่ 6: Deploy ไปยัง Vercel

```powershell
# Commit การเปลี่ยนแปลง
git add .
git commit -m "feat: migrate from Google Drive to Cloudinary"

# Push to GitHub (จะ auto-deploy ไป Vercel)
git push

# หรือ deploy ด้วยตนเอง
vercel --prod
```

---

## ขั้นตอนที่ 7: ทดสอบ Upload บน Production

1. เข้า Admin Panel: https://your-domain.vercel.app/admin_v2.html
2. Login ด้วย admin/hotel-owner
3. เลือกโรงแรม
4. คลิก **จัดการรูปภาพ**
5. อัพโหลดรูปภาพทดสอบ
6. ตรวจสอบว่า:
   - ✅ อัพโหลดสำเร็จ
   - ✅ แสดง URL ของ Cloudinary (ขึ้นต้นด้วย `https://res.cloudinary.com/...`)
   - ✅ รูปภาพแสดงผลถูกต้อง

---

## โครงสร้างไฟล์บน Cloudinary

รูปภาพจะถูกจัดเก็บในโครงสร้าง:

```
kohlarn/
└── hotels/
    ├── hotel-1/
    │   ├── hotel-1-1701234567890.jpg
    │   └── hotel-1-1701234568901.jpg
    ├── hotel-2/
    │   └── hotel-2-1701234569012.jpg
    └── hotel-3/
        └── hotel-3-1701234570123.jpg
```

---

## Features ที่ได้จาก Cloudinary

✅ **Image Optimization:**
- Auto-resize สูงสุด 1920x1080
- Auto-quality optimization
- Auto-format (WebP สำหรับ browser ที่รองรับ)

✅ **CDN Delivery:**
- Global CDN network
- Fast image loading worldwide

✅ **Unlimited Uploads:**
- Free tier: 25GB storage + 25GB bandwidth/month
- ไม่มีปัญหา quota เหมือน Google Drive

✅ **Secure URLs:**
- HTTPS by default
- Public URLs (ไม่ต้อง authentication)

---

## การจัดการรูปภาพบน Cloudinary Dashboard

1. ไปที่ https://cloudinary.com/console/media_library
2. เปิด folder: `kohlarn > hotels > hotel-X`
3. ดูรูปภาพทั้งหมด, ลบ, จัดการได้ตรงนี้

---

## Troubleshooting

### ❌ Error: "Cloudinary not configured"

**สาเหตุ:** Environment variables ไม่ได้ถูก set

**วิธีแก้:**
```powershell
# ตรวจสอบ .env
cat .env | Select-String "CLOUDINARY"

# ตรวจสอบ Vercel
vercel env ls
```

### ❌ Error: "Invalid API credentials"

**สาเหตุ:** คัดลอก API Secret ผิด

**วิธีแก้:**
1. ไปที่ Cloudinary Dashboard
2. คลิก **Reveal API Secret** (มีปุ่มตาเปิด/ปิด)
3. คัดลอกใหม่และ update .env และ Vercel

### ❌ Upload ช้า

**สาเหตุ:** ไฟล์ขนาดใหญ่

**วิธีแก้:**
- Cloudinary จะ auto-optimize อยู่แล้ว
- รองรับไฟล์สูงสุด 10MB (ตั้งค่าใน server.js)
- แนะนำอัพโหลดรูปขนาด < 5MB

---

## Migration Checklist

- [x] ติดตั้ง cloudinary package (`npm install cloudinary`)
- [x] สร้างไฟล์ `services/cloudinary.js`
- [x] แก้ไข `server.js` (เปลี่ยนจาก googleDrive → cloudinary)
- [ ] สร้างบัญชี Cloudinary
- [ ] คัดลอก API credentials
- [ ] เพิ่ม env vars ใน `.env`
- [ ] เพิ่ม env vars ใน Vercel
- [ ] ทดสอบใน local
- [ ] Deploy ไป production
- [ ] ทดสอบ upload บน production

---

## ขั้นตอนถัดไป (Optional - ทำทีหลังก็ได้)

### ลบ Google Drive Dependencies

เมื่อแน่ใจว่า Cloudinary ทำงานได้ดีแล้ว:

```powershell
# ลบ environment variable เก่า
# แก้ไข .env - ลบหรือคอมเมนต์ GOOGLE_DRIVE_FOLDER_ID

# ลบใน Vercel
vercel env rm GOOGLE_DRIVE_FOLDER_ID production
vercel env rm GOOGLE_DRIVE_FOLDER_ID preview
vercel env rm GOOGLE_DRIVE_FOLDER_ID development

# ลบไฟล์เก่า (ถ้าไม่ใช้แล้ว)
# rm services/googleDrive.js
# rm GOOGLE_DRIVE_FOLDER_SETUP.md
```

### อัพเกรด Cloudinary (ถ้าต้องการ)

Free tier เพียงพอสำหรับเว็บไซต์ขนาดเล็ก-กลาง

หากต้องการมากกว่า 25GB/month:
- **Plus Plan:** $89/month - 75GB storage, 150GB bandwidth
- **Advanced Plan:** $224/month - 150GB storage, 300GB bandwidth

---

## คำถามที่พบบ่อย

**Q: รูปภาพเก่าจาก Google Drive จะเป็นอย่างไร?**
A: รูปภาพเก่ายังอยู่ใน Google Drive และยังใช้งานได้ปกติ (URL ยังใช้ได้) แต่รูปภาพใหม่จะเก็บใน Cloudinary

**Q: ต้องย้ายรูปเก่าไปยัง Cloudinary ไหม?**
A: ไม่จำเป็น ยกเว้นถ้าต้องการจัดการรูปภาพเก่าผ่าน Cloudinary Dashboard

**Q: Free tier เพียงพอไหม?**
A: เพียงพอสำหรับเว็บไซต์ที่มี traffic ปานกลาง (~ 1,000+ visits/day)

**Q: ปลอดภัยไหม?**
A: ปลอดภัย - Cloudinary เป็น industry standard ใช้โดยบริษัทใหญ่หลายพันราย (Airbnb, Nike, etc.)

---

**หากมีปัญหาหรือข้อสงสัย ให้ตรวจสอบ:**
1. Console logs: `vercel logs` หรือ Vercel Dashboard
2. Cloudinary Dashboard: Media Library
3. Network tab ใน browser DevTools
