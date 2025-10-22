# 🚀 Quick Start - Cloudinary Setup

## ⏱️ ใช้เวลาแค่ 5 นาที

### วิธีที่ 1: ใช้ Script อัตโนมัติ (แนะนำ) ⭐

```powershell
# รัน script นี้และทำตามขั้นตอน
.\setup-cloudinary-vercel.ps1
```

Script จะช่วย:
- ✅ อัพเดทไฟล์ .env
- ✅ เพิ่ม env vars ลง Vercel อัตโนมัติ
- ✅ แสดงขั้นตอนถัดไป

---

### วิธีที่ 2: ทำเอง (Manual)

#### 📝 Step 1: สร้างบัญชี Cloudinary

1. ไปที่: https://cloudinary.com/users/register_free
2. สมัครฟรี (ใช้ Email)
3. ยืนยัน Email → Login

#### 🔑 Step 2: คัดลอก Credentials

Login แล้วไปที่: https://cloudinary.com/console

จะเห็น:
```
Cloud name:    dxxxxx
API Key:       123456789012345
API Secret:    xxxxxxxxxxxxxxxxxxxxx
```

👉 คัดลอกทั้ง 3 ค่า

#### 💻 Step 3: เพิ่มใน .env

เปิดไฟล์ `.env` เพิ่มบรรทัดนี้ (ใส่ค่าจริงของคุณ):

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

#### ☁️ Step 4: เพิ่มใน Vercel

**Option A: ใช้ Dashboard** (ง่ายที่สุด)

1. ไปที่: https://vercel.com/dashboard
2. เลือกโปรเจกต์ `kohlarn-n543`
3. Settings → Environment Variables
4. เพิ่มทั้ง 3 ตัว:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. เลือก Environment: **Production, Preview, Development** (ทั้ง 3)
6. คลิก Save

**Option B: ใช้ CLI**

```powershell
# เพิ่มทีละตัว
vercel env add CLOUDINARY_CLOUD_NAME production preview development
# ใส่ค่า: dxxxxx

vercel env add CLOUDINARY_API_KEY production preview development
# ใส่ค่า: 123456789012345

vercel env add CLOUDINARY_API_SECRET production preview development
# ใส่ค่า: xxxxxxxxxxxxxxxxxxxxx
```

#### ✅ Step 5: ทดสอบ

**ใน Local:**
```powershell
.\test-cloudinary.bat
npm start
```

**ใน Production:**
```powershell
vercel --prod
```

จากนั้นทดสอบอัพโหลดรูปที่:
- https://kohlarn-n543.vercel.app/admin_v2.html

---

## 🎯 สิ่งที่เสร็จแล้ว

- ✅ Code พร้อมใช้งาน (Push ไป GitHub แล้ว)
- ✅ Cloudinary service ติดตั้งเรียบร้อย
- ✅ Deploy บน Vercel แล้ว (รอเพิ่ม env vars)

## ⚠️ สิ่งที่ต้องทำ

- [ ] สร้างบัญชี Cloudinary (5 นาที)
- [ ] คัดลอก credentials
- [ ] เพิ่มใน .env และ Vercel
- [ ] Redeploy
- [ ] ทดสอบ upload รูป

---

## 💡 Tips

**ทดสอบว่า Cloudinary ใช้งานได้:**
```powershell
.\test-cloudinary.bat
```

**ดู env vars ใน Vercel:**
```powershell
vercel env ls
```

**Redeploy:**
```powershell
vercel --prod
```

**ดู logs:**
```powershell
vercel logs
```

---

## 🆘 ติดปัญหา?

1. ดู `CLOUDINARY_SETUP.md` (คู่มือเต็ม)
2. เช็ค Vercel logs: `vercel logs`
3. ตรวจสอบ env vars: `vercel env ls`

---

## 📱 Contact Cloudinary

- Dashboard: https://cloudinary.com/console
- Media Library: https://cloudinary.com/console/media_library
- Support: https://support.cloudinary.com
