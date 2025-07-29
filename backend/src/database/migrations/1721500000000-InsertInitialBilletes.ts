import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertInitialBilletes1721500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insertar billetes iniciales
    await queryRunner.query(`
      INSERT INTO tbl_billetes (billete, cantidad, total_billete, total, activo, fecha_registro, turno_id)
      VALUES
        (500, 5, 2500, 2500, true, NOW(), NULL),
        (200, 10, 2000, 4500, true, NOW(), NULL),
        (100, 15, 1500, 6000, true, NOW(), NULL),
        (50, 20, 1000, 7000, true, NOW(), NULL),
        (20, 25, 500, 7500, true, NOW(), NULL),
        (10, 30, 300, 7800, true, NOW(), NULL),
        (5, 40, 200, 8000, true, NOW(), NULL),
        (2, 50, 100, 8100, true, NOW(), NULL),
        (1, 100, 100, 8200, true, NOW(), NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar los billetes insertados por esta migración
    await queryRunner.query(`
      DELETE FROM tbl_billetes 
      WHERE billete IN (500, 200, 100, 50, 20, 10, 5, 2, 1)
    `);
  }
}
