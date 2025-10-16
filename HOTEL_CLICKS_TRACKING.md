# 📊 ระบบติดตามการคลิกการ์ดโรงแรม

## 🎯 ภาพรวม

เพิ่มระบบติดตามการคลิกการ์ดโรงแรมเพื่อวิเคราะห์ความสนใจของผู้ใช้งาน

---

## ✅ สิ่งที่เพิ่มเข้ามา

### 1. **Backend Service** (`services/hotelClicks.js`)

**ฟังก์ชันหลัก:**
- `recordClick(hotelId, ip, userAgent)` - บันทึกการคลิก
- `getHotelClicks(hotelId)` - ดูจำนวนคลิกของโรงแรม
- `getAllClicks()` - ดูจำนวนคลิกทุกโรงแรม
- `getClickStats(period)` - สถิติตามช่วงเวลา (day/week/month/year)
- `getTopClickedHotels(period, sortBy, limit)` - โรงแรมที่ถูกคลิกมากที่สุด
- `getHotelClickDetails(hotelId, period)` - ข้อมูลละเอียดการคลิก

**ข้อมูลที่เก็บ:**
```json
{
  "hotels": {
    "hotel-1": {
      "count": 150,
      "history": [
        {
          "ip": "192.168.1.26",
          "userAgent": "Mozilla/5.0...",
          "timestamp": 1759643807567
        }
      ]
    }
  }
}
```

---

### 2. **API Endpoints** (`server.js`)

#### `POST /api/hotels/:id/click`
บันทึกการคลิกการ์ดโรงแรม

**Request:**
```javascript
POST /api/hotels/hotel-1/click
```

**Response:**
```json
{
  "success": true,
  "clicks": 150
}
```

#### `GET /api/hotels/:id/clicks`
ดูจำนวนคลิกของโรงแรม

**Request:**
```javascript
GET /api/hotels/hotel-1/clicks
```

**Response:**
```json
{
  "success": true,
  "clicks": 150
}
```

#### `GET /api/admin/stats` (Updated)
เพิ่มข้อมูลสถิติการคลิก

**Response เพิ่มเติม:**
```json
{
  "success": true,
  "data": {
    "visits": {...},
    "likes": {...},
    "clicks": {
      "total": 500,
      "byHotel": {
        "hotel-1": 150,
        "hotel-2": 100
      }
    },
    "topClickedHotels": [
      {
        "hotelId": "hotel-1",
        "clicks": 150,
        "totalClicks": 500,
        "recent": 50
      }
    ]
  }
}
```

---

### 3. **Frontend** (`public/js/app.js`)

**ฟังก์ชันใหม่:**
```javascript
async function recordHotelClick(hotelId) {
  // บันทึกการคลิกโดยอัตโนมัติ
  // เรียกใช้เมื่อ:
  // - คลิกที่การ์ดโรงแรม
  // - คลิกปุ่ม "ดูรายละเอียด"
}
```

**การทำงาน:**
1. ผู้ใช้คลิกการ์ดโรงแรม
2. ระบบบันทึกการคลิก (Silent - ไม่รบกวนผู้ใช้)
3. แสดงรายละเอียดโรงแรม
4. ข้อมูลถูกเก็บใน `data/clicks.json`

---

### 4. **Admin Dashboard** (`admin_v2.html`)

**สถิติที่แสดง:**
- 📊 จำนวนผู้เข้าชม
- 🖱️ **จำนวนคลิกการ์ดโรงแรม** ⭐ (ใหม่!)
- 🏨 จำนวนโรงแรม
- ❤️ จำนวนหัวใจ

**ช่วงเวลา:**
- วันนี้
- สัปดาห์นี้
- เดือนนี้
- ปีนี้

---

## 📂 ไฟล์ที่เกี่ยวข้อง

### ไฟล์ใหม่:
- `services/hotelClicks.js` - Service สำหรับจัดการการคลิก
- `data/clicks.json` - ข้อมูลการคลิก (สร้างอัตโนมัติ)

### ไฟล์ที่แก้ไข:
- `server.js` - เพิ่ม API endpoints
- `public/js/app.js` - เพิ่มการบันทึกการคลิก
- `public/js/admin_v2.js` - แสดงสถิติการคลิก

---

## 🚀 วิธีใช้งาน

### สำหรับผู้ใช้ทั่วไป:
1. เปิดหน้าแรก: `http://192.168.1.26:3000`
2. คลิกดูการ์ดโรงแรม
3. ระบบจะบันทึกการคลิกอัตโนมัติ (ไม่รบกวนการใช้งาน)

### สำหรับ Admin:
1. Login เข้า Admin Panel
2. ไปที่หน้า **แผงควบคุม (Dashboard)**
3. ดูสถิติ **คลิกการ์ดโรงแรม**
4. เลือกช่วงเวลา (วัน/สัปดาห์/เดือน/ปี)

---

## 📊 ข้อมูลที่ได้

### 1. **จำนวนคลิกรวม**
- คลิกทั้งหมดในช่วงเวลาที่เลือก

