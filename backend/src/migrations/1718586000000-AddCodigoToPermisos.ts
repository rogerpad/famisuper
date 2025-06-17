import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodigoToPermisos1718586000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la columna ya existe
    const tableExists = await queryRunner.hasTable('tbl_permisos');
    if (tableExists) {
      const columnExists = await queryRunner.hasColumn('tbl_permisos', 'codigo');
      if (!columnExists) {
        await queryRunner.query(`
          ALTER TABLE tbl_permisos 
          ADD COLUMN codigo VARCHAR(50) UNIQUE;
        `);
        
        // Actualizar los registros existentes con códigos basados en el nombre
        await queryRunner.query(`
          UPDATE tbl_permisos 
          SET codigo = LOWER(REPLACE(nombre, ' ', '_'));
        `);
        
        // Hacer la columna NOT NULL después de actualizar los datos
        await queryRunner.query(`
          ALTER TABLE tbl_permisos 
          ALTER COLUMN codigo SET NOT NULL;
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('tbl_permisos');
    if (tableExists) {
      const columnExists = await queryRunner.hasColumn('tbl_permisos', 'codigo');
      if (columnExists) {
        await queryRunner.query(`
          ALTER TABLE tbl_permisos 
          DROP COLUMN codigo;
        `);
      }
    }
  }
}
