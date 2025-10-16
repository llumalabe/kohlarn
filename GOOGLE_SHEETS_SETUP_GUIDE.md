# 📚 คู่มือติดตั้ง Google Sheets API แบบละเอียด

## 🎯 ภาพรวม

คุณต้องทำ 2 อย่าง:
1. **สร้าง Google Sheets** - ไฟล์สำหรับเก็บข้อมูล
2. **ตั้งค่า API Key** - เพื่อให้เว็บอ่านข้อมูลได้

---

## 📋 ขั้นตอนที่ 1: สร้าง Google Sheets

### 1.1 เปิด Google Sheets
1. ไปที่ [Google Sheets](https://sheets.google.com)
2. คลิก **"+ Blank"** เพื่อสร้างไฟล์ใหม่

### 1.2 ตั้งชื่อไฟล์
1. คลิกที่ **"Untitled spreadsheet"** มุมซ้ายบน
2. ตั้งชื่อเป็น: **"Koh Larn Hotels Database"**

### 1.3 สร้าง Sheet แรก: Hotels
1. เปลี่ยนชื่อ Sheet1 เป็น **"Hotels"**
2. ใส่หัวตาราง (แถวที่ 1):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | ชื่อ (ไทย) | ชื่อ (อังกฤษ) | ราคาเริ่มต้น | ราคาสูงสุด | รับได้ (คน) | รูปภาพ | Facebook | โทรศัพท์ | มีห้องน้ำ | มี WiFi | มีแอร์ | ที่จอดรถ | สระว่ายน้ำ | ห้องครัว | อาหารเช้า | แก้ไขโดย | แก้ไขเมื่อ |

### 1.4 ใส่ข้อมูลตัวอย่าง (แถวที่ 2)
```
hotel-001
โรงแรมทดสอบ
Test Hotel
500
1500
4
https://via.placeholder.com/400x300
https://facebook.com/testhotel
0812345678
true
true
true
true
false
false
true
Admin
2025-10-05
```

---

### 1.5 สร้าง Sheet ที่ 2: Users
1. คลิกปุ่ม **+** ที่ด้านล่างซ้าย
2. ตั้งชื่อ Sheet ใหม่: **"Users"**
3. ใส่หัวตาราง (แถวที่ 1):

| A | B | C | D |
|---|---|---|---|
| Username | Password | Nickname | Role |

4. ใส่ข้อมูลตัวอย่าง (แถวที่ 2):
```
adminreal
mypassword123
ผู้จัดการระบบ
admin
```

---

### 1.6 สร้าง Sheet ที่ 3: Filters
1. คลิกปุ่ม **+** อีกครั้ง
2. ตั้งชื่อ: **"Filters"**
3. ใส่หัวตาราง (แถวที่ 1):

| A | B | C |
|---|---|---|
| NameTH | NameEN | Icon |

4. ใส่ข้อมูลตัวอย่าง (แถวที่ 2-7):
```
ห้องน้ำในตัว | Private Bathroom | fa-toilet
WiFi | WiFi | fa-wifi
เครื่องปรับอากาศ | Air Conditioning | fa-snowflake
ที่จอดรถ | Parking | fa-car
สระว่ายน้ำ | Swimming Pool | fa-swimming-pool
ห้องครัว | Kitchen | fa-utensils
```

---

### 1.7 สร้าง Sheet ที่ 4: ActivityLog
1. คลิกปุ่ม **+** อีกครั้ง
2. ตั้งชื่อ: **"ActivityLog"**
3. ใส่หัวตาราง (แถวที่ 1):

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Username | Nickname | Action | Details |

---

### 1.8 แชร์ไฟล์ให้เป็น Public
1. คลิกปุ่ม **"Share"** มุมขวาบน
2. คลิก **"Change to anyone with the link"**
3. เลือก **"Viewer"** (ให้คนอื่นดูได้อย่างเดียว)
4. คลิก **"Copy link"**
5. คลิก **"Done"**

---

## 🔑 ขั้นตอนที่ 2: สร้าง Google API Key

### 2.1 เปิด Google Cloud Console
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. Login ด้วย Google Account เดียวกัน

### 2.2 สร้าง Project ใหม่
1. คลิกเมนูด้านบน (ข้าง Google Cloud Platform)
2. คลิก **"NEW PROJECT"**
3. ตั้งชื่อ Project: **"Koh Larn Hotels"**
4. คลิก **"CREATE"**
5. รอสักครู่จนสร้างเสร็จ (ประมาณ 10-30 วินาที)

### 2.3 เลือก Project
1. คลิกเมนูด้านบนอีกครั้ง
2. เลือก **"Koh Larn Hotels"** ที่เพิ่งสร้าง

### 2.4 เปิดใช้งาน Google Sheets API
1. ไปที่เมนูซ้ายบน (☰)
2. เลือก **"APIs & Services"** → **"Library"**
3. พิมพ์ในช่องค้นหา: **"Google Sheets API"**
4. คลิกที่ **"Google Sheets API"**
5. คลิกปุ่ม **"ENABLE"** สีน้ำเงิน
6. รอสักครู่จนเปิดใช้งานเสร็จ

### 2.5 สร้าง API Key
1. ไปที่ **"APIs & Services"** → **"Credentials"**
2. คลิกปุ่ม **"+ CREATE CREDENTIALS"** ด้านบน
3. เลือก **"API key"**
4. API Key จะถูกสร้างขึ้นมา (เช่น: `AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
5. คลิก **"COPY"** เพื่อคัดลอก API Key

### 2.6 จำกัดการใช้งาน API Key (แนะนำ)
1. คลิก **"EDIT API KEY"** (หรือไอคอนดินสอ)
2. ที่ **"Application restrictions"**:
   - เลือก **"HTTP referrers (websites)"**
   - คลิก **"ADD AN ITEM"**
   - ใส่: `http://192.168.1.26:3000/*`
   - ใส่: `http://localhost:3000/*`
3. ที่ **"API restrictions"**:
   - เลือก **"Restrict key"**
   - เลือก **"Google Sheets API"**
4. คลิก **"SAVE"**

---

## 🔗 ขั้นตอนที่ 3: เชื่อมต่อกับเว็บ

### 3.1 คัดลอก Spreadsheet ID
1. ดูที่ URL ของ Google Sheets ที่เปิดอยู่
2. URL จะมีรูปแบบ:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_อยู่ตรงนี้/edit
   ```
3. คัดลอกส่วน **SPREADSHEET_ID** (ยาวประมาณ 44 ตัวอักษร)
   
   ตัวอย่าง:
   ```
   1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA
   ```

### 3.2 สร้างไฟล์ .env
1. เปิด VS Code
2. สร้างไฟล์ใหม่ชื่อ `.env` ในโฟลเดอร์ `kohlarn`
3. ใส่ข้อมูล:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=ใส่_SPREADSHEET_ID_ตรงนี้
GOOGLE_API_KEY=ใส่_API_KEY_ตรงนี้

# Server Configuration
PORT=3000
```

**ตัวอย่างจริง:**
```env
GOOGLE_SHEET_ID=1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA
GOOGLE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=3000
```

### 3.3 บันทึกไฟล์
1. กด **Ctrl + S** เพื่อบันทึก
2. ปิด VS Code

---

## 🚀 ขั้นตอนที่ 4: Restart Server

### 4.1 หยุด Server เก่า
1. เปิด PowerShell/Terminal
2. พิมพ์:
```powershell
Get-Process -Name node | Stop-Process -Force
```

### 4.2 เริ่ม Server ใหม่
```powershell
npm start
```

### 4.3 ดูผลลัพธ์
ควรเห็นข้อความ:
```
✅ Successfully connected to Google Sheets!
📊 Found X hotels
🚀 Server is running!
   Local:   http://localhost:3000
   Network: http://192.168.1.26:3000
```

ถ้าเห็นข้อความนี้ แสดงว่าเชื่อมต่อสำเร็จ! 🎉

---

## ✅ ขั้นตอนที่ 5: ทดสอบ

### 5.1 ทดสอบหน้าแรก
เปิดเว็บเบราว์เซอร์:
```
http://192.168.1.26:3000
```

ควรเห็น:
- ✅ โรงแรมจาก Google Sheets แสดงผล
- ✅ ตัวกรองทำงาน
- ✅ กดหัวใจได้

### 5.2 ทดสอบ Admin
เปิด:
```
http://192.168.1.26:3000/admin_v2.html
```

Login ด้วย:
- Username: `admin`
- Password: `123456`

หรือใช้ user ที่สร้างไว้ใน Google Sheets:
- Username: `adminreal`
- Password: `mypassword123`

ควรเห็น:
- ✅ Login สำเร็จ
- ✅ Dashboard แสดงข้อมูล
- ✅ จัดการโรงแรมได้
- ✅ Activity Log บันทึก

---

## 🐛 แก้ไขปัญหาที่พบบ่อย

### ปัญหา 1: Error 403 - Forbidden
**สาเหตุ:** API Key ไม่ถูกต้องหรือยังไม่ได้เปิดใช้งาน

**แก้ไข:**
1. ตรวจสอบว่า API Key ถูกต้อง
2. ตรวจสอบว่าเปิดใช้งาน Google Sheets API แล้ว
3. รอ 1-2 นาที (อาจต้องใช้เวลาในการ propagate)

### ปัญหา 2: Error 400 - Invalid Request
**สาเหตุ:** Spreadsheet ID ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบ SPREADSHEET_ID ใน .env
2. ตรวจสอบว่าไม่มีช่องว่างหรือตัวอักษรพิเศษ

### ปัญหา 3: ไม่มีข้อมูล / Array empty
**สาเหตุ:** Sheet name ไม่ตรง

**แก้ไข:**
1. ตรวจสอบว่า Sheet ชื่อ "Hotels" (H ตัวใหญ่)
2. ตรวจสอบว่ามีข้อมูลในแถวที่ 2 ขึ้นไป
3. ตรวจสอบว่าแถวที่ 1 เป็นหัวตาราง

### ปัญหา 4: Login ไม่ได้
**สาเหตุ:** ยังใช้ temporary account อยู่

**ทดสอบ:**
1. ลอง login ด้วย `admin` / `123456` ก่อน
2. ถ้าได้ แสดงว่า API ทำงาน
3. ถ้าต้องการใช้ Google Sheets users:
   - ตรวจสอบว่า Sheet "Users" มีข้อมูล
   - ตรวจสอบ username/password ถูกต้อง

---

## 📊 โครงสร้าง Google Sheets ที่สมบูรณ์

### Sheet 1: Hotels
- **จุดประสงค์:** เก็บข้อมูลโรงแรม
- **จำนวนคอลัมน์:** 18 คอลัมน์ (A-R)
- **ตัวอย่าง:** 1 โรงแรมขึ้นไป

### Sheet 2: Users  
- **จุดประสงค์:** เก็บข้อมูลผู้ใช้ระบบ
- **จำนวนคอลัมน์:** 4 คอลัมน์ (A-D)
- **ตัวอย่าง:** 1 user ขึ้นไป

### Sheet 3: Filters
- **จุดประสงค์:** ตัวกรองที่แสดงในหน้าแรก
- **จำนวนคอลัมน์:** 3 คอลัมน์ (A-C)
- **ตัวอย่าง:** 6 filters

### Sheet 4: ActivityLog
- **จุดประสงค์:** บันทึกการใช้งาน
- **จำนวนคอลัมน์:** 5 คอลัมน์ (A-E)
- **อัตโนมัติ:** เพิ่มข้อมูลเองเมื่อมีการแก้ไข

---

## 🎓 Tips เพิ่มเติม

### 1. Backup ข้อมูล
- Google Sheets มี Version History อยู่แล้ว
- ไปที่ File → Version history → See version history
- สามารถกลับไปดู/เปลี่ยนแปลงย้อนหลังได้

### 2. แชร์ให้ทีมงาน
- คลิก Share
- ใส่อีเมลของทีมงาน
- เลือก "Editor" ถ้าให้แก้ไขได้
- เลือก "Viewer" ถ้าให้ดูอย่างเดียว

### 3. ใช้ Data Validation
- เลือกคอลัมน์ที่ต้องการ (เช่น มีห้องน้ำ)
- Data → Data validation
- เลือก "List of items": `true,false`
- ป้องกันข้อมูลผิดพลาด

### 4. ใช้ Conditional Formatting
- Format → Conditional formatting
- ทำให้ข้อมูลอ่านง่ายขึ้น
- เช่น ราคาสูงเป็นสีแดง

---

## 🎯 Checklist สำหรับการติดตั้ง

ทำตามลำดับ:

- [ ] 1. สร้าง Google Sheets
- [ ] 2. สร้าง 4 Sheets: Hotels, Users, Filters, ActivityLog
- [ ] 3. ใส่หัวตารางทุก Sheet
- [ ] 4. ใส่ข้อมูลตัวอย่างอย่างน้อย 1 แถว
- [ ] 5. แชร์ไฟล์เป็น "Anyone with the link - Viewer"
- [ ] 6. คัดลอก Spreadsheet ID
- [ ] 7. สร้าง Google Cloud Project
- [ ] 8. เปิดใช้งาน Google Sheets API
- [ ] 9. สร้าง API Key
- [ ] 10. จำกัดการใช้งาน API Key
- [ ] 11. คัดลอก API Key
- [ ] 12. สร้างไฟล์ .env
- [ ] 13. ใส่ SPREADSHEET_ID และ API_KEY
- [ ] 14. Restart server
- [ ] 15. ทดสอบหน้าแรก
- [ ] 16. ทดสอบ Admin Panel
- [ ] 17. ทดสอบเพิ่ม/แก้ไข/ลบข้อมูล

---

## 🎉 สำเร็จ!

ถ้าทำครบทุกขั้นตอน คุณจะได้:
- ✅ เว็บไซต์ที่ดึงข้อมูลจาก Google Sheets
- ✅ แก้ไขข้อมูลได้ผ่าน Admin Panel
- ✅ บันทึกประวัติการแก้ไข
- ✅ Login ด้วย Google Sheets users
- ✅ ใช้งานได้ทั้งมือถือและ PC

---

**หมายเหตุ:** ถ้าติดขัดขั้นตอนไหน ให้บอกผมได้เลยครับ ผมจะช่วยแก้ไขให้! 🚀
