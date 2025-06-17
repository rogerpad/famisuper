-- Verificar si el rol de Vendedor existe
SELECT id, nombre FROM tbl_roles WHERE nombre = 'Vendedor';

-- Verificar qué permisos tiene asignados el rol de Vendedor
SELECT p.id, p.nombre, p.codigo, p.modulo
FROM tbl_permisos p
JOIN tbl_permisos_roles pr ON p.id = pr.permiso_id
JOIN tbl_roles r ON pr.rol_id = r.id
WHERE r.nombre = 'Vendedor'
ORDER BY p.modulo, p.nombre;

-- Verificar si el usuario Mari tiene asignado el rol de Vendedor
SELECT u.id, u.username, r.nombre as rol_nombre
FROM tbl_usuarios u
LEFT JOIN tbl_roles r ON u.rol_id = r.id
WHERE u.username = 'mari';

-- Verificar los usuarios con rol de Vendedor
SELECT u.id, u.username, r.nombre as rol_nombre
FROM tbl_usuarios u
JOIN tbl_roles r ON u.rol_id = r.id
WHERE r.nombre = 'Vendedor';
