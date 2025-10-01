-- Script para crear la tabla tbl_registros_actividad_turnos
-- Puedes ejecutar este script directamente en tu gestor de base de datos

-- 1. Verificar si la tabla ya existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tbl_registros_actividad_turnos') THEN
        -- 2. Crear la tabla si no existe
        CREATE TABLE "tbl_registros_actividad_turnos" (
            "id" SERIAL NOT NULL,
            "accion" character varying(50) NOT NULL,
            "fecha_hora" TIMESTAMP NOT NULL DEFAULT now(),
            "descripcion" character varying(255),
            "turno_id" integer,
            "usuario_id" integer,
            CONSTRAINT "PK_registros_actividad_turnos" PRIMARY KEY ("id")
        );
        
        -- 3. Crear las restricciones de clave foránea
        ALTER TABLE "tbl_registros_actividad_turnos" 
        ADD CONSTRAINT "FK_registros_actividad_turnos_turno" 
        FOREIGN KEY ("turno_id") REFERENCES "tbl_turnos"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
        
        ALTER TABLE "tbl_registros_actividad_turnos" 
        ADD CONSTRAINT "FK_registros_actividad_turnos_usuario" 
        FOREIGN KEY ("usuario_id") REFERENCES "tbl_users"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
        
        RAISE NOTICE 'Tabla tbl_registros_actividad_turnos creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla tbl_registros_actividad_turnos ya existe';
    END IF;
END
$$;
