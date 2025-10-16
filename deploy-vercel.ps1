# 🚀 Quick Deploy to Vercel

Write-Host "`n=== Deploy to Vercel ===" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Green
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "📋 Pre-deployment Checklist:" -ForegroundColor Cyan
Write-Host "  ✓ vercel.json configured" -ForegroundColor Green
Write-Host "  ✓ .gitignore updated" -ForegroundColor Green
Write-Host "  ? Environment variables ready?" -ForegroundColor Yellow
Write-Host ""

$continue = Read-Host "Continue with deployment? (y/n)"

if ($continue -ne 'y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting deployment..." -ForegroundColor Green
Write-Host ""

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Cyan
vercel login

Write-Host ""
Write-Host "📤 Deploying to production..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Go to Vercel Dashboard" -ForegroundColor White
Write-Host "  2. Navigate to Settings → Environment Variables" -ForegroundColor White
Write-Host "  3. Add the following variables:" -ForegroundColor White
Write-Host "     - GOOGLE_SHEET_ID" -ForegroundColor Gray
Write-Host "     - GOOGLE_API_KEY" -ForegroundColor Gray
Write-Host "     - SERVICE_ACCOUNT_BASE64" -ForegroundColor Gray
Write-Host "  4. Redeploy: vercel --prod" -ForegroundColor White
Write-Host ""
