# 📋 โครงสร้างโปรเจกต์ Koh Larn Hotel Search Engine

## 🎯 สรุปโปรเจกต์

เว็บไซต์ search engine สำหรับโรงแรมในเกาะล้าน พร้อมระบบแผงควบคุมแอดมินและการเชื่อมต่อ Google Sheets

## 📁 โครงสร้างไฟล์

```
kohlarn/
│
├── 📄 server.js                    # Express server หลัก
├── 📄 package.json                 # Dependencies และ scripts
├── 📄 .env                         # Environment variables (ห้ามcommit)
├── 📄 .env.example                 # ตัวอย่าง environment variables
├── 📄 .gitignore                   # Git ignore rules
│
├── 📄 README.md                    # คู่มือใช้งานฉบับสมบูรณ์
├── 📄 QUICKSTART.md                # คู่มือเริ่มต้นด่วน
├── 📄 GOOGLE_SHEETS_SETUP.md       # วิธีตั้งค่า Google Sheets
├── 📄 SAMPLE_DATA.md               # ตัวอย่างข้อมูล
├── 📄 PROJECT_STRUCTURE.md         # ไฟล์นี้
│
├── 📄 install.bat                  # สคริปต์ติดตั้ง Windows
├── 📄 install.sh                   # สคริปต์ติดตั้ง Linux/Mac
│
├── 📁 public/                      # Static files
│   ├── 📄 index.html               # หน้าแรก (Search Engine)
│   ├── 📄 admin.html               # หน้าแผงควบคุมแอดมิน
│   │
│   ├── 📁 css/
│   │   ├── 📄 style.css            # สไตล์หน้าแรก
│   │   └── 📄 admin.css            # สไตล์แผงควบคุม
│   │
│   └── 📁 js/
│       ├── 📄 app.js               # JavaScript หน้าแรก
│       └── 📄 admin.js             # JavaScript แผงควบคุม
│
├── 📁 services/                    # Business logic services
│   ├── 📄 googleSheets.js          # เชื่อมต่อ Google Sheets API
│   ├── 📄 stats.js                 # ระบบสถิติการเข้าชม
│   └── 📄 likes.js                 # ระบบกดหัวใจ
│
├── 📁 data/                        # Local data storage
│   ├── 📄 stats.json               # ข้อมูลสถิติการเข้าชม
│   └── 📄 likes.json               # ข้อมูลการกดหัวใจ
│
└── 📁 node_modules/                # Dependencies (auto-generated)
```

## 🔧 ไฟล์สำคัญและหน้าที่

### Backend Files

#### 1. `server.js`
- Express server หลัก
- กำหนด API endpoints
- Middleware configuration
- Rate limiting
- Stats tracking

**API Endpoints:**
```javascript
// Public APIs
GET  /api/hotels              // ดึงข้อมูลโรงแรมทั้งหมด
POST /api/hotels/:id/like     // กดหัวใจโรงแรม
GET  /api/hotels/:id/likes    // ดูจำนวนหัวใจ

// Admin APIs
POST   /api/admin/login          // เข้าสู่ระบบ
GET    /api/admin/stats          // ดูสถิติ
POST   /api/admin/hotels         // เพิ่มโรงแรม
PUT    /api/admin/hotels/:id     // แก้ไขโรงแรม
DELETE /api/admin/hotels/:id     // ลบโรงแรม
```

#### 2. `services/googleSheets.js`
- เชื่อมต่อ Google Sheets API
- CRUD operations สำหรับโรงแรม
- ดึงรหัสผ่านแอดมิน
- รองรับทั้ง API Key และ Service Account

**Functions:**
```javascript
getHotels()           // ดึงข้อมูลโรงแรมทั้งหมด
getAdminPassword()    // ดึงรหัสผ่านแอดมิน
addHotel(hotel)       // เพิ่มโรงแรม
updateHotel(id, hotel)// แก้ไขโรงแรม
deleteHotel(id)       // ลบโรงแรม
```

#### 3. `services/stats.js`
- บันทึกสถิติการเข้าชม
- นับผู้เข้าชมทั้งหมดและ unique
- จัดกลุ่มตามช่วงเวลา
- Real-time visitors

**Functions:**
```javascript
recordVisit(ip)           // บันทึกการเข้าชม
getVisitStats(period)     // ดูสถิติตามช่วงเวลา
getRealtimeVisits()       // ดูผู้เข้าชมแบบ real-time
```

#### 4. `services/likes.js`
- ระบบกดหัวใจโรงแรม
- จำกัด 1 IP ต่อ 1 โรงแรม
- สถิติการกดหัวใจ
- Top hotels

**Functions:**
```javascript
likeHotel(hotelId, ip)    // กดหัวใจ
getHotelLikes(hotelId)    // ดูจำนวนหัวใจ
getAllLikes()             // ดูหัวใจทั้งหมด
getLikeStats(period)      // สถิติการกดหัวใจ
getTopHotels(period, sort)// โรงแรมยอดนิยม
hasLiked(hotelId, ip)     // เช็คว่ากดหัวใจแล้วหรือยัง
```

### Frontend Files

#### 5. `public/index.html`
- หน้าแรก (Search Engine)
- แสดงรายการโรงแรม
- ระบบค้นหาและกรอง
- Modal รายละเอียดโรงแรม

#### 6. `public/admin.html`
- หน้าแผงควบคุมแอดมิน
- ระบบล็อกอิน
- จัดการโรงแรม (CRUD)
- แสดงสถิติ
- กราฟ Chart.js

