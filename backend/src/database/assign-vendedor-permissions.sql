-- Script para asignar permisos al rol de Vendedor
-- Primero verificamos si existe el rol de Vendedor, si no, lo creamos

DO $$
DECLARE
    vendedor_rol_id INTEGER;
BEGIN
    -- Verificar si existe el rol de Vendedor
    SELECT id INTO vendedor_rol_id FROM tbl_roles WHERE nombre = 'Vendedor';
    
    -- Si no existe, crearlo
    IF vendedor_rol_id IS NULL THEN
        INSERT INTO tbl_roles (nombre, descripcion) 
        VALUES ('Vendedor', 'Rol para vendedores del sistema') 
        RETURNING id INTO vendedor_rol_id;
        
        RAISE NOTICE 'Rol de Vendedor creado con ID: %', vendedor_rol_id;
    ELSE
        RAISE NOTICE 'Rol de Vendedor ya existe con ID: %', vendedor_rol_id;
    END IF;
    
    -- Asignar permisos específicos para el rol de Vendedor
    -- Permisos del dashboard
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
    SELECT vendedor_rol_id, p.id
    FROM tbl_permisos p
    WHERE p.codigo = 'ver_dashboard_vendedor'
    AND NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles 
        WHERE rol_id = vendedor_rol_id AND permiso_id = p.id
    );
    
    -- Permisos de ventas
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
    SELECT vendedor_rol_id, p.id
    FROM tbl_permisos p
    WHERE p.codigo IN ('ver_ventas', 'crear_ventas', 'editar_ventas')
    AND NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles 
        WHERE rol_id = vendedor_rol_id AND permiso_id = p.id
    );
    
    -- Permisos de clientes
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
    SELECT vendedor_rol_id, p.id
    FROM tbl_permisos p
    WHERE p.codigo IN ('ver_clientes', 'crear_clientes', 'editar_clientes')
    AND NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles 
        WHERE rol_id = vendedor_rol_id AND permiso_id = p.id
    );
    
    -- Permisos de productos
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
    SELECT vendedor_rol_id, p.id
    FROM tbl_permisos p
    WHERE p.codigo = 'ver_productos'
    AND NOT EXISTS (
        SELECT 1 FROM tbl_permisos_roles 
        WHERE rol_id = vendedor_rol_id AND permiso_id = p.id
    );
    
    -- Asignar el rol de Vendedor a usuarios que no tengan rol asignado
    UPDATE tbl_usuarios
    SET rol_id = vendedor_rol_id
    WHERE rol_id IS NULL;
    
    RAISE NOTICE 'Permisos asignados al rol de Vendedor correctamente';
END $$;
