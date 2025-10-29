@echo off
echo ========================================
echo REINICIAR BACKEND - FamiSuper
echo ========================================
echo.

echo 1. Buscando procesos en puerto 4002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4002 ^| findstr LISTENING') do (
    set PID=%%a
    echo    Encontrado proceso con PID: !PID!
    echo 2. Deteniendo proceso...
    taskkill /PID !PID! /F
    echo    ✅ Proceso detenido
)

echo.
echo 3. Esperando 2 segundos...
timeout /t 2 /nobreak > nul

echo.
echo 4. Iniciando backend...
cd backend
start "FamiSuper Backend" cmd /k "npm run start:dev"

echo.
echo ✅ Backend iniciado en nueva ventana
echo ========================================
pause
