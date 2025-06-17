-- Verificar si la columna ya existe y agregarla si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tbl_permisos'
        AND column_name = 'codigo'
    ) THEN
        -- Agregar la columna codigo
        ALTER TABLE tbl_permisos ADD COLUMN codigo VARCHAR(50) UNIQUE;
        
        -- Actualizar los registros existentes con códigos basados en el nombre
        UPDATE tbl_permisos SET codigo = LOWER(REPLACE(nombre, ' ', '_'));
        
        -- Hacer la columna NOT NULL después de actualizar los datos
        ALTER TABLE tbl_permisos ALTER COLUMN codigo SET NOT NULL;
    END IF;
END $$;
