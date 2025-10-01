-- Script para agregar el permiso ver_registro_actividad_turnos y asignarlo al rol Administrador
-- Ejecutar este script en la base de datos PostgreSQL

-- 1. Verificar si el permiso ya existe
DO $$
DECLARE
    permiso_id INT;
    rol_id INT;
BEGIN
    -- Buscar si el permiso ya existe
    SELECT id INTO permiso_id FROM tbl_permisos WHERE nombre = 'ver_registro_actividad_turnos';
    
    -- Si el permiso no existe, crearlo
    IF permiso_id IS NULL THEN
        INSERT INTO tbl_permisos (nombre, descripcion)
        VALUES ('ver_registro_actividad_turnos', 'Permite ver el registro de actividad de los turnos')
        RETURNING id INTO permiso_id;
        
        RAISE NOTICE 'Permiso ver_registro_actividad_turnos creado con ID: %', permiso_id;
    ELSE
        RAISE NOTICE 'El permiso ver_registro_actividad_turnos ya existe con ID: %', permiso_id;
    END IF;
    
    -- Buscar el ID del rol Administrador
    SELECT id INTO rol_id FROM tbl_roles WHERE nombre = 'Administrador';
    
    IF rol_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Administrador';
    END IF;
    
    -- Verificar si el permiso ya está asignado al rol
    -- Corregido: usar alias para evitar ambigüedad con los parámetros
    IF NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles rp
        WHERE rp.rol_id = rol_id AND rp.permiso_id = permiso_id
    ) THEN
        -- Asignar el permiso al rol Administrador
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (rol_id, permiso_id);
        
        RAISE NOTICE 'Permiso ver_registro_actividad_turnos asignado al rol Administrador';
    ELSE
        RAISE NOTICE 'El permiso ver_registro_actividad_turnos ya está asignado al rol Administrador';
    END IF;
    
    -- Mostrar todos los permisos asignados al rol Administrador
    RAISE NOTICE 'Permisos asignados al rol Administrador:';
    FOR permiso_id, permiso_nombre IN 
        SELECT p.id, p.nombre 
        FROM tbl_permisos p
        JOIN tbl_permisos_roles rp ON p.id = rp.permiso_id
        WHERE rp.rol_id = rol_id
    LOOP
        RAISE NOTICE '%: %', permiso_id, permiso_nombre;
    END LOOP;
    
END $$;
