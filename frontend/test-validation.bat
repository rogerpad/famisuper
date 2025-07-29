@echo off
echo Ejecutando pruebas de validacion de IDs en Famisuper...
echo ======================================================

rem Ejecutar pruebas de utilidades de validacion
echo.
echo [1/3] Ejecutando pruebas de utilidades de validacion...
call npx jest src/utils/validationUtils.test.ts --verbose

rem Ejecutar pruebas de validacion de API de turnos
echo.
echo [2/3] Ejecutando pruebas de validacion de API de turnos...
call npx jest src/pages/turnos/__tests__/turnosValidation.test.ts --verbose

rem Ejecutar pruebas de validacion de componentes de turnos
echo.
echo [3/3] Ejecutando pruebas de validacion de componentes de turnos...
call npx jest src/pages/turnos/__tests__/turnosComponentsValidation.test.tsx --verbose

echo.
echo ======================================================
echo Pruebas de validacion completadas.
pause
