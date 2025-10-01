-- Script para insertar datos de prueba en la tabla tbl_billetes
-- Ejecutar este script en la base de datos PostgreSQL

-- Verificar si la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tbl_billetes'
    ) THEN
        RAISE EXCEPTION 'La tabla tbl_billetes no existe';
    END IF;
END $$;

-- Insertar datos de prueba
INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
VALUES
    (500, 5, 2500, 2500, true, NOW(), NULL),
    (200, 10, 2000, 2000, true, NOW(), NULL),
    (100, 15, 1500, 1500, true, NOW(), NULL),
    (50, 20, 1000, 1000, true, NOW(), NULL),
    (20, 25, 500, 500, true, NOW(), NULL),
    (10, 30, 300, 300, true, NOW(), NULL),
    (5, 40, 200, 200, true, NOW(), NULL),
    (2, 50, 100, 100, true, NOW(), NULL),
    (1, 100, 100, 100, true, NOW(), NULL);

-- Mostrar los datos insertados
SELECT * FROM tbl_billetes ORDER BY billete DESC;
