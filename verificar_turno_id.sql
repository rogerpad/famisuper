-- ========================================
-- VERIFICACIÓN RÁPIDA: turno_id en Cierres
-- ========================================
-- Fecha: 25 de Octubre, 2024

-- 1. Verificar que la columna existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tbl_cierres_super'
  AND column_name = 'turno_id';

-- Esperado: 1 fila con data_type = integer, is_nullable = YES


-- 2. Verificar Foreign Key
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tbl_cierres_super' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'turno_id';

-- Esperado: fk_cierre_super_turno → tbl_usuarios_turnos(id)


-- 3. Verificar índice
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'tbl_cierres_super'
  AND indexname = 'idx_cierres_super_turno_id';

-- Esperado: 1 fila con el índice


-- 4. Ver estructura completa de tbl_cierres_super
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tbl_cierres_super'
ORDER BY ordinal_position;

-- Verificar que aparezcan: caja_numero, turno_id, cierre_id (este último no, es en otras tablas)


-- 5. Ver todos los Foreign Keys de tbl_cierres_super
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tbl_cierres_super' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY kcu.column_name;

-- Esperado: 
-- usuario_id → tbl_usuarios(id)
-- turno_id → tbl_usuarios_turnos(id) ← NUEVO
