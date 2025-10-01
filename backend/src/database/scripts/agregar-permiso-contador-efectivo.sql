-- Script para agregar el permiso ver_contador_efectivo y asignarlo a los roles Administrador y Vendedor
-- Ejecutar este script en la base de datos PostgreSQL

-- 1. Verificar si el permiso ya existe
DO $$
DECLARE
    permiso_id INT;
    rol_admin_id INT;
    rol_vendedor_id INT;
    codigo_permiso VARCHAR(50) := 'ver_contador_efectivo';
    modulo_permiso VARCHAR(50) := 'cash';
BEGIN
    -- Buscar si el permiso ya existe
    SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = codigo_permiso;
    
    -- Si el permiso no existe, crearlo
    IF permiso_id IS NULL THEN
        INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
        VALUES (
            'Ver Contador de Efectivo', 
            'Permite acceder y utilizar el contador de efectivo para realizar conteos de billetes', 
            modulo_permiso,
            codigo_permiso
        )
        RETURNING id INTO permiso_id;
        
        RAISE NOTICE 'Permiso ver_contador_efectivo creado con ID: %', permiso_id;
    ELSE
        RAISE NOTICE 'El permiso ver_contador_efectivo ya existe con ID: %', permiso_id;
    END IF;
    
    -- Buscar el ID del rol Administrador
    SELECT id INTO rol_admin_id FROM tbl_roles WHERE nombre = 'Administrador';
    
    IF rol_admin_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Administrador';
    END IF;
    
    -- Buscar el ID del rol Vendedor
    SELECT id INTO rol_vendedor_id FROM tbl_roles WHERE nombre = 'Vendedor';
    
    IF rol_vendedor_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Vendedor';
    END IF;
    
    -- Asignar el permiso al rol Administrador
    IF NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles rp
        WHERE rp.rol_id = rol_admin_id AND rp.permiso_id = permiso_id
    ) THEN
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (rol_admin_id, permiso_id);
        
        RAISE NOTICE 'Permiso ver_contador_efectivo asignado al rol Administrador';
    ELSE
        RAISE NOTICE 'El permiso ver_contador_efectivo ya está asignado al rol Administrador';
    END IF;
    
    -- Asignar el permiso al rol Vendedor
    IF NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles rp
        WHERE rp.rol_id = rol_vendedor_id AND rp.permiso_id = permiso_id
    ) THEN
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (rol_vendedor_id, permiso_id);
        
        RAISE NOTICE 'Permiso ver_contador_efectivo asignado al rol Vendedor';
    ELSE
        RAISE NOTICE 'El permiso ver_contador_efectivo ya está asignado al rol Vendedor';
    END IF;
    
    -- Mostrar todos los permisos asignados al rol Administrador
    RAISE NOTICE 'Permisos asignados al rol Administrador:';
    FOR permiso_record IN 
        SELECT p.id, p.nombre 
        FROM tbl_permisos p
        JOIN tbl_permisos_roles rp ON p.id = rp.permiso_id
        WHERE rp.rol_id = rol_admin_id
    LOOP
        RAISE NOTICE '%: %', permiso_record.id, permiso_record.nombre;
    END LOOP;
    
    -- Mostrar todos los permisos asignados al rol Vendedor
    RAISE NOTICE 'Permisos asignados al rol Vendedor:';
    FOR permiso_record IN 
        SELECT p.id, p.nombre 
        FROM tbl_permisos p
        JOIN tbl_permisos_roles rp ON p.id = rp.permiso_id
        WHERE rp.rol_id = rol_vendedor_id
    LOOP
        RAISE NOTICE '%: %', permiso_record.id, permiso_record.nombre;
    END LOOP;
    
END $$;