#### 7. `public/js/app.js`
- Logic หน้าแรก
- Search และ Filter
- Like hotels
- Modal control
- Real-time updates

#### 8. `public/js/admin.js`
- Logic แผงควบคุม
- Authentication
- Hotel management
- Statistics display
- Chart rendering

#### 9. `public/css/style.css`
- สไตล์หน้าแรก
- Responsive design
- Card layouts
- Animations

#### 10. `public/css/admin.css`
- สไตล์แผงควบคุม
- Dashboard layout
- Tables และ Forms
- Stats cards

## 📊 โครงสร้างข้อมูล

### Google Sheets Structure

#### Sheet: "Hotels"
```
Column A: ID                  (hotel-1, hotel-2, ...)
Column B: ชื่อโรงแรม (ไทย)
Column C: ชื่อโรงแรม (English)
Column D: รูปภาพ (URLs คั่นด้วย comma)
Column E: ราคาเริ่มต้น
Column F: ตัวกรอง (คั่นด้วย comma)
Column G: รองรับผู้เข้าพัก (คน)
Column H: ชื่อธนาคาร
Column I: ชื่อบัญชี
Column J: เลขบัญชี
Column K: เบอร์โทร
Column L: Facebook URL
Column M: Line ID
Column N: Website URL
Column O: Google Maps URL
Column P: Google Maps Embed Code
```

#### Sheet: "Admin"
```
A1: username  | B1: password
A2: admin     | B2: your_password_here
```

### Local Data Files

#### `data/stats.json`
```json
{
  "visits": [
    {
      "ip": "xxx.xxx.xxx.xxx",
      "timestamp": 1696512000000
    }
  ]
}
```

#### `data/likes.json`
```json
{
  "hotels": {
    "hotel-1": {
      "count": 10,
      "ips": ["xxx.xxx.xxx.xxx"],
      "history": [
        {
          "ip": "xxx.xxx.xxx.xxx",
          "timestamp": 1696512000000
        }
      ]
    }
  }
}
```

## 🔐 Environment Variables

```env
GOOGLE_SHEET_ID      # Google Sheet ID
GOOGLE_API_KEY       # Google API Key
PORT                 # Server port (default: 3000)
NODE_ENV             # development/production
```

## 🚀 การขยายระบบ

โครงสร้างรองรับการเพิ่มฟีเจอร์ใหม่:

### เพิ่ม Service ใหม่
```
services/
├── booking.js        # ระบบจอง
├── reviews.js        # ระบบรีวิว
├── notifications.js  # ระบบแจ้งเตือน
└── payments.js       # ระบบชำระเงิน
```

### เพิ่ม API Endpoint
แก้ไขไฟล์ `server.js`:
```javascript
app.post('/api/bookings', async (req, res) => {
  // Your booking logic
});
```

### เพิ่ม Frontend Page
```
public/
├── booking.html      # หน้าจอง
└── js/
    └── booking.js    # Logic จอง
```

## 📦 Dependencies

### Production
- **express** - Web framework
- **googleapis** - Google Sheets API
- **dotenv** - Environment variables
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers

### Development
- **nodemon** - Auto-reload server

## 🎨 Design Patterns

### 1. Service Layer Pattern
- แยก business logic ออกจาก routes
- แต่ละ service จัดการ feature เฉพาะ

### 2. MVC-like Structure
- Models: Google Sheets
- Views: HTML files
- Controllers: Express routes + Services

### 3. API-First Approach
- Frontend เป็น static files
- Communication ผ่าน RESTful API

## 🔒 Security Features

- ✅ Rate limiting (100 requests/15 min)
- ✅ Helmet.js security headers
- ✅ CORS enabled
- ✅ IP-based like limitation
- ✅ Admin password from Google Sheets
- ✅ Environment variables for secrets

## 📈 Performance Considerations

- ✅ Static file serving
- ✅ Efficient Google Sheets API calls
- ✅ JSON file caching for stats
- ✅ Client-side filtering
- ✅ Lazy loading images

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Search functionality
- [ ] Filter options
- [ ] Like button (IP restriction)
- [ ] Admin login
- [ ] CRUD operations
- [ ] Statistics display
- [ ] Real-time updates

### API Testing
```bash
# Test get hotels
curl http://localhost:3000/api/hotels

# Test like hotel
curl -X POST http://localhost:3000/api/hotels/hotel-1/like

# Test admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}'
```

## 📝 Maintenance Notes

### Regular Tasks
1. **ตรวจสอบ API quota** - Google Sheets API มีขอบเขตการใช้งาน
2. **Backup data** - สำรอง `data/` folder เป็นประจำ
3. **Update dependencies** - `npm update` เป็นครั้งคราว
4. **Monitor logs** - ตรวจสอบ error logs

### Scaling Considerations
- ใช้ Database จริง (MongoDB, PostgreSQL) แทน JSON files
- เพิ่ม Redis สำหรับ caching
- Load balancer สำหรับ multiple instances
- CDN สำหรับ static files

## 🎯 Future Enhancements

### Phase 2
- [ ] ระบบจองโรงแรม
- [ ] ระบบรีวิวและคะแนน
- [ ] การอัพโหลดรูปภาพ
- [ ] Multi-language support

### Phase 3
- [ ] Mobile app
- [ ] Payment integration
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Real-time chat

---

**โครงสร้างที่ดีคือรากฐานของระบบที่ดี 🏗️**
