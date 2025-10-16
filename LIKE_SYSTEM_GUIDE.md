# 📖 คู่มือระบบกดหัวใจ (Like System)

## 🎯 ภาพรวมระบบ

ระบบกดหัวใจถูกออกแบบให้ **1 IP กดได้วันละ 1 ครั้งต่อโรงแรม** โดยนับเวลา **24 ชั่วโมง** จากครั้งล่าสุดที่กด

---

## ✨ ฟีเจอร์หลัก

### ⏰ กดได้วันละ 1 ครั้ง
- ✅ ป้องกันการ spam
- ✅ แต่ละ IP สามารถกดได้อีกครั้งหลังผ่าน 24 ชั่วโมง
- ✅ แสดงเวลาที่เหลือจนกว่าจะกดได้อีกครั้ง

### 🗂️ เก็บข้อมูลใน JSON
```json
{
  "hotels": {
    "003": {
      "count": 4,
      "ips": ["192.168.1.26", "192.168.1.8"],
      "history": [
        {
          "ip": "192.168.1.26",
          "timestamp": 1760112602142
        }
      ]
    }
  }
}
```

### 🧹 ทำความสะอาดอัตโนมัติ
- เก็บประวัติย้อนหลัง **30 วัน**
- ลบข้อมูลเก่าอัตโนมัติ (โอกาส 1% ทุกครั้งที่มีคนกด)

---

## 🔄 ขั้นตอนการทำงาน

### 1️⃣ ผู้ใช้กดหัวใจครั้งแรก

```javascript
POST /api/hotels/003/like
IP: 192.168.1.26
```

**Response:**
```json
{
  "success": true,
  "likes": 5
}
```

✅ **ผลลัพธ์:**
- นับหัวใจเพิ่ม 1
- บันทึก IP และ timestamp ลง history

---

### 2️⃣ ผู้ใช้กดซ้ำภายใน 24 ชั่วโมง

**ตัวอย่าง:**
- กดครั้งแรก: วันนี้ 10:00
- กดซ้ำ: วันนี้ 14:00 (ผ่านไป 4 ชั่วโมง)

**Response:**
```json
{
  "success": false,
  "error": "คุณได้กดหัวใจโรงแรมนี้แล้ววันนี้ กรุณารออีก 20 ชั่วโมง",
  "likes": 5
}
```

❌ **ผลลัพธ์:**
- ไม่นับหัวใจเพิ่ม
- แสดงเวลาที่เหลือ = 24 - 4 = **20 ชั่วโมง**

---

### 3️⃣ ผู้ใช้กดหลังผ่าน 24 ชั่วโมง

**ตัวอย่าง:**
- กดครั้งแรก: วันนี้ 10:00
- กดอีกครั้ง: พรุ่งนี้ 11:00 (ผ่านไป 25 ชั่วโมง)

**Response:**
```json
{
  "success": true,
  "likes": 6
}
```

✅ **ผลลัพธ์:**
- นับหัวใจเพิ่ม 1
- บันทึก timestamp ใหม่

---

## 🧮 สูตรการคำนวณเวลา

### ❌ สูตรเดิม (ผิด)
```javascript
const oneDayAgo = now - (24 * 60 * 60 * 1000);
const timeLeft = oneDayAgo + (24 * 60 * 60 * 1000) - now;
// ผลลัพธ์: 0 เสมอ!
```

### ✅ สูตรใหม่ (ถูกต้อง)
```javascript
const nextLikeTime = recentLike.timestamp + (24 * 60 * 60 * 1000);
const timeLeft = nextLikeTime - now;
const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
```

**ตัวอย่างการคำนวณ:**
```
recentLike.timestamp = 1760112600000 (วันนี้ 10:00)
now = 1760126200000 (วันนี้ 14:00)
nextLikeTime = 1760112600000 + 86400000 = 1760199000000 (พรุ่งนี้ 10:00)
timeLeft = 1760199000000 - 1760126200000 = 72800000 ms
hoursLeft = 72800000 / 3600000 = 20.22 → 21 ชั่วโมง (ปัดขึ้น)
```

---

## 📊 ตัวอย่างการใช้งาน

### Frontend (JavaScript)
```javascript
async function likeHotel(hotelId) {
  try {
    const response = await fetch(`/api/hotels/${hotelId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`❤️ ขอบคุณที่กดหัวใจ! รวม ${data.likes} ครั้ง`);
    } else {
      console.log(`⏰ ${data.error}`);
    }
  } catch (error) {
    console.error('Failed to like:', error);
  }
}
```

### Backend API Endpoint
```javascript
app.post('/api/hotels/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const ip = req.ip || req.connection.remoteAddress;
    
    const result = likesService.likeHotel(id, ip);
    
    if (result.success) {
      res.json({ success: true, likes: result.likes });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to like hotel' 
    });
  }
});
```

---

## 🛠️ ฟังก์ชันสำคัญใน `services/likes.js`

### 1. `likeHotel(hotelId, ip)`
```javascript
/**
 * Like a hotel (one like per IP per day)
 * @param {string} hotelId - Hotel ID
 * @param {string} ip - User IP address
 * @returns {Object} { success, likes, error? }
 */
```

**ขั้นตอน:**
1. โหลดข้อมูล likes จากไฟล์
2. ตรวจสอบว่า IP นี้กดภายใน 24 ชั่วโมงหรือไม่
3. ถ้าใช่ → return error พร้อมเวลาที่เหลือ
4. ถ้าไม่ → เพิ่มหัวใจและบันทึก

### 2. `getHotelLikes(hotelId)`
```javascript
/**
 * Get total likes for a hotel
 * @param {string} hotelId
 * @returns {number} Total likes
 */
