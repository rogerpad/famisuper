-- ========================================
-- QUERIES ÚTILES: turno_id en Cierres
-- ========================================
-- Fecha: 25 de Octubre, 2024


-- ========================================
-- VERIFICACIÓN: Estructura de la tabla
-- ========================================

-- 1. Ver que la columna turno_id existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tbl_cierres_super'
  AND column_name = 'turno_id';

-- Esperado: 1 fila con data_type = integer, is_nullable = YES


-- ========================================
-- VERIFICACIÓN: Foreign Key
-- ========================================

-- 2. Verificar Foreign Key a tbl_usuarios_turnos
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


-- ========================================
-- VERIFICACIÓN: Índice
-- ========================================

-- 3. Verificar que existe el índice
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'tbl_cierres_super'
  AND indexname = 'idx_cierres_super_turno_id';


-- ========================================
-- CONSULTAS BÁSICAS
-- ========================================

-- 4. Ver últimos cierres con turno_id
SELECT 
  id,
  usuario_id,
  caja_numero,
  turno_id,
  fecha_cierre,
  efectivo_sistema,
  efectivo_real,
  faltante_sobrante
FROM tbl_cierres_super
ORDER BY fecha_cierre DESC
LIMIT 10;


-- ========================================
-- CONSULTAS CON JOIN: Cierre + Turno
-- ========================================

-- 5. Cierres con información completa del turno
SELECT 
  c.id as cierre_id,
  c.fecha_cierre,
  c.caja_numero,
  c.efectivo_sistema,
  c.efectivo_real,
  c.faltante_sobrante,
  
  -- Datos del turno
  t.id as turno_id,
  t.fecha_inicio as turno_inicio,
  t.fecha_fin as turno_fin,
  TO_CHAR(t.fecha_fin - t.fecha_inicio, 'HH24:MI') as duracion_turno,
  
  -- Datos del usuario
  u.nombre || ' ' || u.apellido as usuario,
  u.codigo as codigo_vendedor
  
FROM tbl_cierres_super c
LEFT JOIN tbl_usuarios_turnos t ON c.turno_id = t.id
LEFT JOIN tbl_usuarios u ON t.usuario_id = u.id
WHERE c.caja_numero IS NOT NULL
ORDER BY c.fecha_cierre DESC
LIMIT 20;


-- ========================================
-- REPORTE DETALLADO: Un Cierre Específico
-- ========================================

-- 6. Reporte completo de un cierre con turno y registros
SELECT 
  -- Datos del cierre
  c.id as cierre_id,
  TO_CHAR(c.fecha_cierre, 'DD/MM/YYYY HH24:MI:SS') as fecha_cierre,
  c.caja_numero,
  c.efectivo_inicial,
  c.efectivo_sistema,
  c.efectivo_real,
  c.faltante_sobrante,
  
  -- Datos del turno completo
  t.id as turno_id,
  TO_CHAR(t.fecha_inicio, 'DD/MM/YYYY HH24:MI:SS') as turno_inicio,
  TO_CHAR(t.fecha_fin, 'DD/MM/YYYY HH24:MI:SS') as turno_fin,
  EXTRACT(EPOCH FROM (t.fecha_fin - t.fecha_inicio))/3600 as duracion_horas,
  t.operacion_tipo,
  
  -- Datos del usuario
  u.id as usuario_id,
  u.nombre,
  u.apellido,
  u.codigo,
  
  -- Registros asociados al cierre
  (SELECT COUNT(*) FROM tbl_egresos_super WHERE cierre_id = c.id) as total_egresos,
  (SELECT COALESCE(SUM(total), 0) FROM tbl_egresos_super WHERE cierre_id = c.id) as monto_egresos,
  
  (SELECT COUNT(*) FROM tbl_flujos_saldo WHERE cierre_id = c.id) as total_flujos,
  
  (SELECT COUNT(*) FROM tbl_ventas_saldo WHERE cierre_id = c.id) as total_ventas,
  (SELECT COALESCE(SUM(monto), 0) FROM tbl_ventas_saldo WHERE cierre_id = c.id) as monto_ventas,
  
  (SELECT COUNT(*) FROM tbl_conteo_billetes_super WHERE cierre_id = c.id) as total_conteos,
  
  (SELECT COUNT(*) FROM tbl_adic_prest WHERE cierre_id = c.id) as total_adicionales,
  (SELECT COALESCE(SUM(monto), 0) FROM tbl_adic_prest WHERE cierre_id = c.id) as monto_adicionales
  
