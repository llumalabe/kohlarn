# 📋 วิธีเพิ่มสิ่งอำนวยความสะดวก (Amenities) ให้โรงแรม

## 🎯 ภาพรวม
ระบบแสดงสิ่งอำนวยความสะดวกบนการ์ดโรงแรมโดยอัตโนมัติ โดย**เลือกจาก Checkbox**ที่ดึงข้อมูลจาก Filters Sheet

---

## � วิธีการใช้งาน (แบบใหม่ - ง่ายมาก!)

### **ขั้นตอนที่ 1: เพิ่มรายการสิ่งอำนวยความสะดวกก่อน**

1. เปิด Admin Panel: `http://localhost:3000/admin_v2.html`
2. ไปที่เมนู **"สิ่งอำนวยความสะดวก"**
3. กดปุ่ม **"+ เพิ่มสิ่งอำนวยความสะดวก"**
4. กรอกข้อมูล:
   - **ชื่อภาษาไทย**: `Wi-Fi`
   - **ชื่อภาษาอังกฤษ**: `Wi-Fi`
   - **ไอคอน**: `fa-wifi` (เลือกจาก FontAwesome)
   - **สี**: `#667eea` (เลือกจาก Color Picker)
5. กด **"บันทึก"**

**ตัวอย่างรายการที่แนะนำ:**
```
ติดทะเล          | Beachfront           | fa-umbrella-beach | #667eea
รวมอาหารเช้า      | Breakfast Included   | fa-utensils       | #f093fb
ฟรีรถรับส่ง       | Free Shuttle         | fa-bus            | #4facfe
Wi-Fi            | Wi-Fi                | fa-wifi           | #38f9d7
จอดรถฟรี         | Free Parking         | fa-parking        | #43e97b
พูลวิลล่า         | Pool Villa           | fa-swimming-pool  | #30cfd0
มีอ่างอาบน้ำ      | Bathtub              | fa-bath           | #fa709a
โรงยิม           | Gym                  | fa-dumbbell       | #fc466b
สปา              | Spa                  | fa-spa            | #3f5efb
```

### **ขั้นตอนที่ 2: เลือกสิ่งอำนวยความสะดวกให้โรงแรม (ง่ายมาก!)**

#### **วิธีใช้ Checkbox (แนะนำ ✨)**
1. ไปที่เมนู **"จัดการโรงแรม"**
2. กดปุ่ม **"แก้ไข"** ที่โรงแรมที่ต้องการ
3. เลื่อนลงมาที่ส่วน **"สิ่งอำนวยความสะดวก"**
4. **เลือก Checkbox** ที่ต้องการ (เลือกได้หลายอัน)
   ```
   ☑️ 🏖️ ติดทะเล
   ☑️ 📶 Wi-Fi  
   ☐ 🅿️ จอดรถฟรี
   ☑️ 🍴 รวมอาหารเช้า
   ```
5. กดปุ่ม **"บันทึก"**
6. ✅ เสร็จแล้ว! ข้อมูลจะถูกบันทึกลง Column P ใน Google Sheets

#### **วิธีแก้ไขตรง Google Sheets (สำหรับผู้ชำนาญ)**
1. เปิด Google Sheets → แท็บ **"Hotels"**
2. ไปที่ **Column P** (ตัวกรอง)
3. พิมพ์ชื่อสิ่งอำนวยความสะดวก คั่นด้วยเครื่องหมายจุลภาค (,)
   ```
   ติดทะเล, รวมอาหารเช้า, Wi-Fi
   ```
4. บันทึกและรีเฟรชหน้าเว็บ (Ctrl+F5)

---

## 🎨 การแสดงผลบนการ์ดโรงแรม

### **แสดง 3 รายการแรก + ตัวนับ**
```
┌─────────────────────────────┐
│ 🏨 โรงแรมติดทะเลกะหลิม      │
│                             │
│ 💰 1,500 - 3,000 บาท       │
│                             │
│ [🏖️ ติดทะเล] [🍴 อาหารเช้า]│
│ [📶 Wi-Fi] [+2]             │
│                             │
│ #H001        💗 15  รายละเอียด│
└─────────────────────────────┘
```

### **สีและไอคอน**
- แต่ละ Badge จะใช้สีตาม Column F ใน Filters Sheet
- ไอคอนจาก FontAwesome (Column D)
- หากไม่พบในฐานข้อมูล จะใช้สีเริ่มต้น `#667eea` และไอคอน `fa-tag`

---

## 🔍 วิธีตรวจสอบ

