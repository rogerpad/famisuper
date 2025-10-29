import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para agregar el campo caja_numero a tbl_usuarios_turnos
 * Permite identificar qué caja está usando el usuario en la operación de Super
 */
export class AddCajaNumeroToUsuariosTurnos1729860000000 implements MigrationInterface {
  name = 'AddCajaNumeroToUsuariosTurnos1729860000000';
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna caja_numero
    await queryRunner.query(`
      ALTER TABLE tbl_usuarios_turnos 
      ADD COLUMN caja_numero INTEGER DEFAULT NULL;
    `);

    // Agregar comentario para documentación
    await queryRunner.query(`
      COMMENT ON COLUMN tbl_usuarios_turnos.caja_numero IS 
      'Número de caja asignada para operación de Super (1, 2, etc). NULL para operación de Agentes o turno inactivo';
    `);

    console.log('✅ Columna caja_numero agregada a tbl_usuarios_turnos');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: eliminar columna
    await queryRunner.query(`
      ALTER TABLE tbl_usuarios_turnos 
      DROP COLUMN IF EXISTS caja_numero;
    `);

    console.log('✅ Columna caja_numero eliminada de tbl_usuarios_turnos');
  }
}
