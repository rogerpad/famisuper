-- Script para corregir la estructura de la tabla tbl_permisos_roles

-- 1. Primero, eliminar registros con rol_id nulo
DELETE FROM tbl_permisos_roles WHERE rol_id IS NULL;

-- 2. Verificar si hay restricciones existentes y eliminarlas
DO $$
BEGIN
    -- Eliminar la restricción de clave única si existe
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tbl_permisos_roles_rol_id_permiso_id_key') THEN
        ALTER TABLE tbl_permisos_roles DROP CONSTRAINT tbl_permisos_roles_rol_id_permiso_id_key;
    END IF;
    
    -- Eliminar la clave foránea de rol_id si existe
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tbl_permisos_roles_rol_id_fkey') THEN
        ALTER TABLE tbl_permisos_roles DROP CONSTRAINT tbl_permisos_roles_rol_id_fkey;
    END IF;
    
    -- Eliminar la clave foránea de permiso_id si existe
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tbl_permisos_roles_permiso_id_fkey') THEN
        ALTER TABLE tbl_permisos_roles DROP CONSTRAINT tbl_permisos_roles_permiso_id_fkey;
    END IF;
END $$;

-- 3. Recrear la columna rol_id con el tipo correcto
ALTER TABLE tbl_permisos_roles ALTER COLUMN rol_id TYPE bigint;

-- 4. Asegurarse de que la columna no acepta nulos
ALTER TABLE tbl_permisos_roles ALTER COLUMN rol_id SET NOT NULL;

-- 5. Recrear las restricciones
ALTER TABLE tbl_permisos_roles ADD CONSTRAINT tbl_permisos_roles_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES tbl_roles(id) ON DELETE CASCADE;
ALTER TABLE tbl_permisos_roles ADD CONSTRAINT tbl_permisos_roles_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES tbl_permisos(id) ON DELETE CASCADE;
ALTER TABLE tbl_permisos_roles ADD CONSTRAINT tbl_permisos_roles_rol_id_permiso_id_key UNIQUE (rol_id, permiso_id);

-- 6. Ejecutar el script de asignación de permisos
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





