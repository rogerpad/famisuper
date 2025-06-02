-- Agregar la columna estado si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'tbl_transacciones_agentes' AND column_name = 'estado'
    ) THEN
        ALTER TABLE tbl_transacciones_agentes ADD COLUMN estado INTEGER DEFAULT 1;
    END IF;
END
$$;

-- Actualizar todas las transacciones existentes para que tengan estado = 1
UPDATE tbl_transacciones_agentes SET estado = 1 WHERE estado IS NULL;

-- Agregar restricción NOT NULL a la columna estado
ALTER TABLE tbl_transacciones_agentes ALTER COLUMN estado SET NOT NULL;