### **1. ตรวจสอบ Amenities ที่มีในระบบ**
```powershell
curl http://localhost:3000/api/filters | ConvertFrom-Json | Select-Object -ExpandProperty data | Format-Table nameTh, icon, color
```

### **2. ตรวจสอบโรงแรมที่มี Filters**
```powershell
curl http://localhost:3000/api/hotels | ConvertFrom-Json | Select-Object -ExpandProperty data | Where-Object { $_.filters } | Select-Object nameTh, filters
```

### **3. ทดสอบแสดงผลบนเว็บ**
1. เปิดหน้าหลัก: `http://localhost:3000`
2. ตรวจสอบว่าการ์ดโรงแรมมี Badge สีสันแสดง
3. กดดูรายละเอียดโรงแรม → ตรวจสอบส่วน **"สิ่งอำนวยความสะดวก"**

---

## ⚠️ ข้อควรระวัง

### **1. ชื่อต้องตรงกันทุกตัวอักษร**
```
✅ ถูก:   Hotels Sheet: "ติดทะเล"  |  Filters Sheet: "ติดทะเล"
❌ ผิด:   Hotels Sheet: "ติดทะเล " (เว้นวรรค) | Filters Sheet: "ติดทะเล"
```

### **2. คั่นด้วยจุลภาคและเว้นวรรค**
```
✅ ถูก:   "ติดทะเล, รวมอาหารเช้า, Wi-Fi"
❌ ผิด:   "ติดทะเล;รวมอาหารเช้า;Wi-Fi"
❌ ผิด:   "ติดทะเล,รวมอาหารเช้า,Wi-Fi" (ไม่มีช่องว่างหลังจุลภาค)
```

### **3. ไอคอน FontAwesome**
- ต้องใช้ FontAwesome v6
- รูปแบบ: `fa-icon-name` (ไม่ต้องใส่ `fas` หรือ `fab`)
- ดูไอคอนทั้งหมดที่: https://fontawesome.com/search?o=r&m=free

### **4. รหัสสี (Hex Color)**
- ต้องขึ้นต้นด้วย `#`
- ใช้ 6 หลัก เช่น `#667eea`, `#f093fb`
- สามารถใช้ Color Picker: https://htmlcolorcodes.com/

---

## 🚀 ตัวอย่างการใช้งาน

### **โรงแรมติดทะเลหรู**
```
Hotels Sheet (Column P):
ติดทะเล, พูลวิลล่า, รวมอาหารเช้า, สปา, จอดรถฟรี

แสดงผล:
[🏖️ ติดทะเล] [🏊 พูลวิลล่า] [🍴 รวมอาหารเช้า] [+2]
```

### **โรงแรมเศรษฐกิจ**
```
Hotels Sheet (Column P):
Wi-Fi, จอดรถฟรี, ฟรีรถรับส่ง

แสดงผล:
[📶 Wi-Fi] [🅿️ จอดรถฟรี] [🚌 ฟรีรถรับส่ง]
```

---

## 🛠️ Troubleshooting

### **ไม่แสดง Badge บนการ์ด**
1. ตรวจสอบว่า Column P มีข้อมูล
2. รีเฟรชหน้าเว็บด้วย Ctrl+F5 (Clear cache)
3. ตรวจสอบ Console ว่ามี error หรือไม่

### **Badge แสดงแต่ไม่มีสี/ไอคอน**
1. ตรวจสอบว่าชื่อใน Hotels Sheet ตรงกับ Filters Sheet
2. ตรวจสอบว่า Filters Sheet มีข้อมูล Column D (Icon) และ F (Color)
3. ตรวจสอบว่า Enabled = `true` ใน Filters Sheet

### **แก้ไขแล้วไม่อัพเดท**
1. รอสักครู่ (Google Sheets อาจมี delay)
2. รีสตาร์ท Server: `npm start`
3. Clear browser cache: Ctrl+Shift+Delete

---

## 📚 เอกสารอ้างอิง

- [FILTERS_AMENITIES_GUIDE.md](./FILTERS_AMENITIES_GUIDE.md) - คู่มือการจัดการ Filters/Amenities
- [ACTUAL_GOOGLE_SHEETS_STRUCTURE.md](./ACTUAL_GOOGLE_SHEETS_STRUCTURE.md) - โครงสร้าง Google Sheets
- [FontAwesome Icons](https://fontawesome.com/search?o=r&m=free) - รายการไอคอน
- [HTML Color Codes](https://htmlcolorcodes.com/) - รหัสสี

---

**อัพเดทล่าสุด:** 6 ตุลาคม 2025  
**เวอร์ชัน:** 2.0
