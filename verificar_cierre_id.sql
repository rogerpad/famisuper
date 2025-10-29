-- ========================================
-- VERIFICACIÓN: Columnas cierre_id creadas
-- ========================================

-- 1. Verificar que las 5 columnas se crearon correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE column_name = 'cierre_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- Esperado: 5 filas
-- tbl_adic_prest, tbl_conteo_billetes_super, tbl_egresos_super, 
-- tbl_flujos_saldo, tbl_ventas_saldo


-- ========================================
-- VERIFICACIÓN: Foreign Keys creados
-- ========================================

-- 2. Verificar Foreign Keys
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'cierre_id'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Esperado: 5 Foreign Keys


-- ========================================
-- VERIFICACIÓN: Índices creados
-- ========================================

-- 3. Verificar índices creados
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname LIKE '%cierre_id%'
  AND schemaname = 'public'
ORDER BY tablename;

-- Esperado: 5 índices


-- ========================================
-- VERIFICACIÓN: Estado de los registros
-- ========================================

-- 4. Ver distribución de registros por estado
SELECT 
  'tbl_egresos_super' as tabla,
  COUNT(CASE WHEN cierre_id IS NOT NULL THEN 1 END) as con_cierre,
  COUNT(CASE WHEN cierre_id IS NULL AND caja_numero IS NOT NULL THEN 1 END) as pendientes_cerrar,
  COUNT(CASE WHEN caja_numero IS NULL THEN 1 END) as sin_caja_antiguos,
  COUNT(*) as total
FROM tbl_egresos_super

UNION ALL

SELECT 
  'tbl_conteo_billetes_super',
  COUNT(CASE WHEN cierre_id IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN cierre_id IS NULL AND caja_numero IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN caja_numero IS NULL THEN 1 END),
  COUNT(*)
FROM tbl_conteo_billetes_super

UNION ALL

SELECT 
  'tbl_flujos_saldo',
  COUNT(CASE WHEN cierre_id IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN cierre_id IS NULL AND caja_numero IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN caja_numero IS NULL THEN 1 END),
  COUNT(*)
FROM tbl_flujos_saldo

UNION ALL

SELECT 
  'tbl_ventas_saldo',
  COUNT(CASE WHEN cierre_id IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN cierre_id IS NULL AND caja_numero IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN caja_numero IS NULL THEN 1 END),
  COUNT(*)
FROM tbl_ventas_saldo

UNION ALL

SELECT 
  'tbl_adic_prest',
  COUNT(CASE WHEN cierre_id IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN cierre_id IS NULL AND caja_numero IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN caja_numero IS NULL THEN 1 END),
  COUNT(*)
FROM tbl_adic_prest;


-- ========================================
-- VERIFICACIÓN: Comentarios en columnas
-- ========================================

-- 5. Ver comentarios de las columnas
SELECT 
  c.table_name,
  c.column_name,
  pgd.description
FROM pg_catalog.pg_statio_all_tables AS st
INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid = st.relid)
INNER JOIN information_schema.columns c ON (
  pgd.objsubid = c.ordinal_position AND
  c.table_schema = st.schemaname AND
  c.table_name = st.relname
)
WHERE c.column_name = 'cierre_id'
  AND st.schemaname = 'public'
ORDER BY c.table_name;


-- ========================================
-- PRUEBA: Registros pendientes por caja
-- ========================================

-- 6. Ver registros pendientes de cerrar (por caja)
-- NOTA: Esta query solo devolverá datos si ya hay registros con caja_numero

SELECT 
  caja_numero,
  COUNT(*) as registros_pendientes
FROM (
  SELECT caja_numero FROM tbl_egresos_super WHERE cierre_id IS NULL AND caja_numero IS NOT NULL
  UNION ALL
  SELECT caja_numero FROM tbl_flujos_saldo WHERE cierre_id IS NULL AND caja_numero IS NOT NULL
  UNION ALL
  SELECT caja_numero FROM tbl_ventas_saldo WHERE cierre_id IS NULL AND caja_numero IS NOT NULL
  UNION ALL
  SELECT caja_numero FROM tbl_conteo_billetes_super WHERE cierre_id IS NULL AND caja_numero IS NOT NULL
  UNION ALL
  SELECT caja_numero FROM tbl_adic_prest WHERE cierre_id IS NULL AND caja_numero IS NOT NULL
) AS todos_pendientes
GROUP BY caja_numero
ORDER BY caja_numero;


-- ========================================
-- INFO: Estructura de una tabla ejemplo
-- ========================================

-- 7. Ver estructura completa de tbl_egresos_super
\d tbl_egresos_super;

-- O en formato SQL estándar:
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tbl_egresos_super'
  AND table_schema = 'public'
ORDER BY ordinal_position;


-- ========================================
-- QUERY EJEMPLO: Reporte de cierres
-- ========================================

-- 8. Ver últimos cierres con estadísticas
SELECT 
  c.id as cierre_id,
  c.caja_numero,
  TO_CHAR(c.fecha_cierre, 'DD/MM/YYYY HH24:MI') as fecha_hora,
  u.nombre || ' ' || u.apellido as usuario,
  c.efectivo_sistema,
  c.efectivo_real,
  c.diferencia,
  
  -- Contar registros asociados
  (SELECT COUNT(*) FROM tbl_egresos_super WHERE cierre_id = c.id) as egresos,
  (SELECT COUNT(*) FROM tbl_flujos_saldo WHERE cierre_id = c.id) as flujos,
  (SELECT COUNT(*) FROM tbl_ventas_saldo WHERE cierre_id = c.id) as ventas,
  (SELECT COUNT(*) FROM tbl_conteo_billetes_super WHERE cierre_id = c.id) as conteos,
  (SELECT COUNT(*) FROM tbl_adic_prest WHERE cierre_id = c.id) as adicionales,
  
  -- Total de registros
  (
    (SELECT COUNT(*) FROM tbl_egresos_super WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_flujos_saldo WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_ventas_saldo WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_conteo_billetes_super WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_adic_prest WHERE cierre_id = c.id)
  ) as total_registros
  
FROM tbl_cierres_super c
LEFT JOIN tbl_usuarios u ON c.usuario_id = u.id
WHERE c.caja_numero IS NOT NULL
ORDER BY c.fecha_cierre DESC
LIMIT 10;
