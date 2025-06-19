@echo off
echo ========================================
echo      Fluffly Email Marketing Platform
echo ========================================
echo.
echo Starting backend server...
cd fluffly-backend
start "Fluffly Backend" cmd /k "node basic-server-prisma.js"
echo Backend server started on port 5000
echo.
echo Starting frontend server...
cd ..
start "Fluffly Frontend" cmd /k "npm run dev"
echo Frontend server starting on port 5173
echo.
echo ========================================
echo Both servers are starting...
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo.
echo Press any key to exit...
pause > nul 