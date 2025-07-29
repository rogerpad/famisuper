-- Script para reiniciar turnos (eliminar hora_inicio y hora_fin)
-- Puedes ejecutar este script directamente en tu gestor de base de datos

-- 1. Ver los turnos actuales
SELECT id, nombre, hora_inicio, hora_fin, activo FROM tbl_turnos;

-- 2. Reiniciar un turno específico (reemplaza el ID 2 con el ID del turno que quieras reiniciar)
UPDATE tbl_turnos
SET hora_inicio = NULL, hora_fin = NULL, activo = false
WHERE id = 2;

-- 3. Reiniciar todos los turnos (¡Cuidado! Esto reiniciará TODOS los turnos)
-- UPDATE tbl_turnos
-- SET hora_inicio = NULL, hora_fin = NULL, activo = false;

-- 4. Verificar los cambios
SELECT id, nombre, hora_inicio, hora_fin, activo FROM tbl_turnos;
