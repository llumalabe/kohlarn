# ตัวอย่างข้อมูลสำหรับ Google Sheets

## Sheet 1: "Hotels"

คัดลอกข้อมูลนี้ไปวางใน Google Sheet (แถวแรกคือ Header)

```
ID	ชื่อโรงแรม (ไทย)	ชื่อโรงแรม (English)	รูปภาพ	ราคาเริ่มต้น	ตัวกรอง	รองรับผู้เข้าพัก	ชื่อธนาคาร	ชื่อบัญชี	เลขบัญชี	เบอร์โทร	Facebook	Line	Website	Google Maps URL	Google Maps Embed
hotel-1	เกาะล้าน บีช รีสอร์ท	Koh Larn Beach Resort	https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800, https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800	1800	ติดทะเล, รวมอาหารเช้า, ฟรีรถรับส่ง	2	ธนาคารกสิกรไทย	บริษัท เกาะล้านรีสอร์ท จำกัด	123-4-56789-0	081-234-5678	https://facebook.com/kohlarnbeach	@kohlarnbeach	https://kohlarnbeach.com	https://goo.gl/maps/example1	<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5!2d100.7!3d12.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
hotel-2	พาราไดซ์ วิลล่า	Paradise Villa	https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800, https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800	2500	ติดทะเล, รวมอาหารเช้า, ฟรีรถรับส่ง, พลูวิลล่า, มีอ่างอาบน้ำ	4	ธนาคารไทยพาณิชย์	นายสมชาย ใจดี	987-6-54321-0	082-345-6789	https://facebook.com/paradisevilla	@paradisevilla	https://paradisevilla.com	https://goo.gl/maps/example2	
hotel-3	ซันเซ็ท บังกะโล	Sunset Bungalow	https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800	1200	ฟรีรถรับส่ง, ฟรีมอไซค์	2	ธนาคารกรุงเทพ	นางสาววรรณา สวยงาม	555-5-55555-5	083-456-7890	https://facebook.com/sunsetbungalow	@sunsetbungalow		https://goo.gl/maps/example3	
hotel-4	โอเชี่ยน วิว รีสอร์ท	Ocean View Resort	https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800, https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800	3000	ติดทะเล, รวมอาหารเช้า, ฟรีรถรับส่ง, พลูวิลล่า, มีอ่างอาบน้ำ, โต๊ะพลู	6	ธนาคารกสิกรไทย	บริษัท โอเชี่ยนวิว จำกัด	111-1-11111-1	084-567-8901	https://facebook.com/oceanviewresort	@oceanview	https://oceanview.com	https://goo.gl/maps/example4	
hotel-5	ซีไซด์ เกสต์เฮ้าส์	Seaside Guesthouse	https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?w=800	800	รวมอาหารเช้า	2	ธนาคารกรุงไทย	นายประสิทธิ์ รักเกาะ	222-2-22222-2	085-678-9012				https://goo.gl/maps/example5	
```

## Sheet 2: "Admin"

```
username	password
admin	kohlarn2024
```

---

## วิธีการนำเข้าข้อมูล

### วิธีที่ 1: คัดลอกวาง (Copy-Paste)

1. เลือกข้อมูลด้านบนทั้งหมด (รวม Header)
2. คัดลอก (Ctrl+C)
3. ไปที่ Google Sheet
4. คลิกที่ cell A1
5. วาง (Ctrl+V)

### วิธีที่ 2: พิมพ์ด้วยมือ

ถ้าต้องการข้อมูลจริงของโรงแรมเกาะล้าน:

#### โรงแรมที่ 1
- **ID:** hotel-1
- **ชื่อไทย:** เกาะล้าน บีช รีสอร์ท
- **ชื่ออังกฤษ:** Koh Larn Beach Resort
- **รูปภาพ:** (URL รูปภาพ คั่นด้วย comma)
- **ราคา:** 1800
- **ตัวกรอง:** ติดทะเล, รวมอาหารเช้า, ฟรีรถรับส่ง
- **รองรับ:** 2
- **ธนาคาร:** ธนาคารกสิกรไทย
- **ชื่อบัญชี:** (ชื่อบัญชีจริง)
- **เลขบัญชี:** (เลขบัญชีจริง)
- **เบอร์โทร:** 081-234-5678
- **Facebook:** https://facebook.com/kohlarnbeach
- **Line:** @kohlarnbeach
- **Website:** https://kohlarnbeach.com
- **Map URL:** https://goo.gl/maps/xxxxx
- **Map Embed:** &lt;iframe...&gt;

---

## หมายเหตุ

1. **รูปภาพ:** ใช้ URL จริงของรูปภาพ สามารถอัพโหลดไปที่ Google Drive, Imgur, หรือ Image hosting อื่นๆ
2. **ตัวกรอง:** คั่นด้วย comma (,) ตัวเลือกที่มี:
   - ติดทะเล
   - รวมอาหารเช้า
   - ฟรีรถรับส่ง
   - ฟรีมอไซค์
   - มีอ่างอาบน้ำ
   - พลูวิลล่า
   - โต๊ะพลู
3. **Google Maps Embed:** ไปที่ Google Maps > Share > Embed a map > Copy HTML
4. **รหัสผ่าน:** เปลี่ยนรหัสผ่านใน Sheet "Admin" เป็นรหัสที่ต้องการ

---

## ตัวอย่างการใช้งาน

หลังจากใส่ข้อมูลแล้ว:
1. บันทึก Google Sheet
2. รัน `npm start`
3. เปิด http://localhost:3000
4. จะเห็นโรงแรมทั้งหมดที่ใส่ไว้

---

## Tips สำหรับรูปภาพ

### ใช้ Unsplash (ฟรี)
- https://unsplash.com/s/photos/hotel-beach
- คลิกขวาที่รูป > Copy image address

### ใช้ Google Drive
1. อัพโหลดรูปไปยัง Google Drive
2. คลิกขวา > Get link
3. เปลี่ยน sharing เป็น "Anyone with the link"
4. ใช้ URL ในรูปแบบ: `https://drive.google.com/uc?id=FILE_ID`

### ใช้ Imgur
1. ไปที่ https://imgur.com
2. Upload รูป
3. Copy Direct Link

---

**พร้อมแล้ว! เริ่มใส่ข้อมูลโรงแรมของคุณได้เลย 🏖️**
