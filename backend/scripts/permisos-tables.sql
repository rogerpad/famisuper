-- Script para crear las tablas de permisos en la base de datos

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS tbl_permisos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  modulo VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación entre permisos y roles
CREATE TABLE IF NOT EXISTS tbl_permisos_roles (
  id SERIAL PRIMARY KEY,
  rol_id INTEGER NOT NULL,
  permiso_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES tbl_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES tbl_permisos(id) ON DELETE CASCADE,
  UNIQUE(rol_id, permiso_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_permisos_modulo ON tbl_permisos(modulo);
CREATE INDEX IF NOT EXISTS idx_permisos_roles_rol_id ON tbl_permisos_roles(rol_id);
CREATE INDEX IF NOT EXISTS idx_permisos_roles_permiso_id ON tbl_permisos_roles(permiso_id);

-- Insertar permisos iniciales
INSERT INTO tbl_permisos (nombre, descripcion, modulo) VALUES
-- Módulo de Usuarios
('ver_usuarios', 'Ver listado de usuarios', 'Usuarios'),
('crear_usuarios', 'Crear nuevos usuarios', 'Usuarios'),
('editar_usuarios', 'Editar usuarios existentes', 'Usuarios'),
('eliminar_usuarios', 'Eliminar usuarios', 'Usuarios'),
('activar_desactivar_usuarios', 'Activar o desactivar usuarios', 'Usuarios'),

-- Módulo de Turnos
('ver_turnos', 'Ver listado de turnos', 'Turnos'),
('crear_turnos', 'Crear nuevos turnos', 'Turnos'),
('editar_turnos', 'Editar turnos existentes', 'Turnos'),
('eliminar_turnos', 'Eliminar turnos', 'Turnos'),
('activar_desactivar_turnos', 'Activar o desactivar turnos', 'Turnos'),

-- Módulo de Roles
('ver_roles', 'Ver listado de roles', 'Roles'),
('crear_roles', 'Crear nuevos roles', 'Roles'),
('editar_roles', 'Editar roles existentes', 'Roles'),
('eliminar_roles', 'Eliminar roles', 'Roles'),
('activar_desactivar_roles', 'Activar o desactivar roles', 'Roles'),

-- Módulo de Permisos
('ver_permisos', 'Ver listado de permisos', 'Permisos'),
('asignar_permisos', 'Asignar permisos a roles', 'Permisos'),

-- Módulo de Reportes
('ver_reportes', 'Ver reportes del sistema', 'Reportes'),
('exportar_reportes', 'Exportar reportes a diferentes formatos', 'Reportes'),

-- Módulo de Transacciones
('ver_transacciones', 'Ver listado de transacciones', 'Transacciones'),
('crear_transacciones', 'Crear nuevas transacciones', 'Transacciones'),
('editar_transacciones', 'Editar transacciones existentes', 'Transacciones'),
('eliminar_transacciones', 'Eliminar transacciones', 'Transacciones'),
('ver_detalle_transacciones', 'Ver detalle de transacciones', 'Transacciones'),
('ver_resumen_transacciones', 'Ver resumen de transacciones', 'Transacciones'),

-- Módulo de Tipos de Transacción
('ver_tipos_transaccion', 'Ver tipos de transacción', 'Tipos de Transacción'),
('gestionar_tipos_transaccion', 'Gestionar tipos de transacción', 'Tipos de Transacción'),

-- Módulo de Cierres de Agentes
('ver_cierres_agentes', 'Ver cierres finales de agentes', 'Cierres de Agentes'),
('crear_cierres_agentes', 'Crear cierres finales de agentes', 'Cierres de Agentes'),
('editar_cierres_agentes', 'Editar cierres finales de agentes', 'Cierres de Agentes'),
('eliminar_cierres_agentes', 'Eliminar cierres finales de agentes', 'Cierres de Agentes'),

-- Módulo de Proveedores
('ver_proveedores', 'Ver listado de proveedores', 'Proveedores'),
('crear_proveedores', 'Crear nuevos proveedores', 'Proveedores'),
('editar_proveedores', 'Editar proveedores existentes', 'Proveedores'),
('eliminar_proveedores', 'Eliminar proveedores', 'Proveedores'),

-- Módulo de Tipos de Proveedor
('ver_tipos_proveedor', 'Ver tipos de proveedor', 'Tipos de Proveedor'),
('gestionar_tipos_proveedor', 'Gestionar tipos de proveedor', 'Tipos de Proveedor')
ON CONFLICT (id) DO NOTHING;

-- Asignar todos los permisos al rol de Administrador (asumiendo que el ID del rol Administrador es 1)
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT 1, id FROM tbl_permisos
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Asignar permisos básicos al rol de Supervisor (asumiendo que el ID del rol Supervisor es 2)
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT 2, id FROM tbl_permisos WHERE 
  modulo IN ('Usuarios', 'Turnos', 'Reportes', 'Transacciones', 'Cierres de Agentes') AND
  nombre NOT LIKE 'eliminar_%'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Asignar permisos mínimos al rol de Vendedor (asumiendo que el ID del rol Operador es 3)
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT 3, id FROM tbl_permisos WHERE 
  nombre IN ('ver_turnos', 'Reportes', 'ver_transacciones', 'crear_transacciones', 'ver_cierres_agentes')
ON CONFLICT (rol_id, permiso_id) DO NOTHING;
