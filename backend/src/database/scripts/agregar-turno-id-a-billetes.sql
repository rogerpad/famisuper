-- Agregar columna turno_id a la tabla tbl_conteo_billetes
ALTER TABLE tbl_conteo_billetes ADD COLUMN IF NOT EXISTS turno_id BIGINT;

-- Agregar restricción de clave foránea
ALTER TABLE tbl_conteo_billetes 
ADD CONSTRAINT fk_turno_id 
FOREIGN KEY (turno_id) 
REFERENCES tbl_turnos(id) 
ON DELETE SET NULL;

-- Agregar columna activo si no existe
ALTER TABLE tbl_conteo_billetes ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Agregar columna fecha_registro si no existe
ALTER TABLE tbl_conteo_billetes ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Comentario para documentar el cambio
COMMENT ON COLUMN tbl_conteo_billetes.turno_id IS 'ID del turno asociado al conteo de billetes';
COMMENT ON COLUMN tbl_conteo_billetes.activo IS 'Indica si el registro está activo';
COMMENT ON COLUMN tbl_conteo_billetes.fecha_registro IS 'Fecha de registro del conteo';
