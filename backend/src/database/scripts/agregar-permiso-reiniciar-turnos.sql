-- Script para agregar el permiso reiniciar_turnos y asignarlo al rol Vendedor
-- Ejecutar este script en la base de datos PostgreSQL

-- 1. Verificar si el permiso ya existe
DO $$
DECLARE
    permiso_id INT;
    rol_id INT;
BEGIN
    -- Buscar si el permiso ya existe
    SELECT id INTO permiso_id FROM tbl_permisos WHERE nombre = 'reiniciar_turnos';
    
    -- Si el permiso no existe, crearlo
    IF permiso_id IS NULL THEN
        INSERT INTO tbl_permisos (nombre, descripcion)
        VALUES ('reiniciar_turnos', 'Permite reiniciar turnos (eliminar hora de inicio y fin)')
        RETURNING id INTO permiso_id;
        
        RAISE NOTICE 'Permiso reiniciar_turnos creado con ID: %', permiso_id;
    ELSE
        RAISE NOTICE 'El permiso reiniciar_turnos ya existe con ID: %', permiso_id;
    END IF;
    
    -- Buscar el ID del rol Vendedor
    SELECT id INTO rol_id FROM tbl_roles WHERE nombre = 'Vendedor';
    
    IF rol_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Vendedor';
    END IF;
    
    -- Verificar si el permiso ya está asignado al rol
    IF NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles 
        WHERE rol_id = rol_id AND permiso_id = permiso_id
    ) THEN
        -- Asignar el permiso al rol Vendedor
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (rol_id, permiso_id);
        
        RAISE NOTICE 'Permiso reiniciar_turnos asignado al rol Vendedor';
    ELSE
        RAISE NOTICE 'El permiso reiniciar_turnos ya está asignado al rol Vendedor';
    END IF;
    
    -- Mostrar todos los permisos asignados al rol Vendedor
    RAISE NOTICE 'Permisos asignados al rol Vendedor:';
    FOR permiso_id, permiso_nombre IN 
        SELECT p.id, p.nombre 
        FROM tbl_permisos p
        JOIN tbl_permisos_roles rp ON p.id = rp.permiso_id
        WHERE rp.rol_id = rol_id
    LOOP
        RAISE NOTICE '%: %', permiso_id, permiso_nombre;
    END LOOP;
    
END $$;
