-- Script para actualizar los permisos sin código
-- Este script asegura que todos los permisos tengan un valor en el campo 'codigo'

-- Primero, verificamos si hay permisos sin código
SELECT id, nombre, descripcion, modulo, codigo
FROM tbl_permisos
WHERE codigo IS NULL OR codigo = '';

-- Actualizar permisos sin código basado en su nombre
-- Convertimos el nombre a minúsculas, reemplazamos espacios por guiones bajos y eliminamos caracteres especiales
UPDATE tbl_permisos
SET codigo = LOWER(REGEXP_REPLACE(REPLACE(nombre, ' ', '_'), '[^a-zA-Z0-9_]', '', 'g'))
WHERE codigo IS NULL OR codigo = '';

-- Verificar que no haya códigos duplicados
WITH duplicados AS (
  SELECT codigo, COUNT(*) as cantidad
  FROM tbl_permisos
  GROUP BY codigo
  HAVING COUNT(*) > 1
)
SELECT p.id, p.nombre, p.codigo
FROM tbl_permisos p
JOIN duplicados d ON p.codigo = d.codigo
ORDER BY p.codigo;

-- Si hay duplicados, agregar un sufijo numérico
DO $$
DECLARE
  r RECORD;
  counter INTEGER;
BEGIN
  FOR r IN (
    SELECT codigo
    FROM tbl_permisos
    GROUP BY codigo
    HAVING COUNT(*) > 1
  ) LOOP
    counter := 1;
    FOR i IN (
      SELECT id
      FROM tbl_permisos
      WHERE codigo = r.codigo
      ORDER BY id
    ) LOOP
      IF counter > 1 THEN
        UPDATE tbl_permisos
        SET codigo = r.codigo || '_' || counter
        WHERE id = i.id;
      END IF;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Verificar que todos los permisos tengan un código único
SELECT id, nombre, codigo
FROM tbl_permisos
ORDER BY codigo;