### 2. **คลิกแต่ละโรงแรม**
```json
{
  "hotel-1": 150,
  "hotel-2": 100,
  "hotel-3": 75
}
```

### 3. **โรงแรมยอดนิยม**
- เรียงตามจำนวนคลิกมากที่สุด
- แสดง 10 อันดับแรก

### 4. **ประวัติการคลิก**
- IP address
- User Agent (Browser/Device)
- Timestamp

---

## 🎯 ประโยชน์

### 1. **วิเคราะห์ความสนใจ**
- รู้ว่าโรงแรมไหนได้รับความสนใจ
- เปรียบเทียบระหว่างคลิกกับหัวใจ
- ดูเทรนด์การใช้งาน

### 2. **ปรับปรุงธุรกิจ**
- โรงแรมที่คลิกเยอะ แต่หัวใจน้อย → ต้องปรับปรุง
- โรงแรมที่คลิกน้อย → อาจต้องการโปรโมท
- โรงแรมที่คลิกและหัวใจเยอะ → ยอดนิยมจริง

### 3. **รายงาน**
- สรุปรายวัน/สัปดาห์/เดือน
- แนวโน้มการใช้งาน
- ข้อมูลสำหรับตัดสินใจ

---

## 💾 โครงสร้างข้อมูล

### ไฟล์: `data/clicks.json`

```json
{
  "hotels": {
    "hotel-1": {
      "count": 150,
      "history": [
        {
          "ip": "192.168.1.26",
          "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
          "timestamp": 1759643807567
        },
        {
          "ip": "192.168.1.50",
          "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0...)...",
          "timestamp": 1759644807567
        }
      ]
    },
    "hotel-2": {
      "count": 100,
      "history": [...]
    }
  }
}
```

**คำอธิบาย:**
- `count` - จำนวนคลิกรวม
- `history` - ประวัติการคลิกทั้งหมด
- `ip` - IP address ของผู้คลิก
- `userAgent` - Browser/Device ของผู้คลิก
- `timestamp` - เวลาที่คลิก (milliseconds)

---

## 🔒 ความเป็นส่วนตัว

### ข้อมูลที่เก็บ:
- ✅ IP Address (ไม่มีข้อมูลส่วนบุคคล)
- ✅ User Agent (Browser/Device เท่านั้น)
- ✅ Timestamp

### ไม่เก็บ:
- ❌ ชื่อผู้ใช้
- ❌ อีเมล
- ❌ ข้อมูลส่วนบุคคล

**หมายเหตุ:** เป็นการติดตามพฤติกรรมการใช้งานเพื่อปรับปรุงบริการเท่านั้น

---

## 🎓 ตัวอย่างการใช้งาน

### 1. ดูโรงแรมยอดนิยม
```javascript
// ใน Admin Dashboard
const topHotels = await getTopClickedHotels('month', 'most', 10);
// ได้ 10 โรงแรมที่คลิกมากที่สุดในเดือนนี้
```

### 2. เปรียบเทียบคลิกกับหัวใจ
```javascript
const clicks = stats.clicks.byHotel['hotel-1'];  // 150 คลิก
const likes = stats.likes.byHotel['hotel-1'];    // 50 หัวใจ
const conversion = (likes / clicks * 100);       // 33.3% conversion
```

### 3. วิเคราะห์เทรนด์
- วันจันทร์: 50 คลิก
- วันอังคาร: 75 คลิก
- วันพุธ: 100 คลิก
- วันพฤหัสบดี: 125 คลิก
- วันศุกร์: 200 คลิก ← Peak day!

---

## 🔄 การบำรุงรักษา

### Backup
```bash
# Backup ข้อมูลการคลิก
cp data/clicks.json data/clicks_backup_$(date +%Y%m%d).json
```

### ล้างข้อมูลเก่า
```javascript
// ถ้าต้องการล้างข้อมูลเก่ากว่า 1 ปี
// แก้ไขใน services/hotelClicks.js
```

### ตรวจสอบขนาดไฟล์
```bash
# ดูขนาดไฟล์
ls -lh data/clicks.json

# ถ้าใหญ่เกิน 10MB อาจต้องล้างข้อมูลเก่า
```

---

## 🎉 สรุป

ตอนนี้ระบบมีการเก็บสถิติครบถ้วน:

1. ✅ **ผู้เข้าชม** - จำนวนคนเข้าเว็บ
2. ✅ **คลิกการ์ดโรงแรม** - ความสนใจในแต่ละโรงแรม ⭐
3. ✅ **หัวใจ** - ความพึงพอใจ
4. ✅ **Activity Log** - ประวัติการแก้ไข

**ข้อมูลทั้งหมดแสดงใน Admin Dashboard พร้อมใช้งาน!** 🚀

---

**หมายเหตุ:** หากต้องการฟีเจอร์เพิ่มเติม เช่น:
- กราฟแสดงเทรนด์
- Export ข้อมูลเป็น Excel
- รายงานอัตโนมัติ

สามารถแจ้งได้เลยครับ! 😊
