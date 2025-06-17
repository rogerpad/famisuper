-- Script para actualizar los permisos del rol de Vendedor

-- 1. Verificar que el rol de Vendedor existe
SELECT id, nombre FROM tbl_roles WHERE nombre = 'Vendedor';

-- 2. Verificar los permisos específicos para el rol de Vendedor
DO $$
DECLARE
  rol_id INTEGER;
  permiso_id INTEGER;
BEGIN
  -- Obtener el ID del rol de Vendedor
  SELECT id INTO rol_id FROM tbl_roles WHERE nombre = 'Vendedor';
  
  IF rol_id IS NULL THEN
    RAISE EXCEPTION 'El rol de Vendedor no existe';
  END IF;
  
  -- Eliminar permisos existentes para evitar duplicados
  DELETE FROM tbl_permisos_roles WHERE rol_id = rol_id;
  
  -- Asignar permisos específicos para el rol de Vendedor
  
  -- Dashboard Vendedor
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_dashboard_vendedor';
  IF permiso_id IS NULL THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Dashboard Vendedor', 'Permite ver el dashboard del vendedor', 'Dashboard', 'ver_dashboard_vendedor')
    RETURNING id INTO permiso_id;
  END IF;
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (rol_id, permiso_id);
  
  -- Ventas
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_ventas';
  IF permiso_id IS NULL THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Ventas', 'Permite ver las ventas', 'Ventas', 'ver_ventas')
    RETURNING id INTO permiso_id;
  END IF;
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (rol_id, permiso_id);
  
  -- Clientes
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_clientes';
  IF permiso_id IS NULL THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Clientes', 'Permite ver los clientes', 'Clientes', 'ver_clientes')
    RETURNING id INTO permiso_id;
  END IF;
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (rol_id, permiso_id);
  
  -- Productos
  SELECT id INTO permiso_id FROM tbl_permisos WHERE codigo = 'ver_productos';
  IF permiso_id IS NULL THEN
    INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
    VALUES ('Ver Productos', 'Permite ver los productos', 'Productos', 'ver_productos')
    RETURNING id INTO permiso_id;
  END IF;
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (rol_id, permiso_id);
  
END $$;

-- 3. Verificar que el usuario Mari tenga asignado el rol de Vendedor
DO $$
DECLARE
  rol_id INTEGER;
BEGIN
  SELECT id INTO rol_id FROM tbl_roles WHERE nombre = 'Vendedor';
  
  UPDATE tbl_usuarios
  SET rol_id = rol_id
  WHERE username = 'mari';
END $$;

-- 4. Verificar los permisos asignados al rol de Vendedor
SELECT p.id, p.nombre, p.codigo, p.modulo
FROM tbl_permisos p
JOIN tbl_permisos_roles pr ON p.id = pr.permiso_id
JOIN tbl_roles r ON pr.rol_id = r.id
WHERE r.nombre = 'Vendedor'
ORDER BY p.modulo, p.nombre;

-- 5. Verificar que el usuario Mari tenga asignado el rol de Vendedor
SELECT u.id, u.username, r.nombre as rol_nombre
FROM tbl_usuarios u
LEFT JOIN tbl_roles r ON u.rol_id = r.id
WHERE u.username = 'mari';
