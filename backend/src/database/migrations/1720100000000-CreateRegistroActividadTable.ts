import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRegistroActividadTable1720100000000 implements MigrationInterface {
    name = 'CreateRegistroActividadTable1720100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla ya existe
        const tableExists = await queryRunner.hasTable('tbl_registros_actividad_turnos');
        if (!tableExists) {
            console.log('Creando tabla tbl_registros_actividad_turnos...');
            
            // Crear la tabla de registros de actividad
            await queryRunner.query(`
                CREATE TABLE "tbl_registros_actividad_turnos" (
                    "id" SERIAL NOT NULL,
                    "accion" character varying(50) NOT NULL,
                    "fecha_hora" TIMESTAMP NOT NULL DEFAULT now(),
                    "descripcion" character varying(255),
                    "turno_id" integer,
                    "usuario_id" integer,
                    CONSTRAINT "PK_registros_actividad_turnos" PRIMARY KEY ("id")
                )
            `);
            
            // Crear las restricciones de clave foránea
            await queryRunner.query(`
                ALTER TABLE "tbl_registros_actividad_turnos" 
                ADD CONSTRAINT "FK_registros_actividad_turnos_turno" 
                FOREIGN KEY ("turno_id") REFERENCES "tbl_turnos"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
            
            await queryRunner.query(`
                ALTER TABLE "tbl_registros_actividad_turnos" 
                ADD CONSTRAINT "FK_registros_actividad_turnos_usuario" 
                FOREIGN KEY ("usuario_id") REFERENCES "tbl_users"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
            
            console.log('Tabla tbl_registros_actividad_turnos creada exitosamente');
        } else {
            console.log('La tabla tbl_registros_actividad_turnos ya existe');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la tabla existe antes de intentar eliminarla
        const tableExists = await queryRunner.hasTable('tbl_registros_actividad_turnos');
        if (tableExists) {
            console.log('Eliminando tabla tbl_registros_actividad_turnos...');
            
            // Eliminar las restricciones de clave foránea primero
            await queryRunner.query(`
                ALTER TABLE "tbl_registros_actividad_turnos" 
                DROP CONSTRAINT IF EXISTS "FK_registros_actividad_turnos_usuario"
            `);
            
            await queryRunner.query(`
                ALTER TABLE "tbl_registros_actividad_turnos" 
                DROP CONSTRAINT IF EXISTS "FK_registros_actividad_turnos_turno"
            `);
            
            // Eliminar la tabla
            await queryRunner.query(`DROP TABLE "tbl_registros_actividad_turnos"`);
            
            console.log('Tabla tbl_registros_actividad_turnos eliminada exitosamente');
        } else {
            console.log('La tabla tbl_registros_actividad_turnos no existe, no es necesario eliminarla');
        }
    }
}
