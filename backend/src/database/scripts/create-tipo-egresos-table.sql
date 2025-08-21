-- Script para crear la tabla tbl_tipo_egresos si no existe
-- o modificarla para que coincida con la entidad SuperExpenseType

-- Verificar si la tabla existe
DO $$
BEGIN
    -- Si la tabla no existe, crearla desde cero
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tbl_tipo_egresos') THEN
        CREATE TABLE tbl_tipo_egresos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            descripcion VARCHAR(255),
            activo BOOLEAN DEFAULT TRUE,
            fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Tabla tbl_tipo_egresos creada correctamente';
    ELSE
        -- Si la tabla existe, verificar y agregar columnas faltantes
        
        -- Verificar columna activo
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'tbl_tipo_egresos'::regclass AND attname = 'activo') THEN
            ALTER TABLE tbl_tipo_egresos ADD COLUMN activo BOOLEAN DEFAULT TRUE;
            RAISE NOTICE 'Columna activo agregada a la tabla tbl_tipo_egresos';
        END IF;
        
        -- Verificar columna fecha_creacion
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'tbl_tipo_egresos'::regclass AND attname = 'fecha_creacion') THEN
            ALTER TABLE tbl_tipo_egresos ADD COLUMN fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Columna fecha_creacion agregada a la tabla tbl_tipo_egresos';
        END IF;
        
        -- Verificar columna fecha_actualizacion
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'tbl_tipo_egresos'::regclass AND attname = 'fecha_actualizacion') THEN
            ALTER TABLE tbl_tipo_egresos ADD COLUMN fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Columna fecha_actualizacion agregada a la tabla tbl_tipo_egresos';
        END IF;
        
        RAISE NOTICE 'Tabla tbl_tipo_egresos actualizada correctamente';
    END IF;
END $$;
