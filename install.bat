@echo off
echo ====================================
echo Koh Larn Hotel Search - Installation
echo ====================================
echo.

echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created successfully!
    echo Please edit .env file and add your Google Sheets credentials.
) else (
    echo .env file already exists, skipping...
)

echo.
echo [3/3] Creating data directory...
if not exist data mkdir data
echo Data directory ready!

echo.
echo ====================================
echo Installation completed!
echo ====================================
echo.
echo Next steps:
echo 1. Edit .env file and add your Google API credentials
echo 2. Follow GOOGLE_SHEETS_SETUP.md to set up Google Sheets
echo 3. Run 'npm start' to start the server
echo.
echo For development mode with auto-reload:
echo Run 'npm run dev'
echo.
pause
