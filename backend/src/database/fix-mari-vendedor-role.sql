-- Script para asignar el rol de Vendedor a Mari y los permisos correctos

-- 1. Verificar y crear el rol de Vendedor si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tbl_roles WHERE nombre = 'Vendedor') THEN
    INSERT INTO tbl_roles (nombre, descripcion) VALUES ('Vendedor', 'Rol para vendedores');
  END IF;
END $$;

-- 2. Asegurarse de que existen los permisos necesarios para el rol de Vendedor
DO $$
DECLARE
  vendedor_role_id INTEGER;
BEGIN
  SELECT id INTO vendedor_role_id FROM tbl_roles WHERE nombre = 'Vendedor';
  
  -- Crear o actualizar los permisos necesarios
  -- Dashboard Vendedor
  IF NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_dashboard_vendedor') THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Dashboard Vendedor', 'Permite ver el dashboard del vendedor', 'Dashboard', 'ver_dashboard_vendedor');
  END IF;
  
  -- Ventas
  IF NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_ventas') THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Ventas', 'Permite ver las ventas', 'Ventas', 'ver_ventas');
  END IF;
  
  -- Clientes
  IF NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_clientes') THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Clientes', 'Permite ver los clientes', 'Clientes', 'ver_clientes');
  END IF;
  
  -- Productos
  IF NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_productos') THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Productos', 'Permite ver los productos', 'Productos', 'ver_productos');
  END IF;
END $$;

-- 3. Asignar los permisos al rol de Vendedor
DO $$
DECLARE
  vendedor_role_id INTEGER;
  permiso_id INTEGER;
BEGIN
  SELECT id INTO vendedor_role_id FROM tbl_roles WHERE nombre = 'Vendedor';
  
  -- Eliminar permisos existentes para evitar duplicados
  DELETE FROM tbl_permisos_roles WHERE rol_id = vendedor_role_id;
  
  -- Dashboard Vendedor
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_dashboard_vendedor';
  IF permiso_id IS NOT NULL THEN
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (vendedor_role_id, permiso_id);
  END IF;
  
  -- Ventas
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_ventas';
  IF permiso_id IS NOT NULL THEN
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (vendedor_role_id, permiso_id);
  END IF;
  
  -- Clientes
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_clientes';
  IF permiso_id IS NOT NULL THEN
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (vendedor_role_id, permiso_id);
  END IF;
  
  -- Productos
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_productos';
  IF permiso_id IS NOT NULL THEN
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (vendedor_role_id, permiso_id);
  END IF;
END $$;

-- 4. Asignar el rol de Vendedor a Mari
UPDATE tbl_usuarios
SET rol_id = (SELECT id FROM tbl_roles WHERE nombre = 'Vendedor')
WHERE username = 'mari';

-- 5. Verificar que Mari tenga el rol de Vendedor
SELECT u.id, u.username, r.nombre as rol_nombre
FROM tbl_usuarios u
LEFT JOIN tbl_roles r ON u.rol_id = r.id
WHERE u.username = 'mari';

-- 6. Verificar los permisos asignados al rol de Vendedor
SELECT p.id, p.nombre, p.codigo, p.modulo
FROM tbl_permisos p
JOIN tbl_permisos_roles pr ON p.id = pr.permiso_id
JOIN tbl_roles r ON pr.rol_id = r.id
WHERE r.nombre = 'Vendedor'
ORDER BY p.modulo, p.nombre;
