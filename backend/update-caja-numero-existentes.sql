-- Script para asignar cajaNumero a registros existentes de Additional Loans
-- Ejecutar solo si los registros fueron creados antes de implementar cajaNumero

-- Ver registros sin cajaNumero
SELECT id, usuario_id, acuerdo, monto, activo, caja_numero 
FROM tbl_adic_prest 
WHERE caja_numero IS NULL AND activo = true;

-- OPCIÓN 1: Asignar todos los registros sin caja a Caja 2 (por el usuario actual)
-- Descomentar la siguiente línea si quieres ejecutar:
-- UPDATE tbl_adic_prest SET caja_numero = 2 WHERE id IN (32, 33, 34) AND caja_numero IS NULL;

-- OPCIÓN 2: Asignar según el usuario que los creó
-- Si el usuario 2 (Maria Polanco) debería tenerlos en Caja 2:
-- UPDATE tbl_adic_prest SET caja_numero = 2 WHERE usuario_id = 2 AND caja_numero IS NULL AND activo = true;

-- Verificar después de actualizar
-- SELECT id, usuario_id, acuerdo, monto, activo, caja_numero FROM tbl_adic_prest WHERE id IN (32, 33, 34);
