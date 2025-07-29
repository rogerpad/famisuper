-- Script para insertar registros de prueba en la tabla tbl_registros_actividad_turnos
-- Este script inserta registros de actividad de turnos para probar la visualización en el frontend

-- Verificar si hay registros en la tabla
DO $$
DECLARE
    registro_count INTEGER;
BEGIN
    -- Contar registros existentes
    SELECT COUNT(*) INTO registro_count FROM tbl_registros_actividad_turnos;
    
    -- Mostrar mensaje informativo
    RAISE NOTICE 'Registros existentes en tbl_registros_actividad_turnos: %', registro_count;
    
    -- Solo insertar si no hay registros
    IF registro_count = 0 THEN
        -- Verificar que existan turnos y usuarios para referenciar
        DECLARE
            turno_id INTEGER;
            usuario_id INTEGER;
        BEGIN
            -- Obtener un ID de turno válido
            SELECT id INTO turno_id FROM tbl_turnos LIMIT 1;
            
            -- Obtener un ID de usuario válido
            SELECT id INTO usuario_id FROM tbl_usuarios LIMIT 1;
            
            IF turno_id IS NOT NULL AND usuario_id IS NOT NULL THEN
                -- Insertar registros de prueba con referencias válidas
                INSERT INTO tbl_registros_actividad_turnos (turno_id, usuario_id, accion, fecha_hora, descripcion)
                VALUES
                    (turno_id, usuario_id, 'iniciar', NOW() - INTERVAL '3 days', 'Inicio de turno automático'),
                    (turno_id, usuario_id, 'pausar', NOW() - INTERVAL '2 days 12 hours', 'Pausa para almuerzo'),
                    (turno_id, usuario_id, 'reanudar', NOW() - INTERVAL '2 days 11 hours', 'Reanudación después de almuerzo'),
                    (turno_id, usuario_id, 'finalizar', NOW() - INTERVAL '2 days', 'Finalización de turno normal'),
                    (turno_id, usuario_id, 'iniciar', NOW() - INTERVAL '1 day', 'Inicio de turno manual'),
                    (turno_id, usuario_id, 'finalizar', NOW() - INTERVAL '12 hours', 'Finalización de turno anticipada');
                
                RAISE NOTICE 'Se insertaron 6 registros de prueba en tbl_registros_actividad_turnos';
            ELSE
                RAISE NOTICE 'No se pudieron insertar registros de prueba porque no hay turnos o usuarios en la base de datos';
            END IF;
        END;
    ELSE
        RAISE NOTICE 'Ya existen registros en la tabla. No se insertaron registros de prueba.';
    END IF;
END $$;

-- Verificar los registros después de la inserción
SELECT * FROM tbl_registros_actividad_turnos ORDER BY fecha_hora DESC LIMIT 10;
