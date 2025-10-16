# 🎨 ระบบแก้ไขหน้าเว็บไซต์แบบเรียลไทม์

## 📋 สรุปคุณสมบัติ

ระบบนี้ช่วยให้คุณสามารถแก้ไขหน้าเว็บไซต์หน้าแรกได้แบบเรียลไทม์ผ่าน Admin Panel โดยไม่ต้องแก้ไขโค้ด

### ✅ สิ่งที่สามารถแก้ไขได้

1. **ชื่อเว็บไซต์**
   - ภาษาไทย (เช่น "ค้นหาโรงแรมเกาะล้าน")
   - ภาษาอังกฤษ (เช่น "Koh Larn Hotel Search Engine")

2. **สีพื้นหลัง Header**
   - เปลี่ยนสีพื้นหลังของส่วน Header บนสุด

3. **สีพื้นหลังเว็บ (Body Gradient)**
   - สีเริ่มต้น Gradient
   - สีสิ้นสุด Gradient

4. **สีปุ่มตัวกรอง**
   - สีเริ่มต้น Gradient ของปุ่ม "แสดงตัวกรองเพิ่มเติม"
   - สีสิ้นสุด Gradient

5. **สีข้อความบนการ์ดโรงแรม**
   - สีชื่อโรงแรม
   - สีราคา

## 🚀 วิธีการใช้งาน

### ขั้นตอนที่ 1: ตั้งค่า Google Sheets

1. **เปิด Google Sheets** ของคุณ (Spreadsheet ID: `1lrveylO3qD8fZlJWqiyEz3KaRojT3PObzTMqIt1hKNA`)

2. **สร้าง Sheet ใหม่** ชื่อ **"WebSettings"**

3. **ตั้งค่า Header** (แถวที่ 1):
   ```
   | Setting | Value | LastModified | ModifiedBy |
   ```

4. **ใส่ข้อมูลเริ่มต้น** (แถวที่ 2-10):
   
   | Setting | Value | LastModified | ModifiedBy |
   |---------|-------|--------------|------------|
   | site_name_th | ค้นหาโรงแรมเกาะล้าน | 2025-01-09 10:00:00 | System |
   | site_name_en | Koh Larn Hotel Search Engine | 2025-01-09 10:00:00 | System |
   | header_bg_color | #ffffff | 2025-01-09 10:00:00 | System |
   | body_bg_gradient_start | #667eea | 2025-01-09 10:00:00 | System |
   | body_bg_gradient_end | #764ba2 | 2025-01-09 10:00:00 | System |
   | filter_button_bg_start | #667eea | 2025-01-09 10:00:00 | System |
   | filter_button_bg_end | #764ba2 | 2025-01-09 10:00:00 | System |
   | card_hotel_name_color | #2d3436 | 2025-01-09 10:00:00 | System |
   | card_price_color | #0066cc | 2025-01-09 10:00:00 | System |

5. **จัดรูปแบบ Header** (Optional):
   - สีพื้นหลัง: `#667eea` (ม่วงน้ำเงิน)
   - สีตัวอักษร: `#ffffff` (ขาว)
   - ตัวหนา (Bold)

### ขั้นตอนที่ 2: เข้าสู่ระบบ Admin

1. ไปที่ `http://localhost:3000/admin` หรือ `http://192.168.1.26:3000/admin`
2. เข้าสู่ระบบด้วย username และ password
3. ไปที่เมนู **"การจัดการ"** → **"แก้ไขหน้าเว็บไซต์"**

### ขั้นตอนที่ 3: แก้ไขการตั้งค่า

#### แก้ไขชื่อเว็บไซต์
1. พิมพ์ชื่อภาษาไทยในช่อง **"ชื่อภาษาไทย"**
2. พิมพ์ชื่อภาษาอังกฤษในช่อง **"ชื่อภาษาอังกฤษ"**
3. ดูตัวอย่างในส่วน **"ตัวอย่างสีแบบเรียลไทม์"**

