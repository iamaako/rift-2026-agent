@echo off
REM RIFT 2026 - Quick Start Script for Windows
REM This script sets up and runs both backend and frontend

echo.
echo 🚀 RIFT 2026 - Autonomous CI/CD Healing Agent
echo ==============================================
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed. Please install Python 3.11+
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm
    exit /b 1
)

echo ✅ All prerequisites met
echo.

REM Setup backend
echo 🔧 Setting up backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -q -r requirements.txt

if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
    echo ⚠️  IMPORTANT: Edit backend\.env and add your GEMINI_API_KEY
    echo    Get your key from: https://makersuite.google.com/app/apikey
    echo.
)

echo ✅ Backend setup complete
echo.

REM Setup frontend
echo 🔧 Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

if not exist ".env" (
    echo Creating frontend .env file...
    echo VITE_API_URL=http://localhost:8000 > .env
)

echo ✅ Frontend setup complete
echo.

REM Start services
echo 🚀 Starting services...
echo.

cd ..

REM Start backend
echo Starting backend on http://localhost:8000...
cd backend
start "RIFT Backend" cmd /k "venv\Scripts\activate.bat && python main.py"
cd ..

REM Wait for backend
echo Waiting for backend to be ready...
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend on http://localhost:5173...
cd frontend
start "RIFT Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ All services started!
echo.
echo 📍 URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo ⚠️  IMPORTANT: Make sure you've set GEMINI_API_KEY in backend\.env
echo.
echo Press any key to stop all services...
pause >nul

REM Stop services
taskkill /FI "WindowTitle eq RIFT Backend*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq RIFT Frontend*" /T /F >nul 2>nul

echo.
echo ✅ All services stopped
