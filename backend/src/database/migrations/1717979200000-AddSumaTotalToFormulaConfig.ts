import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSumaTotalToFormulaConfig1717979200000 implements MigrationInterface {
    name = 'AddSumaTotalToFormulaConfig1717979200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_configuracion_formulas" ADD "suma_total" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_configuracion_formulas" DROP COLUMN "suma_total"`);
    }
}
