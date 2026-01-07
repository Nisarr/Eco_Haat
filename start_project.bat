@echo off
echo ==========================================
echo       🌿 Starting Eco Haat Platform 🌿
echo ==========================================

echo.
echo [1/2] Launching Backend Server...
cd backend
if not exist "venv" (
    echo Error: Virtual environment 'venv' not found in backend folder!
    echo Please set it up first:
    echo cd backend
    echo python -m venv venv
    echo venv\Scripts\activate
    echo pip install -r requirements.txt
    pause
    exit
)
start "Eco Haat Backend" cmd /k "call venv\Scripts\activate && python -m uvicorn main:app --reload"
cd ..

echo.
echo [2/2] Launching Frontend Server...
cd frontend
start "Eco Haat Frontend" cmd /k "python -m http.server 5500"
cd ..

echo.
echo ==========================================
echo               ✅ ALL SYSTEMS GO
echo ==========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:5500
echo.
echo Opening Frontend in default browser...
timeout /t 3 >nul
start http://localhost:5500

echo.
echo Keep this window open or close it (servers run in separate windows).
pause
