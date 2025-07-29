#!/bin/bash

# Script para ejecutar pruebas de validación de IDs en el frontend

echo "Ejecutando pruebas de validación de IDs en Famisuper..."
echo "======================================================"

# Ejecutar pruebas de utilidades de validación
echo "\n[1/3] Ejecutando pruebas de utilidades de validación..."
npx jest src/utils/validationUtils.test.ts --verbose

# Ejecutar pruebas de validación de API de turnos
echo "\n[2/3] Ejecutando pruebas de validación de API de turnos..."
npx jest src/pages/turnos/__tests__/turnosValidation.test.ts --verbose

# Ejecutar pruebas de validación de componentes de turnos
echo "\n[3/3] Ejecutando pruebas de validación de componentes de turnos..."
npx jest src/pages/turnos/__tests__/turnosComponentsValidation.test.tsx --verbose

echo "\n======================================================"
echo "Pruebas de validación completadas."
