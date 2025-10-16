# Script สำหรับแปลง service-account.json เป็น base64
# สำหรับใช้กับ Environment Variables ใน Cloud Platforms

Write-Host "`n=== Service Account to Base64 Converter ===" -ForegroundColor Cyan
Write-Host ""

$serviceAccountPath = "service-account.json"

if (-not (Test-Path $serviceAccountPath)) {
    Write-Host "❌ Error: service-account.json not found!" -ForegroundColor Red
    Write-Host "Please make sure service-account.json exists in the current directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Reading service-account.json..." -ForegroundColor Green
$json = Get-Content $serviceAccountPath -Raw

Write-Host "🔄 Converting to base64..." -ForegroundColor Green
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [System.Convert]::ToBase64String($bytes)

Write-Host ""
Write-Host "✅ Conversion successful!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Base64 encoded string (copy this):" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host $base64 -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Save to file
$outputPath = "service-account-base64.txt"
$base64 | Out-File -FilePath $outputPath -Encoding UTF8
Write-Host "💾 Saved to: $outputPath" -ForegroundColor Green

Write-Host ""
Write-Host "📝 How to use:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  For Vercel:" -ForegroundColor White
Write-Host "    1. Go to Project Settings → Environment Variables" -ForegroundColor Gray
Write-Host "    2. Add new variable:" -ForegroundColor Gray
Write-Host "       Name: SERVICE_ACCOUNT_BASE64" -ForegroundColor Gray
Write-Host "       Value: (paste the base64 string above)" -ForegroundColor Gray
Write-Host ""
Write-Host "  For Railway:" -ForegroundColor White
Write-Host "    1. Go to Variables tab" -ForegroundColor Gray
Write-Host "    2. Add new variable:" -ForegroundColor Gray
Write-Host "       SERVICE_ACCOUNT_BASE64 = (paste the base64 string)" -ForegroundColor Gray
Write-Host ""
Write-Host "  For Render:" -ForegroundColor White
Write-Host "    1. Go to Environment tab" -ForegroundColor Gray
Write-Host "    2. Add new Secret File:" -ForegroundColor Gray
Write-Host "       Key: SERVICE_ACCOUNT_BASE64" -ForegroundColor Gray
Write-Host "       Value: (paste the base64 string)" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Important: Keep this base64 string SECRET!" -ForegroundColor Red
Write-Host "   Never commit it to Git or share publicly." -ForegroundColor Yellow
Write-Host ""
