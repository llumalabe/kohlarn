@echo off
echo ========================================
echo Cloudinary Configuration Test
echo ========================================
echo.

node -e "require('dotenv').config(); const c = process.env.CLOUDINARY_CLOUD_NAME; const k = process.env.CLOUDINARY_API_KEY; const s = process.env.CLOUDINARY_API_SECRET; console.log('Cloud Name:', c || '❌ NOT SET'); console.log('API Key:', k ? (k.substring(0, 5) + '...' + k.substring(k.length-3)) : '❌ NOT SET'); console.log('API Secret:', s ? (s.substring(0, 5) + '...' + s.substring(s.length-3)) : '❌ NOT SET'); console.log(''); console.log(c && k && s ? '✅ Cloudinary is configured!' : '❌ Cloudinary is NOT configured. Please check .env file');"

echo.
echo ========================================
pause
