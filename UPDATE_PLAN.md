# 🔄 แผนการอัปเดต Admin Dashboard

## ✅ สิ่งที่จะทำทีละขั้นตอน

### ขั้นตอนที่ 1: อัปเดต HTML Structure ✓
- [x] เปลี่ยน CSS จาก `admin.css` → `admin_v2.css`
- [ ] เปลี่ยนโครงสร้างจาก Header + Tabs → Sidebar Layout
- [ ] เพิ่ม Sidebar Navigation เหมือน admin_v2
- [ ] เพิ่ม User Profile ใน Sidebar

### ขั้นตอนที่ 2: อัปเดต Dashboard Section
- [ ] ลบส่วนกราฟออก (Chart)
- [ ] เพิ่ม 4 การ์ดสถิติ:
  - ผู้เข้าชมเว็บไซต์
  - คลิกการ์ดโรงแรม
  - โรงแรมทั้งหมด
  - หัวใจทั้งหมด
- [ ] เพิ่มส่วน "กิจกรรมล่าสุด" (Real-time Activity Feed)
- [ ] เพิ่มปุ่มเลือกช่วงเวลา (วัน/สัปดาห์/เดือน/ปี)

### ขั้นตอนที่ 3: อัปเดต JavaScript
- [ ] เพิ่มฟังก์ชัน `loadRecentActivities()` - โหลดกิจกรรมล่าสุด 10 รายการ
- [ ] เพิ่มฟังก์ชัน `displayRecentActivities()` - แสดงกิจกรรมแบบ timeline
- [ ] เพิ่มฟังก์ชัน `navigateTo()` - สำหรับ Sidebar navigation
- [ ] เพิ่มฟังก์ชัน `toggleSidebar()` - เปิด/ปิด Sidebar บนมือถือ
- [ ] แก้ไข `loadStats()` - เพิ่มสถิติคลิกการ์ด + จำนวนโรงแรม
- [ ] เพิ่ม Auto-refresh ทุก 10 วินาที

### ขั้นตอนที่ 4: ทดสอบ
- [ ] Login เข้าระบบ
- [ ] ตรวจสอบ Dashboard แสดงสถิติถูกต้อง
- [ ] ตรวจสอบกิจกรรมล่าสุดแสดงผล
- [ ] ทดสอบ Sidebar บนมือถือ
- [ ] ทดสอบเปลี่ยนช่วงเวลา (วัน/สัปดาห์/เดือน/ปี)
- [ ] ทดสอบ Real-time update

## 📊 Dashboard Layout ใหม่

```html
<div class="dashboard-page">
    <!-- Period Selector -->
    <div class="period-tabs">
        <button class="active">รายวัน</button>
        <button>สัปดาห์</button>
        <button>เดือน</button>
        <button>ปี</button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
        <div class="stat-card">
            <i class="fas fa-users"></i>
            <div class="stat-value">1,234</div>
            <div class="stat-label">ผู้เข้าชมเว็บไซต์</div>
        </div>
        
        <div class="stat-card">
            <i class="fas fa-mouse-pointer"></i>
            <div class="stat-value">567</div>
            <div class="stat-label">คลิกการ์ดโรงแรม</div>
        </div>
        
        <div class="stat-card">
            <i class="fas fa-hotel"></i>
            <div class="stat-value">42</div>
            <div class="stat-label">โรงแรมทั้งหมด</div>
        </div>
        
        <div class="stat-card">
            <i class="fas fa-heart"></i>
            <div class="stat-value">890</div>
            <div class="stat-label">หัวใจทั้งหมด</div>
        </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-activities">
        <h3><i class="fas fa-clock"></i> กิจกรรมล่าสุด</h3>
        <div class="activity-feed" id="activityFeed">
            <!-- JavaScript จะเพิ่ม items ตรงนี้ -->
        </div>
    </div>
</div>
```

## 🎨 Activity Item Template

```html
<div class="activity-item">
    <div class="activity-icon like">
        <i class="fas fa-heart"></i>
    </div>
    <div class="activity-content">
        <div class="activity-text">
            <strong>นาย สมชาย</strong> กดหัวใจ
            <span class="activity-target">"โรงแรมดวงแก้ว"</span>
        </div>
        <div class="activity-time">2 นาทีที่แล้ว</div>
    </div>
</div>
```

## 🔧 ไอคอนตามประเภทกิจกรรม

```javascript
const activityIcons = {
    'เพิ่มโรงแรม': { icon: 'fa-plus-circle', class: 'add' },
    'แก้ไขโรงแรม': { icon: 'fa-edit', class: 'edit' },
    'ลบโรงแรม': { icon: 'fa-trash', class: 'delete' },
    'เพิ่มตัวกรอง': { icon: 'fa-filter', class: 'add' },
    'แก้ไขตัวกรอง': { icon: 'fa-edit', class: 'edit' },
    'ลบตัวกรอง': { icon: 'fa-times-circle', class: 'delete' },
    'กดหัวใจ': { icon: 'fa-heart', class: 'like' }
};
```

## 📱 Responsive Design

- Desktop: Sidebar ซ้าย + Content ขวา
- Mobile: Sidebar ซ่อน + ปุ่ม Hamburger เปิด/ปิด

## 🚀 ลำดับการทำงาน

1. ผมจะแก้ admin.html ให้มีโครงสร้าง Sidebar
2. แก้ admin.js ให้รองรับ Sidebar navigation
3. เพิ่มฟังก์ชันโหลดกิจกรรมล่าสุด
4. ทดสอบทุกอย่างให้ทำงานถูกต้อง

พร้อมเริ่มแก้ไขครับ!