```

### 3. `hasLiked(hotelId, ip)`
```javascript
/**
 * Check if IP has liked hotel in the last 24 hours
 * @param {string} hotelId
 * @param {string} ip
 * @returns {boolean}
 */
```

### 4. `cleanupOldHistory(likes)`
```javascript
/**
 * Remove history older than 30 days
 * @param {Object} likes
 * @returns {Object} Cleaned likes object
 */
```

---

## 🔍 การตรวจสอบข้อมูล

### ดูข้อมูล Likes ทั้งหมด
```bash
cat data/likes.json
```

### ตรวจสอบว่า IP กดไปแล้วหรือไม่
```javascript
const hasLiked = likesService.hasLiked('003', '192.168.1.26');
console.log(hasLiked); // true or false
```

### ดูสถิติ Likes
```javascript
const stats = likesService.getLikeStats('day'); // day, week, month, year, all
console.log(stats);
// {
//   total: 10,
//   byHotel: {
//     '001': 3,
//     '003': 7
//   }
// }
```

---

## 🎨 UI/UX แนะนำ

### แสดงสถานะปุ่มหัวใจ
```javascript
// ตรวจสอบว่ากดไปแล้วหรือไม่
const hasLiked = await checkIfLiked(hotelId);

if (hasLiked) {
  button.classList.add('liked');
  button.disabled = true;
  button.innerHTML = '❤️ กดแล้ว';
} else {
  button.classList.remove('liked');
  button.disabled = false;
  button.innerHTML = '🤍 กดหัวใจ';
}
```

### แสดงข้อความเวลาที่เหลือ
```javascript
if (!result.success && result.error.includes('กรุณารออีก')) {
  const hours = result.error.match(/\d+/)[0];
  showToast(`⏰ ${result.error}`, 'warning');
}
```

---

## 🐛 การแก้ปัญหา

### ปัญหา: แสดง "กรุณารออีก 0 ชั่วโมง"
**สาเหตุ:** สูตรคำนวณเวลาผิด

**วิธีแก้:**
```javascript
// ❌ ผิด
const timeLeft = oneDayAgo + (24 * 60 * 60 * 1000) - now;

// ✅ ถูก
const nextLikeTime = recentLike.timestamp + (24 * 60 * 60 * 1000);
const timeLeft = nextLikeTime - now;
```

### ปัญหา: ไฟล์ `likes.json` ใหญ่เกินไป
**วิธีแก้:**
1. ระบบทำความสะอาดอัตโนมัติทุก 100 ครั้ง
2. หรือใช้คำสั่งด้วยตนเอง:
```javascript
const likes = likesService.loadLikes();
const cleaned = likesService.cleanupOldHistory(likes);
likesService.saveLikes(cleaned);
```

### ปัญหา: IP Address ไม่ถูกต้อง
**วิธีแก้:**
```javascript
// ตรวจสอบ IP
const ip = req.ip || 
           req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress;
console.log('User IP:', ip);
```

---

## 📈 สถิติและการวิเคราะห์

### ดูโรงแรมยอดนิยม
```javascript
const topHotels = likesService.getTopHotels('week', 'most');
console.log(topHotels);
// [
//   { hotelId: '003', likes: 15, totalLikes: 50, recent: 15 },
//   { hotelId: '001', likes: 10, totalLikes: 30, recent: 10 }
// ]
```

### ดูสถิติแบบกำหนดเอง
```javascript
// ดูสถิติ 7 วันที่แล้ว
const stats = likesService.getLikeStats('week');

// ดูสถิติทั้งหมด
const allStats = likesService.getLikeStats('all');
```

---

## 🔒 ความปลอดภัย

### ป้องกัน Spam
✅ จำกัด 1 ครั้ง/IP/วัน  
✅ ใช้ IP Address เป็นตัวระบุ  
✅ บันทึก timestamp ทุกครั้ง

### ป้องกัน Manipulation
✅ ข้อมูลเก็บใน Server (ไม่ใช้ localStorage)  
✅ ตรวจสอบจาก history ไม่ใช่ array `ips` อย่างเดียว  
✅ ทำความสะอาดข้อมูลเก่าเพื่อลด payload

---

## 🚀 การปรับปรุงในอนาคต

### 🔮 ฟีเจอร์ที่อาจเพิ่ม:

1. **ระบบ Unlike**
   ```javascript
   app.post('/api/hotels/:id/unlike', ...)
   ```

2. **กดได้หลายโรงแรม**
   - ตอนนี้: 1 IP กดได้วันละ 1 ครั้ง/โรงแรม ✅
   - อนาคต: จำกัดรวม 10 โรงแรม/วัน

3. **Real-time Updates**
   - ใช้ WebSocket
   - อัปเดตจำนวนหัวใจแบบ real-time

4. **Analytics Dashboard**
   - กราฟแสดงการเพิ่มขึ้นของหัวใจ
   - Top 10 โรงแรมยอดนิยม

---

## 📞 ติดต่อ

หากพบปัญหาหรือต้องการปรับปรุง กรุณาแจ้งที่:
- GitHub Issues
- Email: support@example.com

---

**เวอร์ชัน:** 2.0  
**อัปเดตล่าสุด:** October 10, 2025  
**ผู้พัฒนา:** AI Assistant 🤖
