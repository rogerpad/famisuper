import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para agregar el campo cierre_id a las tablas de operaciones de Super
 * Este campo relaciona cada registro con el cierre correspondiente
 * Se agrega como FOREIGN KEY para mantener integridad referencial
 */
export class AddCierreIdToSuperTables1729870000000 implements MigrationInterface {
  name = 'AddCierreIdToSuperTables1729870000000';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('📋 Iniciando migración: Agregar cierre_id a tablas de Super');
    
    const tablas = [
      'tbl_egresos_super',           // Egresos de Super
      'tbl_conteo_billetes_super',   // Conteo de billetes
      'tbl_flujos_saldo',            // Flujos de saldo
      'tbl_ventas_saldo',            // Ventas de paquetes/saldo
      'tbl_adic_prest'               // Adicionales y préstamos
    ];

    for (const tabla of tablas) {
      console.log(`\n🔧 Procesando tabla: ${tabla}`);
      
      // Verificar si la tabla existe
      const tableExists = await queryRunner.hasTable(tabla);
      
      if (!tableExists) {
        console.log(`⚠️  Tabla ${tabla} no existe, se omite`);
        continue;
      }

      // Verificar si la columna ya existe
      const columnExists = await queryRunner.hasColumn(tabla, 'cierre_id');
      
      if (columnExists) {
        console.log(`⚠️  Columna cierre_id ya existe en ${tabla}`);
        continue;
      }

      try {
        // 1. Agregar columna cierre_id
        await queryRunner.query(`
          ALTER TABLE ${tabla} 
          ADD COLUMN cierre_id INTEGER DEFAULT NULL;
        `);
        console.log(`  ✅ Columna cierre_id agregada`);

        // 2. Agregar FOREIGN KEY
        const constraintName = `fk_${tabla}_cierre`;
        await queryRunner.query(`
          ALTER TABLE ${tabla} 
          ADD CONSTRAINT ${constraintName}
          FOREIGN KEY (cierre_id) 
          REFERENCES tbl_cierres_super(id) 
          ON DELETE SET NULL;
        `);
        console.log(`  ✅ Foreign Key ${constraintName} creada`);

        // 3. Agregar índice para mejorar performance en queries
        const indexName = `idx_${tabla}_cierre_id`;
        await queryRunner.query(`
          CREATE INDEX ${indexName} ON ${tabla}(cierre_id);
        `);
        console.log(`  ✅ Índice ${indexName} creado`);

        // 4. Agregar comentario para documentación
        await queryRunner.query(`
          COMMENT ON COLUMN ${tabla}.cierre_id IS 
          'ID del cierre de super al que pertenece este registro. NULL = registro aún no cerrado, disponible para el próximo cierre';
        `);
        console.log(`  ✅ Comentario agregado`);

        console.log(`✅ ${tabla} completada exitosamente`);
      } catch (error) {
        console.error(`❌ Error procesando ${tabla}:`, error.message);
        throw error;
      }
    }

    console.log('\n✅ Migración completada: cierre_id agregado a todas las tablas de Super');
    console.log('📊 Resumen: 5 tablas actualizadas con Foreign Key a tbl_cierres_super');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('📋 Revirtiendo migración: Eliminar cierre_id de tablas de Super');
    
    const tablas = [
      'tbl_egresos_super',
      'tbl_conteo_billetes_super',
      'tbl_flujos_saldo',
      'tbl_ventas_saldo',
      'tbl_adic_prest'
    ];

    for (const tabla of tablas) {
      const tableExists = await queryRunner.hasTable(tabla);
      
      if (!tableExists) {
        console.log(`⚠️  Tabla ${tabla} no existe, se omite`);
        continue;
      }

      try {
        // 1. Eliminar Foreign Key
        const constraintName = `fk_${tabla}_cierre`;
        await queryRunner.query(`
          ALTER TABLE ${tabla} 
          DROP CONSTRAINT IF EXISTS ${constraintName};
        `);
        console.log(`  ✅ Foreign Key ${constraintName} eliminada de ${tabla}`);

        // 2. Eliminar índice
        const indexName = `idx_${tabla}_cierre_id`;
        await queryRunner.query(`
          DROP INDEX IF EXISTS ${indexName};
        `);
        console.log(`  ✅ Índice ${indexName} eliminado de ${tabla}`);

        // 3. Eliminar columna
        await queryRunner.query(`
          ALTER TABLE ${tabla} 
          DROP COLUMN IF EXISTS cierre_id;
        `);
        console.log(`  ✅ Columna cierre_id eliminada de ${tabla}`);
      } catch (error) {
        console.error(`❌ Error revirtiendo ${tabla}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Reversión completada');
  }
}
