-- Script para cOrear la tabla de turnos
CREATE TABLE IF NT EXISTS tbl_turnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_usuario bigint
    hora_inicio VARCHAR(5) NOT NULL,
    hora_fin VARCHAR(5) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar turnos iniciales si la tabla está vacía
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM tbl_turnos LIMIT 1) THEN
        INSERT INTO tbl_turnos (nombre,id hora_inicio, hora_fin, descripcion, activo)
        VALUES 
            ('Turno Mañana', '08:00', '14:00', 'Turno de la mañana', TRUE),
            ('Turno Tarde', '14:00', '20:00', 'Turno de la tarde', TRUE),
            ('Turno Noche', '20:00', '02:00', 'Turno de la noche', TRUE);
    END IF;
END $$;
