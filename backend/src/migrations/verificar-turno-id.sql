-- Script para verificar registros sin turno_id en tbl_conteo_billetes

-- Verificar si existe la columna turno_id
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tbl_conteo_billetes' 
  AND column_name = 'turno_id';

-- Contar registros sin turno_id (solo ejecutar si la columna existe)
SELECT COUNT(*) AS registros_sin_turno_id 
FROM tbl_conteo_billetes 
WHERE turno_id IS NULL;

-- Ver detalles de registros sin turno_id (solo ejecutar si la columna existe)
SELECT id, usuario_id, fecha, total_general 
FROM tbl_conteo_billetes 
WHERE turno_id IS NULL 
ORDER BY fecha DESC;

-- Script para agregar la columna turno_id si no existe
-- ALTER TABLE tbl_conteo_billetes ADD COLUMN IF NOT EXISTS turno_id BIGINT;

-- Script para migrar datos: asignar turno_id basado en la relación entre usuario y turno
-- Este script asume que existe una relación entre usuario y turno en tbl_usuarios_turnos
-- UPDATE tbl_conteo_billetes b
-- SET turno_id = (
--   SELECT ut.turno_id 
--   FROM tbl_usuarios_turnos ut
--   WHERE ut.usuario_id = b.usuario_id
--   AND ut.activo = true
--   LIMIT 1
-- )
-- WHERE b.turno_id IS NULL;

-- Verificar después de la migración
-- SELECT COUNT(*) AS registros_sin_turno_id_despues 
-- FROM tbl_conteo_billetes 
-- WHERE turno_id IS NULL;
