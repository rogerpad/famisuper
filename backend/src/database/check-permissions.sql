-- Verificar los permisos existentes
SELECT id, nombre, descripcion, modulo, codigo FROM tbl_permisos;

-- Verificar los roles existentes
SELECT id, nombre, descripcion FROM tbl_roles;

-- Verificar los permisos asignados a roles
SELECT r.nombre as rol_nombre, p.nombre as permiso_nombre, p.codigo as permiso_codigo
FROM tbl_roles r
JOIN tbl_permisos_roles pr ON r.id = pr.rol_id
JOIN tbl_permisos p ON pr.permiso_id = p.id
ORDER BY r.nombre, p.nombre;

-- Verificar los usuarios y sus roles
SELECT u.id, u.nombre, u.email, r.nombre as rol_nombre
FROM tbl_usuarios u
LEFT JOIN tbl_roles r ON u.rol_id = r.id;

-- Contar permisos por rol
SELECT r.nombre as rol_nombre, COUNT(p.id) as total_permisos
FROM tbl_roles r
LEFT JOIN tbl_permisos_roles pr ON r.id = pr.rol_id
LEFT JOIN tbl_permisos p ON pr.permiso_id = p.id
GROUP BY r.nombre
ORDER BY total_permisos DESC;
