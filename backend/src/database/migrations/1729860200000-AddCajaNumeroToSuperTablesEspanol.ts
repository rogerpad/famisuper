import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para agregar el campo caja_numero a las tablas de Super con nombres en español
 * Actualización necesaria porque los nombres de las tablas están en español
 */
export class AddCajaNumeroToSuperTablesEspanol1729860200000 implements MigrationInterface {
  name = 'AddCajaNumeroToSuperTablesEspanol1729860200000';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tablas de Super con nombres en español
    const tablasSuper = [
      'tbl_egresos_super',           // Egresos de Super
      'tbl_conteo_billetes_super',   // Conteo de billetes
      'tbl_flujos_saldo',            // Flujos de saldo
      'tbl_ventas_saldo',            // Ventas de paquetes/saldo
      'tbl_adic_prest'               // Adicionales y préstamos
    ];

    for (const tabla of tablasSuper) {
      // Verificar si la tabla existe antes de alterar
      const tableExists = await queryRunner.hasTable(tabla);
      
      if (tableExists) {
        // Verificar si la columna ya existe
        const columnExists = await queryRunner.hasColumn(tabla, 'caja_numero');
        
        if (!columnExists) {
          // Agregar columna caja_numero
          await queryRunner.query(`
            ALTER TABLE ${tabla} 
            ADD COLUMN caja_numero INTEGER DEFAULT NULL;
          `);

          // Agregar comentario para documentación
          await queryRunner.query(`
            COMMENT ON COLUMN ${tabla}.caja_numero IS 
            'Número de caja para operación de Super (1, 2, etc). NULL si no aplica o es operación de agentes';
          `);

          console.log(`✅ Columna caja_numero agregada a ${tabla}`);
        } else {
          console.log(`⚠️  Columna caja_numero ya existe en ${tabla}`);
        }
      } else {
        console.log(`⚠️  Tabla ${tabla} no existe, se omite`);
      }
    }

    console.log('✅ Migración completada: caja_numero agregado a todas las tablas de Super en español');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tablasSuper = [
      'tbl_egresos_super',
      'tbl_conteo_billetes_super',
      'tbl_flujos_saldo',
      'tbl_ventas_saldo',
      'tbl_adic_prest'
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