#### แก้ไขสีต่างๆ
1. **คลิกที่กล่องสี** หรือ **พิมพ์รหัสสี HEX** (เช่น #667eea)
2. ดูตัวอย่างการเปลี่ยนแปลงแบบเรียลไทม์
3. ปรับสีจนพอใจ

#### บันทึกการเปลี่ยนแปลง
1. คลิกปุ่ม **"บันทึกการเปลี่ยนแปลง"** สีเขียวด้านบน
2. รอจนกว่าจะแสดงข้อความ "✅ บันทึกการตั้งค่าเรียบร้อย"
3. ข้อมูลจะถูกบันทึกลง Google Sheets พร้อมวันที่และผู้แก้ไข

#### รีเซ็ตเป็นค่าเริ่มต้น
- คลิกปุ่ม **"รีเซ็ตเป็นค่าเริ่มต้น"** สีแดง
- ยืนยันการรีเซ็ต
- ค่าทั้งหมดจะกลับเป็นค่าเริ่มต้น (ยังไม่บันทึกลง Google Sheets)

### ขั้นตอนที่ 4: ตรวจสอบผล

1. **ไปที่หน้าแรก**: `http://localhost:3000` หรือ `http://192.168.1.26:3000`
2. **รีเฟรชหน้า** (Ctrl + F5 หรือ Cmd + Shift + R)
3. **ดูการเปลี่ยนแปลง** ชื่อเว็บไซต์และสีต่างๆ จะอัปเดตตามที่ตั้งค่า

## 📁 ไฟล์ที่เกี่ยวข้อง

### Backend Files
- **`services/googleSheets.js`**
  - `getWebSettings()` - ดึงข้อมูลการตั้งค่าจาก Google Sheets
  - `updateWebSettings(settings, modifiedBy)` - อัปเดตการตั้งค่าลง Google Sheets

- **`server.js`**
  - `GET /api/websettings` - API สำหรับดึงการตั้งค่า
  - `POST /api/websettings` - API สำหรับบันทึกการตั้งค่า

### Frontend Files (Admin Panel)
- **`public/admin_v2.html`**
  - หน้า WebSettings (`#websettingsPage`)
  - ฟอร์มแก้ไขการตั้งค่าพร้อม Color Pickers
  - Preview Section แสดงตัวอย่างแบบเรียลไทม์

- **`public/css/admin_v2.css`**
  - Styles สำหรับหน้า WebSettings
  - `.websettings-container`
  - `.settings-section`
  - `.preview-section`
  - Responsive design สำหรับมือถือและ iPad

- **`public/js/admin_v2.js`**
  - `loadWebSettings()` - โหลดการตั้งค่าจาก API
  - `saveWebSettings()` - บันทึกการตั้งค่า
  - `previewChanges()` - แสดงตัวอย่างแบบเรียลไทม์
  - `syncColorPicker()` - ซิงค์ color picker กับ text input
  - `resetToDefaults()` - รีเซ็ตเป็นค่าเริ่มต้น

### Frontend Files (Public Website)
- **`public/index.html`**
  - หน้าแรกของเว็บไซต์
  - รองรับการแสดงผลแบบ dynamic

- **`public/css/style.css`**
  - CSS Variables สำหรับการตั้งค่าสี:
    ```css
    --header-bg-color
    --body-bg-gradient-start
    --body-bg-gradient-end
    --filter-btn-bg-start
    --filter-btn-bg-end
    --card-hotel-name-color
    --card-price-color
    ```

- **`public/js/app.js`**
  - `loadWebSettings()` - ดึงการตั้งค่าจาก API
  - `applyWebSettings()` - นำการตั้งค่ามาใช้กับหน้าเว็บ

## 🎨 ตัวอย่างการใช้ CSS Variables

```css
/* ใน style.css */
:root {
    --header-bg-color: #ffffff;
    --body-bg-gradient-start: #667eea;
    --body-bg-gradient-end: #764ba2;
    /* ... */
}

header {
    background: var(--header-bg-color);
}

body {
    background: linear-gradient(135deg, 
        var(--body-bg-gradient-start) 0%, 
        var(--body-bg-gradient-end) 100%);
}
```

```javascript
// ใน app.js
function applyWebSettings() {
    const root = document.documentElement;
    root.style.setProperty('--header-bg-color', webSettings.header_bg_color);
    root.style.setProperty('--body-bg-gradient-start', webSettings.body_bg_gradient_start);
    // ...
}
```

## 🔍 การทำงานของระบบ

### 1. เมื่อเปิดหน้าเว็บไซต์หน้าแรก (`index.html`)

```
User opens index.html
    ↓
app.js: DOMContentLoaded
    ↓
loadWebSettings()
    ↓
fetch('/api/websettings')
    ↓
server.js: GET /api/websettings
    ↓
googleSheets.js: getWebSettings()
    ↓
Read from "WebSettings" Sheet
    ↓
Return settings to app.js
    ↓
applyWebSettings()
    ↓
Update CSS Variables
    ↓
Page renders with custom colors
```

### 2. เมื่อแก้ไขการตั้งค่าใน Admin Panel

```
User edits settings in admin panel
    ↓
previewChanges() - Live preview
    ↓
User clicks "บันทึก"
    ↓
saveWebSettings()
    ↓
POST /api/websettings with new values
    ↓
server.js: Validate token
    ↓
googleSheets.js: updateWebSettings()
    ↓
Update rows in "WebSettings" Sheet
    ↓
Update LastModified & ModifiedBy
    ↓
Return success
    ↓
Show notification "บันทึกเรียบร้อย"
```

### 3. การอัปเดตหน้าเว็บไซต์

```
User refreshes index.html
    ↓
loadWebSettings() runs again
    ↓
Fetches latest settings from Google Sheets
    ↓
applyWebSettings() with new values
    ↓
Page displays with updated settings
```

## 🎯 ประโยชน์ของระบบ

### ✅ สำหรับ Admin
- **ไม่ต้องแก้โค้ด** - แก้ไขผ่าน UI ง่ายๆ
- **ดูตัวอย่างทันที** - Preview แบบเรียลไทม์ก่อนบันทึก
- **บันทึกประวัติ** - ระบบบันทึกวันที่และผู้แก้ไขอัตโนมัติ
- **รีเซ็ตได้** - กลับไปค่าเริ่มต้นได้ทันที

### ✅ สำหรับผู้ใช้งาน
- **หน้าเว็บไซต์สวยงาม** - สีสันตรงตาม Brand Identity
- **โหลดเร็ว** - ใช้ CSS Variables ไม่ต้องโหลดไฟล์เพิ่ม
- **Responsive** - รองรับทุกอุปกรณ์

### ✅ สำหรับนักพัฒนา
- **Maintainable** - แยกข้อมูลออกจากโค้ด
- **Scalable** - เพิ่มการตั้งค่าใหม่ได้ง่าย
- **Version Control** - Google Sheets เก็บประวัติการแก้ไข

## 🛠️ การเพิ่มการตั้งค่าใหม่

หากต้องการเพิ่มการตั้งค่าใหม่:

### 1. เพิ่มใน Google Sheets
```
| new_setting_name | #value | timestamp | user |
```

### 2. เพิ่มใน HTML Form (admin_v2.html)
```html
<div class="form-group">
    <label for="newSetting">ชื่อการตั้งค่าใหม่</label>
    <input type="color" id="newSetting" oninput="previewChanges()">
</div>
```

### 3. เพิ่มใน JavaScript (admin_v2.js)
```javascript
// ใน loadWebSettings()
document.getElementById('newSetting').value = settings.new_setting_name || '#default';

// ใน saveWebSettings()
new_setting_name: document.getElementById('newSetting').value,

// ใน previewChanges()
document.getElementById('previewElement').style.property = 
    document.getElementById('newSetting').value;
```

### 4. เพิ่มใน CSS Variables (style.css)
```css
:root {
    --new-setting-name: #default;
}

.element {
    property: var(--new-setting-name);
}
```

### 5. เพิ่มใน applyWebSettings() (app.js)
```javascript
root.style.setProperty('--new-setting-name', webSettings.new_setting_name);
```

## 📱 Responsive Design

ระบบรองรับทุกอุปกรณ์:

- **Desktop** (> 1024px) - แสดง 2 คอลัมน์
- **Tablet** (768px - 1024px) - แสดง 2 คอลัมน์
- **Mobile** (< 768px) - แสดง 1 คอลัมน์
- **Extra Small** (< 480px) - ปรับ UI ให้กระชับ

## 🎨 Color Picker Features

- **Visual Color Picker** - เลือกสีด้วยการคลิก
- **HEX Input** - พิมพ์รหัสสี HEX โดยตรง
- **Auto Sync** - Color picker และ text input ซิงค์กันอัตโนมัติ
- **Real-time Preview** - ดูผลทันทีขณะเลือกสี

## 🔐 Security

- **Authentication Required** - ต้อง login ก่อนแก้ไข
- **Token Validation** - ตรวจสอบ token ก่อน save
- **Audit Trail** - บันทึกผู้แก้ไขและวันที่ใน Google Sheets

## 📊 Google Sheets Structure

### WebSettings Sheet

| Column | Type | Description |
|--------|------|-------------|
| A - Setting | Text | ชื่อการตั้งค่า (unique key) |
| B - Value | Text | ค่าของการตั้งค่า (สี/ข้อความ) |
| C - LastModified | DateTime | วันที่แก้ไขล่าสุด |
| D - ModifiedBy | Text | ผู้แก้ไข (nickname) |

### Index Rules
- **Row 1**: Header (Setting, Value, LastModified, ModifiedBy)
- **Row 2+**: Data rows
- **Column A**: Primary key (Setting name)

## 🚀 Performance

- **Caching**: ไม่มี - อัปเดตทันทีทุกครั้ง
- **API Calls**: 
  - 1 call เมื่อโหลดหน้า index.html
  - 1 call เมื่อเข้าหน้า WebSettings
  - 1 call เมื่อบันทึกการเปลี่ยนแปลง
- **Load Time**: ~200-500ms (ขึ้นกับ Google Sheets API)

## ✨ Tips & Tricks

### การเลือกสีที่สวยงาม
- ใช้เครื่องมือ [Coolors.co](https://coolors.co/) สำหรับ Color Palette
- ใช้ Gradient Generator เช่น [CSS Gradient](https://cssgradient.io/)
- ใช้ Color Contrast Checker สำหรับ Accessibility

### การทดสอบ
1. ทดสอบบนหน้าจอขนาดต่างๆ
2. ทดสอบกับสีพื้นหลังทั้งสว่างและมืด
3. ตรวจสอบ Color Contrast สำหรับการอ่าน

### การ Backup
- Google Sheets มี Version History อัตโนมัติ
- ใช้ File → Version history → See version history

## 🐛 Troubleshooting

### ปัญหา: การตั้งค่าไม่อัปเดต
**วิธีแก้**:
1. ตรวจสอบว่าสร้าง Sheet "WebSettings" แล้ว
2. ตรวจสอบการเชื่อมต่อ Google Sheets API
3. Hard refresh หน้าเว็บ (Ctrl + Shift + R)

### ปัญหา: สีไม่แสดงผล
**วิธีแก้**:
1. ตรวจสอบรูปแบบรหัสสี (ต้องเป็น #RRGGBB)
2. ตรวจสอบ Console สำหรับ errors
3. ตรวจสอบว่า CSS Variables ถูก apply

### ปัญหา: ไม่สามารถบันทึกได้
**วิธีแก้**:
1. ตรวจสอบว่า login อยู่
2. ตรวจสอบ service-account.json มี permission write
3. ตรวจสอบ Google Sheets sharing settings

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ Console (F12) สำหรับ error messages
2. ตรวจสอบ Network tab สำหรับ API responses
3. ตรวจสอบ Google Sheets เพื่อดูว่าข้อมูลบันทึกหรือไม่

## 🎉 สรุป

ระบบ WebSettings นี้ช่วยให้คุณสามารถ:
- ✅ แก้ไขชื่อเว็บไซต์แบบเรียลไทม์
- ✅ ปรับสีต่างๆ ได้อย่างยืดหยุ่น
- ✅ ดูตัวอย่างก่อนบันทึก
- ✅ บันทึกประวัติการแก้ไขอัตโนมัติ
- ✅ ไม่ต้องแก้ไขโค้ดเลย

**Happy Customizing! 🎨✨**
