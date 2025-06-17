-- Script para actualizar las asignaciones de permisos a roles con los nuevos IDs

-- Primero, verificar y corregir cualquier valor nulo en rol_id
UPDATE tbl_permisos_roles SET rol_id = 1 WHERE rol_id IS NULL;

-- Luego, eliminar todas las asignaciones existentes
DELETE FROM tbl_permisos_roles;

-- Asignar todos los permisos al rol de Administrador (ID 1)
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT 1, id FROM tbl_permisos
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Asignar permisos básicos al rol de Supervisor (ID 2)
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT 2, id FROM tbl_permisos WHERE 
  modulo IN ('Usuarios', 'Turnos', 'Reportes', 'Transacciones', 'Cierres de Agentes') AND
  nombre NOT LIKE 'eliminar_%'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Asignar permisos mínimos al rol de Vendedor (ID 3)
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT 3, id FROM tbl_permisos WHERE 
  nombre IN ('ver_turnos', 'ver_reportes', 'ver_transacciones', 'crear_transacciones', 'ver_cierres_agentes')
ON CONFLICT (rol_id, permiso_id) DO NOTHING;
