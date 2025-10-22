@echo off
echo ========================================
echo   Add Cloudinary to Vercel
echo ========================================
echo.

echo Reading Cloudinary credentials from .env file...
for /f "tokens=2 delims==" %%a in ('findstr "CLOUDINARY_CLOUD_NAME" .env') do set CLOUD_NAME=%%a
for /f "tokens=2 delims==" %%a in ('findstr "CLOUDINARY_API_KEY" .env') do set API_KEY=%%a
for /f "tokens=2 delims==" %%a in ('findstr "CLOUDINARY_API_SECRET" .env') do set API_SECRET=%%a

echo.
echo Found credentials:
echo   Cloud Name: %CLOUD_NAME%
echo   API Key: %API_KEY%
echo   API Secret: %API_SECRET%
echo.

echo ========================================
echo Please add these to Vercel manually:
echo ========================================
echo.
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select your project
echo 3. Go to Settings ^> Environment Variables
echo 4. Add these 3 variables:
echo.
echo    Name: CLOUDINARY_CLOUD_NAME
echo    Value: %CLOUD_NAME%
echo    Environment: Production, Preview, Development
echo.
echo    Name: CLOUDINARY_API_KEY
echo    Value: %API_KEY%
echo    Environment: Production, Preview, Development
echo.
echo    Name: CLOUDINARY_API_SECRET
echo    Value: %API_SECRET%
echo    Environment: Production, Preview, Development
echo.
echo 5. Click Save
echo 6. Redeploy: vercel --prod
echo.
echo ========================================
pause
