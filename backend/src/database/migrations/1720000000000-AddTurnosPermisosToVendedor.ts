import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTurnosPermisosToVendedor1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si los permisos ya existen
    await queryRunner.query(`
      DO $$
      DECLARE
        permiso_iniciar_id INT;
        permiso_finalizar_id INT;
        rol_vendedor_id INT;
      BEGIN
        -- Verificar si existe el permiso iniciar_turnos
        SELECT id INTO permiso_iniciar_id FROM tbl_permisos WHERE codigo = 'iniciar_turnos';
        
        -- Si no existe, crearlo
        IF permiso_iniciar_id IS NULL THEN
          INSERT INTO tbl_permisos (nombre, descripcion, codigo)
          VALUES ('Iniciar Turnos', 'Permite iniciar turnos', 'iniciar_turnos')
          RETURNING id INTO permiso_iniciar_id;
        END IF;
        
        -- Verificar si existe el permiso finalizar_turnos
        SELECT id INTO permiso_finalizar_id FROM tbl_permisos WHERE codigo = 'finalizar_turnos';
        
        -- Si no existe, crearlo
        IF permiso_finalizar_id IS NULL THEN
          INSERT INTO tbl_permisos (nombre, descripcion, codigo)
          VALUES ('Finalizar Turnos', 'Permite finalizar turnos', 'finalizar_turnos')
          RETURNING id INTO permiso_finalizar_id;
        END IF;
        
        -- Obtener el ID del rol Vendedor
        SELECT id INTO rol_vendedor_id FROM tbl_roles WHERE nombre = 'Vendedor';
        
        -- Si existe el rol Vendedor, asignar los permisos
        IF rol_vendedor_id IS NOT NULL THEN
          -- Verificar si ya tiene el permiso iniciar_turnos
          IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = rol_vendedor_id AND permiso_id = permiso_iniciar_id) THEN
            INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
            VALUES (rol_vendedor_id, permiso_iniciar_id);
          END IF;
          
          -- Verificar si ya tiene el permiso finalizar_turnos
          IF NOT EXISTS (SELECT 1 FROM tbl_permisos_roles WHERE rol_id = rol_vendedor_id AND permiso_id = permiso_finalizar_id) THEN
            INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
            VALUES (rol_vendedor_id, permiso_finalizar_id);
          END IF;
        END IF;
      END $$;
    `);
    
    console.log('Migración completada: Permisos de turnos asignados al rol Vendedor');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar los permisos del rol Vendedor
    await queryRunner.query(`
      DO $$
      DECLARE
        permiso_iniciar_id INT;
        permiso_finalizar_id INT;
        rol_vendedor_id INT;
      BEGIN
        -- Obtener IDs de permisos
        SELECT id INTO permiso_iniciar_id FROM tbl_permisos WHERE codigo = 'iniciar_turnos';
        SELECT id INTO permiso_finalizar_id FROM tbl_permisos WHERE codigo = 'finalizar_turnos';
        
        -- Obtener ID del rol Vendedor
        SELECT id INTO rol_vendedor_id FROM tbl_roles WHERE nombre = 'Vendedor';
        
        -- Eliminar asignaciones de permisos si existen
        IF rol_vendedor_id IS NOT NULL THEN
          DELETE FROM tbl_permisos_roles 
          WHERE rol_id = rol_vendedor_id 
            AND permiso_id IN (permiso_iniciar_id, permiso_finalizar_id);
        END IF;
      END $$;
    `);
    
    console.log('Rollback completado: Permisos de turnos eliminados del rol Vendedor');
  }
}
