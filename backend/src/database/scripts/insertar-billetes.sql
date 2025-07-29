-- Script para insertar datos en la tabla tbl_billetes
-- Este script inserta registros de ejemplo para diferentes denominaciones de billetes

DO $$
DECLARE
    turno_id_actual INT;
    fecha_actual TIMESTAMP;
BEGIN
    -- Obtener un turno_id existente (si existe)
    SELECT id INTO turno_id_actual FROM tbl_turnos ORDER BY id DESC LIMIT 1;
    
    -- Si no hay turnos, usar NULL
    IF turno_id_actual IS NULL THEN
        RAISE NOTICE 'No se encontraron turnos en la base de datos. Se usará NULL para turno_id.';
    ELSE
        RAISE NOTICE 'Se usará el turno_id: %', turno_id_actual;
    END IF;
    
    -- Establecer fecha actual
    fecha_actual := NOW();
    
    -- Insertar registros para diferentes denominaciones de billetes
    -- Billete de L.1
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (1, 10, 10, 10, true, fecha_actual, turno_id_actual);
    
    -- Billete de L.2
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (2, 15, 30, 30, true, fecha_actual, turno_id_actual);
    
    -- Billete de L.5
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (5, 20, 100, 100, true, fecha_actual, turno_id_actual);
    
    -- Billete de L.10
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (10, 25, 250, 250, true, fecha_actual, turno_id_actual);
    
    -- Billete de L.20
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (20, 30, 600, 600, true, fecha_actual, turno_id_actual);
    
    -- Billete de L.50
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (50, 15, 750, 750, true, fecha_actual, turno_id_actual);
    
    -- Billete de L.100
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (100, 10, 1000, 1000, true, fecha_actual, turno_id_actual);
    
    -- Billete de L.500
    INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
    VALUES (500, 5, 2500, 2500, true, fecha_actual, turno_id_actual);
    
    RAISE NOTICE 'Se han insertado registros para 8 denominaciones de billetes.';
    
    -- Calcular y mostrar el total general
    DECLARE
        total_general NUMERIC;
    BEGIN
        SELECT SUM(total_billete) INTO total_general FROM tbl_billetes WHERE fecha_registro = fecha_actual;
        RAISE NOTICE 'Total general insertado: L.%', total_general;
    END;
    
END $$;
