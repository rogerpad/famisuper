-- Script para insertar los permisos de AdicionalesPrestamos

-- Primero, verificamos si los permisos ya existen
DO $$
DECLARE
    ver_adic_presta_id BIGINT;
    crear_editar_adic_prest_id BIGINT;
    eliminar_adic_prest_id BIGINT;
    admin_rol_id BIGINT;
BEGIN
    -- Obtener el ID del rol de Administrador
    SELECT id INTO admin_rol_id FROM tbl_roles WHERE nombre = 'Administrador';
    
    IF admin_rol_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol de Administrador';
    END IF;

    -- Verificar si los permisos ya existen
    SELECT id INTO ver_adic_presta_id FROM tbl_permisos WHERE codigo = 'ver_adic_presta';
    SELECT id INTO crear_editar_adic_prest_id FROM tbl_permisos WHERE codigo = 'crear_editar_adic_prest';
    SELECT id INTO eliminar_adic_prest_id FROM tbl_permisos WHERE codigo = 'eliminar_adic_prest';
    
    -- Insertar permiso ver_adic_presta si no existe
    IF ver_adic_presta_id IS NULL THEN
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, activo)
        VALUES ('Ver Adicionales y Préstamos', 'Permite ver el listado de adicionales y préstamos', 'ver_adic_presta', true)
        RETURNING id INTO ver_adic_presta_id;
        
        RAISE NOTICE 'Permiso ver_adic_presta creado con ID %', ver_adic_presta_id;
    ELSE
        RAISE NOTICE 'El permiso ver_adic_presta ya existe con ID %', ver_adic_presta_id;
    END IF;
    
    -- Insertar permiso crear_editar_adic_prest si no existe
    IF crear_editar_adic_prest_id IS NULL THEN
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, activo)
        VALUES ('Crear/Editar Adicionales y Préstamos', 'Permite crear y editar adicionales y préstamos', 'crear_editar_adic_prest', true)
        RETURNING id INTO crear_editar_adic_prest_id;
        
        RAISE NOTICE 'Permiso crear_editar_adic_prest creado con ID %', crear_editar_adic_prest_id;
    ELSE
        RAISE NOTICE 'El permiso crear_editar_adic_prest ya existe con ID %', crear_editar_adic_prest_id;
    END IF;
    
    -- Insertar permiso eliminar_adic_prest si no existe
    IF eliminar_adic_prest_id IS NULL THEN
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, activo)
        VALUES ('Eliminar Adicionales y Préstamos', 'Permite eliminar adicionales y préstamos', 'eliminar_adic_prest', true)
        RETURNING id INTO eliminar_adic_prest_id;
        
        RAISE NOTICE 'Permiso eliminar_adic_prest creado con ID %', eliminar_adic_prest_id;
    ELSE
        RAISE NOTICE 'El permiso eliminar_adic_prest ya existe con ID %', eliminar_adic_prest_id;
    END IF;
    
    -- Asignar permisos al rol de Administrador si no están asignados
    IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = admin_rol_id AND permiso_id = ver_adic_presta_id) THEN
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (admin_rol_id, ver_adic_presta_id);
        
        RAISE NOTICE 'Permiso ver_adic_presta asignado al rol Administrador';
    ELSE
        RAISE NOTICE 'El permiso ver_adic_presta ya está asignado al rol Administrador';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = admin_rol_id AND permiso_id = crear_editar_adic_prest_id) THEN
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (admin_rol_id, crear_editar_adic_prest_id);
        
        RAISE NOTICE 'Permiso crear_editar_adic_prest asignado al rol Administrador';
    ELSE
        RAISE NOTICE 'El permiso crear_editar_adic_prest ya está asignado al rol Administrador';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = admin_rol_id AND permiso_id = eliminar_adic_prest_id) THEN
        INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
        VALUES (admin_rol_id, eliminar_adic_prest_id);
        
        RAISE NOTICE 'Permiso eliminar_adic_prest asignado al rol Administrador';
    ELSE
        RAISE NOTICE 'El permiso eliminar_adic_prest ya está asignado al rol Administrador';
    END IF;
END $$;
