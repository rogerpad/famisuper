-- Script para asignar el permiso ver_registro_actividad_turnos al rol Supervisor
-- Ejecutar este script en la base de datos PostgreSQL

DO $$
DECLARE
    permiso_id INT;
    rol_id INT;
BEGIN
    -- Buscar si el permiso existe
    SELECT id INTO permiso_id FROM tbl_permisos WHERE nombre = 'ver_registro_actividad_turnos';
    
    -- Verificar que el permiso exista
    IF permiso_id IS NULL THEN
        RAISE EXCEPTION 'El permiso ver_registro_actividad_turnos no existe. Ejecute primero el script agregar-permiso-ver-registro-actividad.sql';
    ELSE
        RAISE NOTICE 'Permiso ver_registro_actividad_turnos encontrado con ID: %', permiso_id;
    END IF;
    
    -- Buscar el ID del rol Supervisor
    SELECT id INTO rol_id FROM tbl_roles WHERE nombre = 'Supervisor';
    
    IF rol_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Supervisor';
    END IF;
    
    -- Verificar si el permiso ya está asignado al rol
    IF NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles rp
        WHERE rp.rol_id = rol_id AND rp.permiso_id = permiso_id
    ) THEN
        -- Asignar el permiso al rol Supervisor
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (rol_id, permiso_id);
        
        RAISE NOTICE 'Permiso ver_registro_actividad_turnos asignado al rol Supervisor';
    ELSE
        RAISE NOTICE 'El permiso ver_registro_actividad_turnos ya está asignado al rol Supervisor';
    END IF;
    
    -- Mostrar todos los permisos asignados al rol Supervisor
    RAISE NOTICE 'Permisos asignados al rol Supervisor:';
    FOR permiso_id, permiso_nombre IN 
        SELECT p.id, p.nombre 
        FROM tbl_permisos p
        JOIN tbl_permisos_roles rp ON p.id = rp.permiso_id
        WHERE rp.rol_id = rol_id
    LOOP
        RAISE NOTICE '%: %', permiso_id, permiso_nombre;
    END LOOP;
    
END $$;
