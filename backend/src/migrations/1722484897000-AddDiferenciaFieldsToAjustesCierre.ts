import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiferenciaFieldsToAjustesCierre1722484897000 implements MigrationInterface {
    name = 'AddDiferenciaFieldsToAjustesCierre1722484897000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna diferencia_anterior
        await queryRunner.query(`
            ALTER TABLE "tbl_ajustes_cierre" 
            ADD COLUMN IF NOT EXISTS "diferencia_anterior" DECIMAL(10,2) DEFAULT 0
        `);

        // Agregar columna diferencia_nueva
        await queryRunner.query(`
            ALTER TABLE "tbl_ajustes_cierre" 
            ADD COLUMN IF NOT EXISTS "diferencia_nueva" DECIMAL(10,2) DEFAULT 0
        `);
        
        console.log('Migración AddDiferenciaFieldsToAjustesCierre ejecutada correctamente');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna diferencia_nueva
        await queryRunner.query(`
            ALTER TABLE "tbl_ajustes_cierre" 
            DROP COLUMN IF EXISTS "diferencia_nueva"
        `);

        // Eliminar columna diferencia_anterior
        await queryRunner.query(`
            ALTER TABLE "tbl_ajustes_cierre" 
            DROP COLUMN IF EXISTS "diferencia_anterior"
        `);
        
        console.log('Migración AddDiferenciaFieldsToAjustesCierre revertida correctamente');
    }
}
