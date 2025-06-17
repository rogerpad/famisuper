-- Script para insertar permisos básicos del sistema
-- Primero verificamos si ya existen permisos, si no, los insertamos

-- Permisos para el Dashboard de Vendedor
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Dashboard Vendedor', 'Permite ver el dashboard del vendedor', 'ver_dashboard_vendedor', 'Vendedor'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_dashboard_vendedor');

-- Permisos para Transacciones
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Transacciones', 'Permite ver la lista de transacciones', 'ver_transacciones', 'Transacciones'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_transacciones');

-- Permisos para Tipos de Transacción
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Tipos de Transacción', 'Permite ver los tipos de transacción', 'ver_tipos_transaccion', 'Tipos de Transacción'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_tipos_transaccion');

-- Permisos para Cierre de Agentes
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Cierres de Agentes', 'Permite ver los cierres de agentes', 'ver_cierres_agentes', 'Cierre de Agentes'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_cierres_agentes');

-- Permisos para Reportes
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Reportes', 'Permite ver los reportes del sistema', 'ver_reportes', 'Reportes'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_reportes');

-- Permisos para Roles
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Roles', 'Permite ver la lista de roles', 'ver_roles', 'Roles'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_roles');

-- Permisos para Usuarios
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Usuarios', 'Permite ver la lista de usuarios', 'ver_usuarios', 'Usuarios'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_usuarios');

-- Permisos para Turnos
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Turnos', 'Permite ver la gestión de turnos', 'ver_turnos', 'Turnos'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_turnos');

-- Permisos para Tipos de Proveedor
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Tipos de Proveedor', 'Permite ver los tipos de proveedor', 'ver_tipos_proveedor', 'Tipos de Proveedor'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_tipos_proveedor');

-- Permisos para Proveedores
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Proveedores', 'Permite ver la lista de proveedores', 'ver_proveedores', 'Proveedores'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_proveedores');

-- Permisos específicos para el rol de Vendedor
INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Ventas', 'Permite ver las ventas', 'ver_ventas', 'Ventas'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_ventas');

INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Crear Ventas', 'Permite crear nuevas ventas', 'crear_ventas', 'Ventas'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'crear_ventas');

INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Editar Ventas', 'Permite editar ventas existentes', 'editar_ventas', 'Ventas'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'editar_ventas');

INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Eliminar Ventas', 'Permite eliminar ventas', 'eliminar_ventas', 'Ventas'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'eliminar_ventas');

INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Clientes', 'Permite ver la lista de clientes', 'ver_clientes', 'Clientes'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_clientes');

INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Crear Clientes', 'Permite registrar nuevos clientes', 'crear_clientes', 'Clientes'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'crear_clientes');

INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Editar Clientes', 'Permite editar información de clientes', 'editar_clientes', 'Clientes'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'editar_clientes');

INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
SELECT 'Ver Productos', 'Permite ver el catálogo de productos', 'ver_productos', 'Productos'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'ver_productos');

-- Asignar todos los permisos al rol de Administrador (asumiendo que el ID del rol de Administrador es 1)
-- Primero obtenemos todos los IDs de permisos
DO $$
DECLARE
    admin_rol_id INTEGER := 1; -- Asumimos que el ID del rol de Administrador es 1
    permiso_record RECORD;
BEGIN
    -- Verificar si el rol de Administrador existe
    IF EXISTS (SELECT 1 FROM tbl_roles WHERE id = admin_rol_id) THEN
        -- Iterar sobre todos los permisos y asignarlos al rol de Administrador
        FOR permiso_record IN SELECT id FROM tbl_permisos LOOP
            -- Insertar solo si no existe ya la relación
            IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = admin_rol_id AND permiso_id = permiso_record.id) THEN
                INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (admin_rol_id, permiso_record.id);
            END IF;
        END LOOP;
    END IF;
END $$;
