# Multi-Image & Hotel Status Upgrade

## 📋 สรุปการอัพเดท

### 1. ระบบรูปภาพหลายรูป (Multiple Images)
- **ก่อน**: โรงแรมมีรูปได้ 1 รูปเท่านั้น (Column F)
- **หลัง**: โรงแรมมีรูปได้ถึง 5 รูป (Columns F, T, U, V, W)
- **รูปแบบ**: URL รูปภาพแยกกันในแต่ละคอลัมน์

### 2. Image Carousel (หน้าแรก)
- แสดงรูปภาพแบบ Slideshow
- มีปุ่มเลื่อน ซ้าย-ขวา
- มี Indicator จุดด้านล่าง
- Auto-play ทุก 5 วินาที (Optional)

### 3. ระบบอัพโหลดรูปภาพ
- อัพโหลดได้สูงสุด 5 รูปต่อโรงแรม
- รองรับไฟล์: JPG, PNG, GIF, WebP
- ขนาดสูงสุด: 5MB ต่อรูป
- Upload to: Cloudinary / ImgBB / Local Server

### 4. ระบบเปิด-ปิดโรงแรม (Hotel Status)
- **Column X**: สถานะโรงแรม (active/inactive)
- **active**: แสดงโรงแรมในหน้าแรก
- **inactive**: ซ่อนโรงแรม (ไม่แสดงในหน้าแรก)
- Admin สามารถเปิด-ปิดได้จากหน้า "จัดการโรงแรม"

---

## 📊 Google Sheets Schema Update

### Hotels Sheet - คอลัมน์ใหม่:

| Column | ชื่อฟิลด์ | ประเภท | ตอย่าง | หมายเหตุ |
|--------|-----------|--------|---------|----------|
| **F** | imageUrl1 | Text | https://... | รูปหลัก (เดิม) |
| **T** | imageUrl2 | Text | https://... | รูปที่ 2 (ใหม่) |
| **U** | imageUrl3 | Text | https://... | รูปที่ 3 (ใหม่) |
| **V** | imageUrl4 | Text | https://... | รูปที่ 4 (ใหม่) |
| **W** | imageUrl5 | Text | https://... | รูปที่ 5 (ใหม่) |
| **X** | status | Text | active | สถานะ: active/inactive (ใหม่) |

**รวมคอลัมน์ทั้งหมด**: A-X (24 columns)

---

## 🔧 การติดตั้ง

### ขั้นตอนที่ 1: อัพเดท Google Sheets

1. เปิด Google Sheets ของคุณ
2. ไปที่ Sheet "Hotels"
3. **เพิ่มคอลัมน์ใหม่**:
   - Column T: Header = "imageUrl2"
   - Column U: Header = "imageUrl3"
   - Column V: Header = "imageUrl4"
   - Column W: Header = "imageUrl5"
   - Column X: Header = "status"

4. **ตั้งค่าสถานะเริ่มต้น**:
   - ใส่ "active" ในคอลัมน์ X สำหรับโรงแรมที่มีอยู่ทั้งหมด
   - Formula สำหรับ X2: `=IF(A2<>"", "active", "")`
   - ลาก Formula ลงมาทุกแถว

### ขั้นตอนที่ 2: ติดตั้ง Multer (สำหรับอัพโหลดไฟล์)

```bash
npm install multer
```

### ขั้นตอนที่ 3: รีสตาร์ท Server

```bash
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
npm start
```

---

## 🎨 ฟีเจอร์ใหม่

### 1. Image Carousel (หน้าแรก)

**การทำงาน**:
- แสดงรูปภาพทั้งหมดของโรงแรม
- กดปุ่ม ← → เพื่อเลื่อนดูรูป
- มี Indicator จุดแสดงตำแหน่งรูป
- รูปที่ 1 เป็นรูปเริ่มต้น

**ตัวอย่าง UI**:
```
┌──────────────────────────┐
│                          │
│      [  รูปโรงแรม  ]    │
│                          │
│  ←                    →  │
│       • ○ ○ ○ ○         │
└──────────────────────────┘
```

### 2. Multiple Image Upload (Admin Panel)

**หน้าจัดการโรงแรม**:
```
┌─────────────────────────────────┐
│ รูปภาพโรงแรม (สูงสุด 5 รูป)    │
│                                 │
│ [อัพโหลดรูปที่ 1] [ดูตัวอย่าง] │
│ [อัพโหลดรูปที่ 2] [ดูตัวอย่าง] │
│ [อัพโหลดรูปที่ 3] [ดูตัวอย่าง] │
│ [อัพโหลดรูปที่ 4] [ดูตัวอย่าง] │
│ [อัพโหลดรูปที่ 5] [ดูตัวอย่าง] │
└─────────────────────────────────┘
```

**วิธีใช้**:
1. กดปุ่ม "เลือกไฟล์"
2. เลือกรูปภาพจากเครื่อง
3. ระบบจะอัพโหลดและแสดง Preview
4. URL จะถูกบันทึกใน Google Sheets

### 3. Hotel Status Toggle (จัดการโรงแรม)

