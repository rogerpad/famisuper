-- Script para asignar permisos de turnos al rol Vendedor
DO $$
DECLARE
  permiso_iniciar_id INT;
  permiso_finalizar_id INT;
  rol_vendedor_id INT;
BEGIN
  -- Verificar si existen los permisos
  SELECT id INTO permiso_iniciar_id FROM tbl_permisos WHERE codigo = 'iniciar_turnos';
  SELECT id INTO permiso_finalizar_id FROM tbl_permisos WHERE codigo = 'finalizar_turnos';
  
  -- Si no existen, crearlos
  IF permiso_iniciar_id IS NULL THEN
    INSERT INTO tbl_permisos (nombre, descripcion, codigo)
    VALUES ('Iniciar Turnos', 'Permite iniciar turnos', 'iniciar_turnos')
    RETURNING id INTO permiso_iniciar_id;
    RAISE NOTICE 'Permiso iniciar_turnos creado con ID: %', permiso_iniciar_id;
  ELSE
    RAISE NOTICE 'Permiso iniciar_turnos ya existe con ID: %', permiso_iniciar_id;
  END IF;
  
  IF permiso_finalizar_id IS NULL THEN
    INSERT INTO tbl_permisos (nombre, descripcion, codigo)
    VALUES ('Finalizar Turnos', 'Permite finalizar turnos', 'finalizar_turnos')
    RETURNING id INTO permiso_finalizar_id;
    RAISE NOTICE 'Permiso finalizar_turnos creado con ID: %', permiso_finalizar_id;
  ELSE
    RAISE NOTICE 'Permiso finalizar_turnos ya existe con ID: %', permiso_finalizar_id;
  END IF;
  
  -- Obtener el ID del rol Vendedor
  SELECT id INTO rol_vendedor_id FROM tbl_roles WHERE nombre = 'Vendedor';
  
  IF rol_vendedor_id IS NULL THEN
    RAISE EXCEPTION 'El rol Vendedor no existe en la base de datos';
  ELSE
    RAISE NOTICE 'Rol Vendedor encontrado con ID: %', rol_vendedor_id;
  END IF;
  
  -- Asignar los permisos al rol Vendedor
  IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = rol_vendedor_id AND permiso_id = permiso_iniciar_id) THEN
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
    VALUES (rol_vendedor_id, permiso_iniciar_id);
    RAISE NOTICE 'Permiso iniciar_turnos asignado al rol Vendedor';
  ELSE
    RAISE NOTICE 'El permiso iniciar_turnos ya está asignado al rol Vendedor';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = rol_vendedor_id AND permiso_id = permiso_finalizar_id) THEN
    INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
    VALUES (rol_vendedor_id, permiso_finalizar_id);
    RAISE NOTICE 'Permiso finalizar_turnos asignado al rol Vendedor';
  ELSE
    RAISE NOTICE 'El permiso finalizar_turnos ya está asignado al rol Vendedor';
  END IF;
  
  -- Mostrar todos los permisos asignados al rol Vendedor
  RAISE NOTICE 'Permisos asignados al rol Vendedor:';
  FOR permiso_iniciar_id, permiso_finalizar_id IN
    SELECT p.id, p.codigo
    FROM tbl_permisos p
    JOIN tbl_permisos_roles rp ON p.id = rp.permiso_id
    WHERE rp.rol_id = rol_vendedor_id
  LOOP
    RAISE NOTICE 'ID: %, Código: %', permiso_iniciar_id, permiso_finalizar_id;
  END LOOP;
END $$;
