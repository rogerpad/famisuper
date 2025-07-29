import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConteoBilletesTable1721600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear la nueva tabla tbl_conteo_billetes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tbl_conteo_billetes (
        id SERIAL PRIMARY KEY,
        billete NUMERIC NOT NULL,
        cantidad INTEGER NOT NULL,
        total_billete NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        turno_id BIGINT NULL,
        CONSTRAINT fk_turno
          FOREIGN KEY (turno_id)
          REFERENCES tbl_turnos (id)
          ON DELETE SET NULL
      )
    `);

    // Copiar datos de la tabla antigua si existe
    await queryRunner.query(`
      INSERT INTO tbl_conteo_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
      SELECT billete, cantidad, total_billete, total, activo, fecha_registro, turno_id
      FROM tbl_billetes
      WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tbl_billetes')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la tabla
    await queryRunner.query(`DROP TABLE IF EXISTS tbl_conteo_billetes`);
  }
}