**ตารางโรงแรม**:
```
┌──────────────────────────────────────────┐
│ ID  │ ชื่อ         │ สถานะ    │ จัดการ   │
├─────┼──────────────┼──────────┼──────────┤
│ 001 │ บีช รีสอร์ท │ 🟢 เปิด  │ [ปิด]    │
│ 002 │ ซี วิว      │ 🔴 ปิด   │ [เปิด]   │
└──────────────────────────────────────────┘
```

**การทำงาน**:
- **สถานะ "active"** = 🟢 เปิด (แสดงในหน้าแรก)
- **สถานะ "inactive"** = 🔴 ปิด (ไม่แสดงในหน้าแรก)
- กดปุ่ม "เปิด" หรือ "ปิด" เพื่อสลับสถานะ
- บันทึกใน Google Sheets ทันที

---

## 📁 ไฟล์ที่แก้ไข

### Backend:
1. `services/googleSheets.js`
   - อัพเดท `getHotels()` - อ่าน 5 รูป + status
   - อัพเดท `addHotel()` - บันทึก 5 รูป + status
   - อัพเดท `updateHotel()` - แก้ไข 5 รูป + status
   - เพิ่ม `toggleHotelStatus()` - เปลี่ยนสถานะ

2. `server.js`
   - เพิ่ม Multer middleware
   - เพิ่ม `/api/upload` - อัพโหลดรูป
   - เพิ่ม `/api/admin/hotels/:id/status` - Toggle status
   - กรอง hotels ที่ status = 'active' ในหน้าแรก

### Frontend:

3. `public/js/app.js`
   - เพิ่ม Image Carousel
   - แสดงเฉพาะโรงแรม status = 'active'

4. `public/js/admin_v2.js`
   - เพิ่ม Multi-image upload form
   - เพิ่มปุ่ม Toggle Status
   - แสดง Badge สถานะ (เปิด/ปิด)

5. `public/css/app.css`
   - CSS สำหรับ Carousel
   - Animation สำหรับปุ่มเลื่อน
   - Indicator style

6. `public/css/admin_v2.css`
   - CSS สำหรับ Multi-upload
   - Status badge style

---

## 🎯 ตัวอย่างการใช้งาน

### ตัวอย่าง 1: เพิ่มโรงแรมพร้อมรูป 5 รูป

1. เข้าหน้า "จัดการโรงแรม"
2. กด "เพิ่มโรงแรม"
3. กรอกข้อมูลโรงแรม
4. อัพโหลดรูปภาพ 5 รูป
5. สถานะเริ่มต้น: "เปิด" (แสดงในหน้าแรก)
6. บันทึก

**ผลลัพธ์ในหน้าแรก**:
- แสดงการ์ดโรงแรม
- มี Carousel แสดงรูป 5 รูป
- กดปุ่มเลื่อนดูรูปได้

### ตัวอย่าง 2: ปิดโรงแรมชั่วคราว

1. เข้าหน้า "จัดการโรงแรม"
2. หาโรงแรมที่ต้องการปิด
3. กดปุ่ม "ปิด" ในคอลัมน์สถานะ
4. สถานะเปลี่ยนเป็น 🔴 ปิด

**ผลลัพธ์ในหน้าแรก**:
- โรงแรมหายไปจากหน้าแรก
- ยังคงข้อมูลอยู่ใน Google Sheets
- สามารถเปิดกลับมาได้ทุกเมื่อ

---

## 🔐 API Endpoints ใหม่

### 1. Upload Image
```
POST /api/upload
Content-Type: multipart/form-data

Body: {
  image: [File]
}

Response: {
  success: true,
  imageUrl: "https://..."
}
```

### 2. Toggle Hotel Status
```
PUT /api/admin/hotels/:id/status
Content-Type: application/json

Body: {
  username: "adminn",
  password: "Aa123456",
  status: "active" // or "inactive"
}

Response: {
  success: true,
  message: "Hotel status updated"
}
```

---

## 🎨 CSS Classes ใหม่

### Carousel:
- `.hotel-carousel` - Container
- `.carousel-slide` - แต่ละรูป
- `.carousel-btn` - ปุ่มเลื่อน
- `.carousel-indicators` - Dots

### Status Badge:
- `.status-badge` - Badge container
- `.status-active` - สถานะเปิด (เขียว)
- `.status-inactive` - สถานะปิด (แดง)

---

## 📝 หมายเหตุ

### การอัพโหลดรูป:
- ตัวอย่างนี้ใช้ **Local Storage** (บันทึกใน `/public/uploads/`)
- แนะนำใช้ **Cloudinary** หรือ **ImgBB** สำหรับ Production
- ตั้งค่า Max File Size = 5MB

### Performance:
- Carousel ใช้ CSS Transform (เร็วกว่า)
- Lazy loading รูปภาพ
- Compress รูปก่อนอัพโหลด (แนะนำ)

### Security:
- ตรวจสอบ File Type (JPG, PNG, GIF, WebP)
- จำกัด File Size
- Sanitize filename
- ตรวจสอบ Admin Login ก่อนอัพโหลด

---

**อัพเดทโดย**: GitHub Copilot  
**วันที่**: 7 ตุลาคม 2568  
**เวอร์ชัน**: 3.0 - Multi-Image & Status System
