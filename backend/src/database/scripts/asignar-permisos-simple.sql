-- 1. Verificar si existen los permisos
SELECT id, nombre, codigo FROM tbl_permisos WHERE codigo IN ('iniciar_turnos', 'finalizar_turnos');

-- 2. Crear los permisos si no existen
INSERT INTO tbl_permisos (nombre, descripcion, codigo)
SELECT 'Iniciar Turnos', 'Permite iniciar turnos', 'iniciar_turnos'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'iniciar_turnos');

INSERT INTO tbl_permisos (nombre, descripcion, codigo)
SELECT 'Finalizar Turnos', 'Permite finalizar turnos', 'finalizar_turnos'
WHERE NOT EXISTS (SELECT 1 FROM tbl_permisos WHERE codigo = 'finalizar_turnos');

-- 3. Obtener IDs de los permisos y del rol Vendedor
SELECT id, codigo FROM tbl_permisos WHERE codigo IN ('iniciar_turnos', 'finalizar_turnos');
SELECT id, nombre FROM tbl_roles WHERE nombre = 'Vendedor';

-- 4. Asignar los permisos al rol Vendedor (reemplaza los IDs con los valores obtenidos en el paso anterior)
-- Ejemplo: Si el ID del permiso iniciar_turnos es 25 y el ID del rol Vendedor es 2
-- INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (2, 25);

-- Asignar permiso iniciar_turnos al rol Vendedor
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT r.id, p.id
FROM tbl_roles r, tbl_permisos p
WHERE r.nombre = 'Vendedor' AND p.codigo = 'iniciar_turnos'
AND NOT EXISTS (
    SELECT 1 FROM tbl_permisos_roles rp 
    WHERE rp.rol_id = r.id AND rp.permiso_id = p.id
);

-- Asignar permiso finalizar_turnos al rol Vendedor
INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
SELECT r.id, p.id
FROM tbl_roles r, tbl_permisos p
WHERE r.nombre = 'Vendedor' AND p.codigo = 'finalizar_turnos'
AND NOT EXISTS (
    SELECT 1 FROM tbl_permisos_roles rp 
    WHERE rp.rol_id = r.id AND rp.permiso_id = p.id
);

-- 5. Verificar que los permisos estén asignados correctamente
SELECT r.nombre AS rol, p.codigo AS permiso
FROM tbl_roles r
JOIN tbl_permisos_roles rp ON r.id = rp.rol_id
JOIN tbl_permisos p ON p.id = rp.permiso_id
WHERE r.nombre = 'Vendedor' AND p.codigo IN ('iniciar_turnos', 'finalizar_turnos');