FROM tbl_cierres_super c
LEFT JOIN tbl_usuarios_turnos t ON c.turno_id = t.id
LEFT JOIN tbl_usuarios u ON t.usuario_id = u.id
WHERE c.id = (SELECT MAX(id) FROM tbl_cierres_super);
-- Cambiar a un ID específico si lo necesitas


-- ========================================
-- AUDITORÍA: Turnos con y sin Cierre
-- ========================================

-- 7. Ver todos los turnos de Super y si tienen cierre
SELECT 
  t.id as turno_id,
  TO_CHAR(t.fecha_inicio, 'DD/MM/YYYY HH24:MI') as inicio,
  TO_CHAR(t.fecha_fin, 'DD/MM/YYYY HH24:MI') as fin,
  t.caja_numero,
  u.nombre || ' ' || u.apellido as usuario,
  
  -- Ver si tiene cierre asociado
  c.id as cierre_id,
  TO_CHAR(c.fecha_cierre, 'DD/MM/YYYY HH24:MI') as fecha_cierre,
  
  CASE 
    WHEN c.id IS NOT NULL THEN '✅ Con cierre'
    WHEN t.activo = false AND c.id IS NULL THEN '⚠️ Finalizado sin cierre'
    WHEN t.activo = true THEN '🔄 Turno activo'
  END as estado
  
FROM tbl_usuarios_turnos t
LEFT JOIN tbl_usuarios u ON t.usuario_id = u.id
LEFT JOIN tbl_cierres_super c ON c.turno_id = t.id
WHERE t.operacion_tipo = 'super'
  AND t.caja_numero IS NOT NULL
ORDER BY t.fecha_inicio DESC
LIMIT 30;


-- ========================================
-- ESTADÍSTICAS: Por Turno
-- ========================================

-- 8. Estadísticas agrupadas por turno
SELECT 
  t.id as turno_id,
  TO_CHAR(t.fecha_inicio, 'DD/MM/YYYY') as fecha,
  t.caja_numero,
  u.nombre || ' ' || u.apellido as usuario,
  
  -- Datos del cierre
  c.id as cierre_id,
  c.efectivo_sistema,
  c.efectivo_real,
  c.faltante_sobrante,
  
  -- Registros generados
  (SELECT COUNT(*) FROM tbl_egresos_super WHERE cierre_id = c.id) as cant_egresos,
  (SELECT COALESCE(SUM(total), 0) FROM tbl_egresos_super WHERE cierre_id = c.id) as total_egresos,
  
  (SELECT COUNT(*) FROM tbl_ventas_saldo WHERE cierre_id = c.id) as cant_ventas,
  (SELECT COALESCE(SUM(monto), 0) FROM tbl_ventas_saldo WHERE cierre_id = c.id) as total_ventas,
  
  -- Total de registros
  (
    (SELECT COUNT(*) FROM tbl_egresos_super WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_flujos_saldo WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_ventas_saldo WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_conteo_billetes_super WHERE cierre_id = c.id) +
    (SELECT COUNT(*) FROM tbl_adic_prest WHERE cierre_id = c.id)
  ) as total_registros
  
FROM tbl_usuarios_turnos t
LEFT JOIN tbl_usuarios u ON t.usuario_id = u.id
LEFT JOIN tbl_cierres_super c ON c.turno_id = t.id
WHERE t.operacion_tipo = 'super'
  AND c.id IS NOT NULL
ORDER BY t.fecha_inicio DESC
LIMIT 15;


