import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para agregar el campo turno_id a tbl_cierres_super
 * Este campo relaciona cada cierre con el turno que lo generó
 * Se agrega como FOREIGN KEY para mantener integridad referencial
 */
export class AddTurnoIdToSuperClosings1729880000000 implements MigrationInterface {
  name = 'AddTurnoIdToSuperClosings1729880000000';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('📋 Iniciando migración: Agregar turno_id a tbl_cierres_super');
    
    const tabla = 'tbl_cierres_super';

    // Verificar si la tabla existe
    const tableExists = await queryRunner.hasTable(tabla);
    
    if (!tableExists) {
      console.log(`⚠️  Tabla ${tabla} no existe, se omite migración`);
      return;
    }

    // Verificar si la columna ya existe
    const columnExists = await queryRunner.hasColumn(tabla, 'turno_id');
    
    if (columnExists) {
      console.log(`⚠️  Columna turno_id ya existe en ${tabla}`);
      return;
    }

    try {
      // 1. Agregar columna turno_id
      console.log('🔧 Agregando columna turno_id...');
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        ADD COLUMN turno_id INTEGER DEFAULT NULL;
      `);
      console.log('  ✅ Columna turno_id agregada');

      // 2. Agregar FOREIGN KEY a tbl_usuarios_turnos
      const constraintName = 'fk_cierre_super_turno';
      console.log('🔧 Creando Foreign Key...');
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        ADD CONSTRAINT ${constraintName}
        FOREIGN KEY (turno_id) 
        REFERENCES tbl_usuarios_turnos(id) 
        ON DELETE SET NULL;
      `);
      console.log(`  ✅ Foreign Key ${constraintName} creada`);

      // 3. Agregar índice para mejorar performance en queries
      const indexName = 'idx_cierres_super_turno_id';
      console.log('🔧 Creando índice...');
      await queryRunner.query(`
        CREATE INDEX ${indexName} ON ${tabla}(turno_id);
      `);
      console.log(`  ✅ Índice ${indexName} creado`);

      // 4. Agregar comentario para documentación
      console.log('🔧 Agregando comentario...');
      await queryRunner.query(`
        COMMENT ON COLUMN ${tabla}.turno_id IS 
        'ID del turno que generó este cierre. Permite trazabilidad completa del turno (usuario, caja, horarios) asociado al cierre.';
      `);
      console.log('  ✅ Comentario agregado');

      console.log('\n✅ Migración completada exitosamente');
      console.log('📊 tbl_cierres_super ahora tiene relación con tbl_usuarios_turnos');
    } catch (error) {
      console.error(`❌ Error en la migración:`, error.message);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('📋 Revirtiendo migración: Eliminar turno_id de tbl_cierres_super');
    
    const tabla = 'tbl_cierres_super';

    const tableExists = await queryRunner.hasTable(tabla);
    
    if (!tableExists) {
      console.log(`⚠️  Tabla ${tabla} no existe, se omite reversión`);
      return;
    }

    try {
      // 1. Eliminar Foreign Key
      const constraintName = 'fk_cierre_super_turno';
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        DROP CONSTRAINT IF EXISTS ${constraintName};
      `);
      console.log(`  ✅ Foreign Key ${constraintName} eliminada`);

      // 2. Eliminar índice
      const indexName = 'idx_cierres_super_turno_id';
      await queryRunner.query(`
        DROP INDEX IF EXISTS ${indexName};
      `);
      console.log(`  ✅ Índice ${indexName} eliminado`);

      // 3. Eliminar columna
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        DROP COLUMN IF EXISTS turno_id;
      `);
      console.log(`  ✅ Columna turno_id eliminada`);

      console.log('✅ Reversión completada');
    } catch (error) {
      console.error(`❌ Error revirtiendo migración:`, error.message);
      throw error;
    }
  }
}
