-- Script para insertar valores del contador de efectivo en la tabla tbl_billetes
-- Ejecutar este script en la base de datos PostgreSQL

-- Insertar datos de billetes (ajusta los valores según necesites)
INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
VALUES
    -- Billetes de mayor a menor denominación
    (500, 0, 0, 0, true, NOW(), NULL),  -- Billete de 500, ajusta la cantidad según necesites
    (200, 0, 0, 0, true, NOW(), NULL),  -- Billete de 200, ajusta la cantidad según necesites
    (100, 0, 0, 0, true, NOW(), NULL),  -- Billete de 100, ajusta la cantidad según necesites
    (50, 0, 0, 0, true, NOW(), NULL),   -- Billete de 50, ajusta la cantidad según necesites
    (20, 0, 0, 0, true, NOW(), NULL),   -- Billete de 20, ajusta la cantidad según necesites
    (10, 0, 0, 0, true, NOW(), NULL),   -- Billete de 10, ajusta la cantidad según necesites
    (5, 0, 0, 0, true, NOW(), NULL),    -- Billete de 5, ajusta la cantidad según necesites
    (2, 0, 0, 0, true, NOW(), NULL),    -- Billete de 2, ajusta la cantidad según necesites
    (1, 0, 0, 0, true, NOW(), NULL);    -- Billete de 1, ajusta la cantidad según necesites

-- Verificar que los datos se hayan insertado correctamente
SELECT * FROM tbl_billetes ORDER BY billete DESC;
