-- Asignar el rol de Vendedor al usuario Mari

-- 1. Asegurarse de que el rol de Vendedor existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tbl_roles WHERE nombre = 'Vendedor') THEN
    INSERT INTO tbl_roles (nombre, descripcion)
    VALUES ('Vendedor', 'Rol para vendedores con acceso limitado');
  END IF;
END $$;

-- 2. Obtener el ID del rol de Vendedor
DO $$
DECLARE
  rol_id INTEGER;
BEGIN
  SELECT id INTO rol_id FROM tbl_roles WHERE nombre = 'Vendedor';
  
  -- 3. Asignar el rol de Vendedor al usuario Mari
  UPDATE tbl_usuarios
  SET rol_id = rol_id
  WHERE username = 'mari';
END $$;

-- 4. Asegurarse de que el rol de Vendedor tenga los permisos adecuados
DO $$
DECLARE
  rol_id INTEGER;
BEGIN
  SELECT id INTO rol_id FROM tbl_roles WHERE nombre = 'Vendedor';
  
  -- Eliminar permisos existentes para evitar duplicados
  DELETE FROM tbl_permisos_roles WHERE rol_id = rol_id;
  
  -- Asignar solo los permisos específicos que debe tener un vendedor
  
  -- Dashboard
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
  SELECT rol_id, id FROM tbl_permisos WHERE codigo = 'ver_dashboard_vendedor' OR codigo LIKE '%dashboard%';
  
  -- Ventas
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
  SELECT rol_id, id FROM tbl_permisos WHERE codigo LIKE '%venta%';
  
  -- Clientes
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
  SELECT rol_id, id FROM tbl_permisos WHERE codigo LIKE '%cliente%';
  
  -- Productos
  INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
  SELECT rol_id, id FROM tbl_permisos WHERE codigo LIKE '%producto%';
END $$;

-- Verificar que el usuario Mari tenga el rol de Vendedor
SELECT u.id, u.username, r.nombre as rol_nombre
FROM tbl_usuarios u
LEFT JOIN tbl_roles r ON u.rol_id = r.id
WHERE u.username = 'mari';

-- Verificar los permisos asignados al rol de Vendedor
SELECT p.id, p.nombre, p.codigo, p.modulo
FROM tbl_permisos p
JOIN tbl_permisos_roles pr ON p.id = pr.permiso_id
JOIN tbl_roles r ON pr.rol_id = r.id
WHERE r.nombre = 'Vendedor'
ORDER BY p.modulo, p.nombre;