-- ========================================
-- AUDITORÍA: Integridad de Datos
-- ========================================

-- 9. Verificar que cierres nuevos tengan turno_id
SELECT 
  COUNT(*) as total_cierres,
  COUNT(turno_id) as con_turno_id,
  COUNT(*) - COUNT(turno_id) as sin_turno_id,
  ROUND(COUNT(turno_id)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as porcentaje_con_turno
FROM tbl_cierres_super
WHERE fecha_cierre >= CURRENT_DATE - INTERVAL '30 days';


-- 10. Cierres sin turno_id (potencialmente antiguos)
SELECT 
  id,
  usuario_id,
  caja_numero,
  fecha_cierre,
  turno_id
FROM tbl_cierres_super
WHERE turno_id IS NULL
ORDER BY fecha_cierre DESC
LIMIT 10;


-- ========================================
-- TRAZABILIDAD: Del Turno al Registro
-- ========================================

-- 11. Ver toda la cadena: Turno → Cierre → Registros
-- (Para un turno específico)
WITH turno_seleccionado AS (
  SELECT id FROM tbl_usuarios_turnos 
  WHERE operacion_tipo = 'super' 
    AND caja_numero IS NOT NULL
  ORDER BY fecha_inicio DESC 
  LIMIT 1
)
SELECT 
  'TURNO' as tipo,
  t.id,
  TO_CHAR(t.fecha_inicio, 'DD/MM/YYYY HH24:MI') as fecha,
  u.nombre || ' ' || u.apellido as descripcion,
  NULL::numeric as monto,
  'Caja ' || t.caja_numero as detalle
FROM tbl_usuarios_turnos t
JOIN tbl_usuarios u ON t.usuario_id = u.id
WHERE t.id = (SELECT id FROM turno_seleccionado)

UNION ALL

SELECT 
  'CIERRE',
  c.id,
  TO_CHAR(c.fecha_cierre, 'DD/MM/YYYY HH24:MI'),
  'Cierre de caja',
  c.efectivo_real,
  'Faltante/Sobrante: ' || c.faltante_sobrante
FROM tbl_cierres_super c
WHERE c.turno_id = (SELECT id FROM turno_seleccionado)

UNION ALL

SELECT 
  'EGRESO',
  e.id,
  TO_CHAR(e.fecha_egreso, 'DD/MM/YYYY HH24:MI'),
  e.descripcion_egreso,
  e.total,
  'Tipo: ' || COALESCE(tes.nombre, 'N/A')
FROM tbl_egresos_super e
LEFT JOIN tbl_tipo_egreso_super tes ON e.tipo_egreso_id = tes.id
WHERE e.cierre_id = (SELECT id FROM tbl_cierres_super WHERE turno_id = (SELECT id FROM turno_seleccionado))

UNION ALL

SELECT 
  'FLUJO SALDO',
  f.id,
  TO_CHAR(f.fecha, 'DD/MM/YYYY HH24:MI'),
  f.nombre,
  f.saldo_final,
  'Comprado: ' || f.saldo_comprado || ' Vendido: ' || f.saldo_vendido
FROM tbl_flujos_saldo f
WHERE f.cierre_id = (SELECT id FROM tbl_cierres_super WHERE turno_id = (SELECT id FROM turno_seleccionado))

UNION ALL

SELECT 
  'VENTA SALDO',
  v.id,
  TO_CHAR(v.fecha, 'DD/MM/YYYY HH24:MI'),
  'Venta a ' || COALESCE(v.observacion, 'N/A'),
  v.monto,
  'Cantidad: ' || v.cantidad
FROM tbl_ventas_saldo v
WHERE v.cierre_id = (SELECT id FROM tbl_cierres_super WHERE turno_id = (SELECT id FROM turno_seleccionado))

ORDER BY fecha;


-- ========================================
-- REPORTES: Comparativa por Caja
-- ========================================

-- 12. Comparar rendimiento por caja (últimos 7 días)
SELECT 
  c.caja_numero,
  COUNT(c.id) as total_cierres,
  AVG(c.efectivo_sistema) as promedio_sistema,
  AVG(c.efectivo_real) as promedio_real,
  AVG(c.faltante_sobrante) as promedio_diferencia,
  SUM(c.faltante_sobrante) as diferencia_total,
  
  -- Registros promedio por cierre
  AVG((SELECT COUNT(*) FROM tbl_egresos_super e WHERE e.cierre_id = c.id)) as prom_egresos,
  AVG((SELECT COUNT(*) FROM tbl_ventas_saldo v WHERE v.cierre_id = c.id)) as prom_ventas
  
FROM tbl_cierres_super c
WHERE c.fecha_cierre >= CURRENT_DATE - INTERVAL '7 days'
  AND c.caja_numero IS NOT NULL
GROUP BY c.caja_numero
ORDER BY c.caja_numero;


-- ========================================
-- TIMELINE: Eventos de un Día
-- ========================================

-- 13. Ver timeline completo de un día específico
SELECT 
  TO_CHAR(evento_fecha, 'HH24:MI:SS') as hora,
  tipo_evento,
  caja,
  usuario,
  descripcion,
  monto
FROM (
  -- Inicio de turnos
  SELECT 
    t.fecha_inicio as evento_fecha,
    '🟢 Inicio Turno' as tipo_evento,
    t.caja_numero as caja,
    u.nombre || ' ' || u.apellido as usuario,
    'Turno ID: ' || t.id as descripcion,
    NULL::numeric as monto
  FROM tbl_usuarios_turnos t
  JOIN tbl_usuarios u ON t.usuario_id = u.id
  WHERE DATE(t.fecha_inicio) = CURRENT_DATE
    AND t.operacion_tipo = 'super'
  
  UNION ALL
  
  -- Cierres
  SELECT 
    c.fecha_cierre,
    '🔴 Cierre' as tipo_evento,
    c.caja_numero,
    u.nombre || ' ' || u.apellido,
    'Cierre ID: ' || c.id || ' | Turno: ' || c.turno_id,
    c.efectivo_real
  FROM tbl_cierres_super c
  JOIN tbl_usuarios_turnos t ON c.turno_id = t.id
  JOIN tbl_usuarios u ON t.usuario_id = u.id
  WHERE DATE(c.fecha_cierre) = CURRENT_DATE
  
  UNION ALL
  
  -- Fin de turnos
  SELECT 
    t.fecha_fin,
    '⚫ Fin Turno' as tipo_evento,
    t.caja_numero,
    u.nombre || ' ' || u.apellido,
    'Turno ID: ' || t.id,
    NULL::numeric
  FROM tbl_usuarios_turnos t
  JOIN tbl_usuarios u ON t.usuario_id = u.id
  WHERE DATE(t.fecha_fin) = CURRENT_DATE
    AND t.operacion_tipo = 'super'
) eventos
ORDER BY evento_fecha;


-- ========================================
-- VERIFICACIÓN: Después de Crear Cierre
-- ========================================

-- 14. Verificar último cierre creado
SELECT 
  c.id as cierre_id,
  c.turno_id,
  c.caja_numero,
  c.usuario_id,
  c.fecha_cierre,
  
  -- Verificar que turno existe
  t.id as turno_existe,
  t.fecha_inicio,
  t.activo as turno_activo,
  
  -- Usuario
  u.nombre || ' ' || u.apellido as usuario
  
FROM tbl_cierres_super c
LEFT JOIN tbl_usuarios_turnos t ON c.turno_id = t.id
LEFT JOIN tbl_usuarios u ON t.usuario_id = u.id
ORDER BY c.id DESC
LIMIT 1;

-- Debe mostrar:
-- - cierre_id: ID del cierre creado
-- - turno_id: ID del turno (NO NULL)
-- - turno_existe: Mismo ID (confirma FK funciona)
-- - turno_activo: false (turno debería finalizar al cerrar)
