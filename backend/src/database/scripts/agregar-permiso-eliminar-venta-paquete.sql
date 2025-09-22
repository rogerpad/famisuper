-- Script para agregar el permiso 'eliminar_venta_paquete' si no existe
-- y asignarlo a los roles que necesiten eliminar ventas de paquetes/saldo

-- 1. Insertar el permiso si no existe
INSERT INTO tbl_permisos (nombre, descripcion, codigo, activo)
SELECT 'Eliminar Venta Paquete', 'Permite eliminar registros de ventas de paquetes/saldo', 'eliminar_venta_paquete', true
WHERE NOT EXISTS (
    SELECT 1 FROM tbl_permisos WHERE codigo = 'eliminar_venta_paquete'
);

-- 2. Obtener el ID del permiso
DO $$
DECLARE
    permiso_id INTEGER;
    admin_rol_id INTEGER;
    supervisor_rol_id INTEGER;
BEGIN
    -- Obtener el ID del permiso
    SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'eliminar_venta_paquete';
    
    -- Obtener IDs de roles (ajustar según los nombres reales en tu sistema)
    SELECT id INTO admin_rol_id FROM tbl_roles WHERE nombre = 'Administrador' OR nombre = 'Admin' LIMIT 1;
    SELECT id INTO supervisor_rol_id FROM tbl_roles WHERE nombre = 'Supervisor' LIMIT 1;
    
    -- Asignar permiso al rol Administrador si existe
    IF admin_rol_id IS NOT NULL AND permiso_id IS NOT NULL THEN
        INSERT INTO tbl_permisos_roles (permiso_id, rol_id)
        SELECT permiso_id, admin_rol_id
        WHERE NOT EXISTS (
            SELECT 1 FROM tbl_permisos_roles 
            WHERE permiso_id = permiso_id AND rol_id = admin_rol_id
        );
        RAISE NOTICE 'Permiso eliminar_venta_paquete asignado al rol Administrador (ID: %)', admin_rol_id;
    END IF;
    
    -- Asignar permiso al rol Supervisor si existe
    IF supervisor_rol_id IS NOT NULL AND permiso_id IS NOT NULL THEN
        INSERT INTO tbl_permisos_roles (permiso_id, rol_id)
        SELECT permiso_id, supervisor_rol_id
        WHERE NOT EXISTS (
            SELECT 1 FROM tbl_permisos_roles 
            WHERE permiso_id = permiso_id AND rol_id = supervisor_rol_id
        );
        RAISE NOTICE 'Permiso eliminar_venta_paquete asignado al rol Supervisor (ID: %)', supervisor_rol_id;
    END IF;
    
    IF permiso_id IS NOT NULL THEN
        RAISE NOTICE 'Permiso eliminar_venta_paquete creado con ID: %', permiso_id;
    END IF;
END $$;

-- 3. Verificar la creación
SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.codigo,
    p.activo,
    r.nombre as rol_nombre
FROM tbl_permisos p
LEFT JOIN tbl_permisos_roles pr ON p.id = pr.permiso_id
LEFT JOIN tbl_roles r ON pr.rol_id = r.id
WHERE p.codigo = 'eliminar_venta_paquete';
