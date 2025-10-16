# Script to convert service-account.json to base64
# For use with Environment Variables in Cloud Platforms

Write-Host "`n=== Service Account to Base64 Converter ===" -ForegroundColor Cyan
Write-Host ""

$serviceAccountPath = "service-account.json"

if (-not (Test-Path $serviceAccountPath)) {
    Write-Host "[ERROR] service-account.json not found!" -ForegroundColor Red
    Write-Host "Please make sure service-account.json exists in the current directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/3] Reading service-account.json..." -ForegroundColor Green
$json = Get-Content $serviceAccountPath -Raw

Write-Host "[2/3] Converting to base64..." -ForegroundColor Green
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [System.Convert]::ToBase64String($bytes)

Write-Host "[3/3] Saving to file..." -ForegroundColor Green

# Save to file
$outputPath = "service-account-base64.txt"
$base64 | Out-File -FilePath $outputPath -Encoding UTF8

Write-Host ""
Write-Host "SUCCESS! Conversion complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Base64 encoded string:" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor DarkGray
Write-Host $base64 -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Saved to: $outputPath" -ForegroundColor Green
Write-Host ""
Write-Host "How to use in Vercel:" -ForegroundColor Cyan
Write-Host "  1. Go to Project Settings -> Environment Variables" -ForegroundColor White
Write-Host "  2. Add new variable:" -ForegroundColor White
Write-Host "     Name: SERVICE_ACCOUNT_BASE64" -ForegroundColor Gray
Write-Host "     Value: (paste the base64 string above)" -ForegroundColor Gray
Write-Host ""
Write-Host "WARNING: Keep this base64 string SECRET!" -ForegroundColor Red
Write-Host "Never commit it to Git or share publicly." -ForegroundColor Yellow
Write-Host ""
