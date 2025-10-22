# Cloudinary to Vercel Environment Variables Setup Script
# ================================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Cloudinary → Vercel Setup Helper" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "❌ ไม่พบไฟล์ .env" -ForegroundColor Red
    Write-Host "กรุณาสร้างไฟล์ .env ก่อน" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 ขั้นตอนการตั้งค่า Cloudinary:" -ForegroundColor Green
Write-Host ""
Write-Host "1️⃣  สมัครบัญชี Cloudinary (ฟรี)" -ForegroundColor White
Write-Host "   👉 https://cloudinary.com/users/register_free" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Login และไปที่ Dashboard" -ForegroundColor White
Write-Host "   👉 https://cloudinary.com/console" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  คัดลอกข้อมูลจาก 'Account Details':" -ForegroundColor White
Write-Host "   - Cloud name" -ForegroundColor Gray
Write-Host "   - API Key" -ForegroundColor Gray
Write-Host "   - API Secret" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for credentials
Write-Host "📝 กรุณาใส่ข้อมูล Cloudinary:" -ForegroundColor Yellow
Write-Host ""

$cloudName = Read-Host "Cloud name (เช่น dxxxxx)"
if ([string]::IsNullOrWhiteSpace($cloudName)) {
    Write-Host "❌ ยกเลิก - ไม่ได้ใส่ Cloud name" -ForegroundColor Red
    exit 1
}

$apiKey = Read-Host "API Key (เช่น 123456789012345)"
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ ยกเลิก - ไม่ได้ใส่ API Key" -ForegroundColor Red
    exit 1
}

$apiSecret = Read-Host "API Secret (เช่น xxxxxxxxxxxxx)"
if ([string]::IsNullOrWhiteSpace($apiSecret)) {
    Write-Host "❌ ยกเลิก - ไม่ได้ใส่ API Secret" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Update .env file
Write-Host "📝 กำลังอัพเดทไฟล์ .env..." -ForegroundColor Yellow

$envContent = Get-Content ".env" -Raw

# Check if Cloudinary vars already exist
if ($envContent -match "CLOUDINARY_CLOUD_NAME") {
    Write-Host "⚠️  พบค่า CLOUDINARY ในไฟล์ .env อยู่แล้ว" -ForegroundColor Yellow
    $overwrite = Read-Host "ต้องการเขียนทับหรือไม่? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "❌ ยกเลิกการอัพเดท .env" -ForegroundColor Red
    } else {
        # Remove old values
        $envContent = $envContent -replace "CLOUDINARY_CLOUD_NAME=.*`n", ""
        $envContent = $envContent -replace "CLOUDINARY_API_KEY=.*`n", ""
        $envContent = $envContent -replace "CLOUDINARY_API_SECRET=.*`n", ""
        
        # Add new values
        $envContent += "`n# Cloudinary Configuration`n"
        $envContent += "CLOUDINARY_CLOUD_NAME=$cloudName`n"
        $envContent += "CLOUDINARY_API_KEY=$apiKey`n"
        $envContent += "CLOUDINARY_API_SECRET=$apiSecret`n"
        
        $envContent | Set-Content ".env" -NoNewline
        Write-Host "✅ อัพเดท .env สำเร็จ" -ForegroundColor Green
    }
} else {
    # Add new values
    $envContent += "`n`n# Cloudinary Configuration`n"
    $envContent += "CLOUDINARY_CLOUD_NAME=$cloudName`n"
    $envContent += "CLOUDINARY_API_KEY=$apiKey`n"
    $envContent += "CLOUDINARY_API_SECRET=$apiSecret`n"
    
    $envContent | Set-Content ".env" -NoNewline
    Write-Host "✅ เพิ่มค่าใน .env สำเร็จ" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Add to Vercel
Write-Host "🚀 กำลังเพิ่ม Environment Variables ลง Vercel..." -ForegroundColor Yellow
Write-Host ""

# Create temp files for vercel env add
$tempCloud = New-TemporaryFile
$tempKey = New-TemporaryFile
$tempSecret = New-TemporaryFile

$cloudName | Set-Content $tempCloud -NoNewline
$apiKey | Set-Content $tempKey -NoNewline
$apiSecret | Set-Content $tempSecret -NoNewline

Write-Host "📤 เพิ่ม CLOUDINARY_CLOUD_NAME..." -ForegroundColor Cyan
Get-Content $tempCloud | vercel env add CLOUDINARY_CLOUD_NAME production preview development

Write-Host "📤 เพิ่ม CLOUDINARY_API_KEY..." -ForegroundColor Cyan
Get-Content $tempKey | vercel env add CLOUDINARY_API_KEY production preview development

Write-Host "📤 เพิ่ม CLOUDINARY_API_SECRET..." -ForegroundColor Cyan
Get-Content $tempSecret | vercel env add CLOUDINARY_API_SECRET production preview development

# Cleanup
Remove-Item $tempCloud
Remove-Item $tempKey
Remove-Item $tempSecret

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ ตั้งค่าเสร็จสมบูรณ์!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 ขั้นตอนถัดไป:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ทดสอบใน Local:" -ForegroundColor White
Write-Host "   .\test-cloudinary.bat" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Redeploy Vercel:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ทดสอบบนเว็บไซต์:" -ForegroundColor White
Write-Host "   - เข้า admin panel" -ForegroundColor Gray
Write-Host "   - อัพโหลดรูปภาพโรงแรม" -ForegroundColor Gray
Write-Host "   - ตรวจสอบ URL เป็น cloudinary.com" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 อ่านเพิ่มเติม: CLOUDINARY_SETUP.md" -ForegroundColor Cyan
Write-Host ""
