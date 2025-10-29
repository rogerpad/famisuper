import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para agregar el campo caja_numero a todas las tablas relacionadas con operación de Super
 * Esto permite separar las transacciones y cierres por caja
 */
export class AddCajaNumeroToSuperTables1729860100000 implements MigrationInterface {
  name = 'AddCajaNumeroToSuperTables1729860100000';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tablasSuper = [
      'tbl_cierres_super',
      'tbl_super_expenses',
      'tbl_super_bill_count',
      'tbl_balance_flows',
      'tbl_balance_sales',
      'tbl_additional_loans'
    ];

    for (const tabla of tablasSuper) {
      // Verificar si la tabla existe antes de alterar
      const tableExists = await queryRunner.hasTable(tabla);
      
      if (tableExists) {
        // Agregar columna caja_numero
        await queryRunner.query(`
          ALTER TABLE ${tabla} 
          ADD COLUMN IF NOT EXISTS caja_numero INTEGER DEFAULT NULL;
        `);

        // Agregar comentario
        await queryRunner.query(`
          COMMENT ON COLUMN ${tabla}.caja_numero IS 
          'Número de caja para operación de Super (1, 2, etc). NULL si no aplica o es operación de agentes';
        `);

        console.log(`✅ Columna caja_numero agregada a ${tabla}`);
      } else {
        console.log(`⚠️ Tabla ${tabla} no existe, se omite`);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tablasSuper = [
      'tbl_cierres_super',
      'tbl_super_expenses',
      'tbl_super_bill_count',
      'tbl_balance_flows',
      'tbl_balance_sales',
      'tbl_additional_loans'
    ];

    for (const tabla of tablasSuper) {
      const tableExists = await queryRunner.hasTable(tabla);
      
      if (tableExists) {
        await queryRunner.query(`
          ALTER TABLE ${tabla} 
          DROP COLUMN IF EXISTS caja_numero;
        `);

        console.log(`✅ Columna caja_numero eliminada de ${tabla}`);
      }
    }
  }
}
