# 🔧 สคริปต์แก้ไขสิทธิ์ Hotel Owner

# อ่านไฟล์
$content = Get-Content "public\js\admin_v2.js" -Raw -Encoding UTF8

# 1. แก้ไข displayHotelsTable() - ซ่อนปุ่มลบและเปิด/ปิดสถานะสำหรับ Hotel Owner
# ค้นหาส่วนที่สร้าง HTML และเพิ่มเงื่อนไขซ่อนปุ่ม

Write-Host "`n📝 กำลังแก้ไขฟังก์ชัน displayHotelsTable()..." -ForegroundColor Yellow

# เนื่องจาก HTML ในโค้ดซับซ้อนมาก เราจะแก้ไขโดยเพิ่มโค้ด JavaScript หลังสร้าง HTML
# ค้นหาจุดที่สิ้นสุดฟังก์ชัน displayHotelsTable และเพิ่มโค้ดซ่อนปุ่ม

$hotelButtonsHide = @"
    
    // ซ่อนปุ่มสำหรับ hotel_owner
    const userRole = currentUser.role || 'user';
    if (userRole === 'hotel_owner' || userRole === 'hotel-owner') {
        // ซ่อนปุ่มลบและปุ่มเปิด/ปิดสถานะ
        document.querySelectorAll('.hotel-row').forEach(row => {
            // Desktop buttons
            const deleteBtn = row.querySelector('button[onclick*="deleteHotel"]');
            const toggleBtn = row.querySelector('button[onclick*="toggleHotelStatus"]');
            
            if (deleteBtn) deleteBtn.style.display = 'none';
            if (toggleBtn) toggleBtn.style.display = 'none';
            
            // Mobile buttons
            const mobileDeleteBtn = row.querySelector('.mobile-btn-danger-outline');
            const mobileToggleBtn = row.querySelector('.mobile-btn[onclick*="toggleHotelStatus"]');
            
            if (mobileDeleteBtn) mobileDeleteBtn.style.display = 'none';
            if (mobileToggleBtn && mobileToggleBtn.parentElement) {
                // ซ่อนทั้ง group ถ้ามีปุ่มเปิด/ปิด
                mobileToggleBtn.parentElement.style.display = 'none';
            }
        });
        console.log('✅ Hotel owner - Hidden delete and toggle status buttons');
    }
"@

# แทนที่โค้ดหลัง displayHotelsTable
$pattern = '(container\.innerHTML = hotels\.map[\s\S]*?}\)\.join\([''"][\s\S]*?[''"\]\);)'
if ($content -match $pattern) {
    $content = $content -replace $pattern, "`$1$hotelButtonsHide"
    Write-Host "✅ เพิ่มโค้ดซ่อนปุ่มสำหรับ hotel_owner" -ForegroundColor Green
} else {
    Write-Host "⚠️  ไม่พบรูปแบบโค้ดที่ต้องการแก้ไข" -ForegroundColor Yellow
}

# บันทึกไฟล์
$content | Set-Content "public\js\admin_v2.js" -Encoding UTF8 -NoNewline

Write-Host "`n✅ แก้ไขไฟล์เรียบร้อย!`n" -ForegroundColor Green
