import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para renombrar turno_id a usuario_turno_id en tbl_cierres_super
 * Esto mejora la claridad del código indicando que se refiere a tbl_usuarios_turnos
 * y no a tbl_turnos
 */
export class RenameTurnoIdToUsuarioTurnoId1729890000000 implements MigrationInterface {
  name = 'RenameTurnoIdToUsuarioTurnoId1729890000000';
  
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('📋 Iniciando migración: Renombrar turno_id a usuario_turno_id');
    
    const tabla = 'tbl_cierres_super';

    // Verificar si la tabla existe
    const tableExists = await queryRunner.hasTable(tabla);
    
    if (!tableExists) {
      console.log(`⚠️  Tabla ${tabla} no existe, se omite migración`);
      return;
    }

    // Verificar si la columna turno_id existe
    const oldColumnExists = await queryRunner.hasColumn(tabla, 'turno_id');
    
    if (!oldColumnExists) {
      console.log(`⚠️  Columna turno_id no existe en ${tabla}, se omite`);
      return;
    }

    // Verificar si la columna usuario_turno_id ya existe
    const newColumnExists = await queryRunner.hasColumn(tabla, 'usuario_turno_id');
    
    if (newColumnExists) {
      console.log(`⚠️  Columna usuario_turno_id ya existe en ${tabla}`);
      return;
    }

    try {
      // 1. Eliminar Foreign Key antiguo
      console.log('🔧 Eliminando Foreign Key antiguo...');
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        DROP CONSTRAINT IF EXISTS fk_cierre_super_turno;
      `);
      console.log('  ✅ Foreign Key eliminado');

      // 2. Eliminar índice antiguo
      console.log('🔧 Eliminando índice antiguo...');
      await queryRunner.query(`
        DROP INDEX IF EXISTS idx_cierres_super_turno_id;
      `);
      console.log('  ✅ Índice eliminado');

      // 3. Renombrar columna
      console.log('🔧 Renombrando columna turno_id a usuario_turno_id...');
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        RENAME COLUMN turno_id TO usuario_turno_id;
      `);
      console.log('  ✅ Columna renombrada');

      // 4. Crear nuevo Foreign Key
      console.log('🔧 Creando nuevo Foreign Key...');
      const newConstraintName = 'fk_cierre_super_usuario_turno';
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        ADD CONSTRAINT ${newConstraintName}
        FOREIGN KEY (usuario_turno_id) 
        REFERENCES tbl_usuarios_turnos(id) 
        ON DELETE SET NULL;
      `);
      console.log(`  ✅ Foreign Key ${newConstraintName} creado`);

      // 5. Crear nuevo índice
      console.log('🔧 Creando nuevo índice...');
      const newIndexName = 'idx_cierres_super_usuario_turno_id';
      await queryRunner.query(`
        CREATE INDEX ${newIndexName} ON ${tabla}(usuario_turno_id);
      `);
      console.log(`  ✅ Índice ${newIndexName} creado`);

      // 6. Actualizar comentario
      console.log('🔧 Actualizando comentario...');
      await queryRunner.query(`
        COMMENT ON COLUMN ${tabla}.usuario_turno_id IS 
        'ID del registro de usuario-turno (tbl_usuarios_turnos) que generó este cierre. Permite trazabilidad completa del turno real trabajado (usuario, caja, horarios).';
      `);
      console.log('  ✅ Comentario actualizado');

      console.log('\n✅ Migración completada exitosamente');
      console.log('📊 Columna renombrada: turno_id → usuario_turno_id');
    } catch (error) {
      console.error(`❌ Error en la migración:`, error.message);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('📋 Revirtiendo migración: Renombrar usuario_turno_id a turno_id');
    
    const tabla = 'tbl_cierres_super';

    const tableExists = await queryRunner.hasTable(tabla);
    
    if (!tableExists) {
      console.log(`⚠️  Tabla ${tabla} no existe, se omite reversión`);
      return;
    }

    try {
      // 1. Eliminar Foreign Key nuevo
      console.log('🔧 Eliminando Foreign Key nuevo...');
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        DROP CONSTRAINT IF EXISTS fk_cierre_super_usuario_turno;
      `);
      console.log('  ✅ Foreign Key eliminado');

      // 2. Eliminar índice nuevo
      console.log('🔧 Eliminando índice nuevo...');
      await queryRunner.query(`
        DROP INDEX IF EXISTS idx_cierres_super_usuario_turno_id;
      `);
      console.log('  ✅ Índice eliminado');

      // 3. Renombrar columna de vuelta
      console.log('🔧 Renombrando columna usuario_turno_id a turno_id...');
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        RENAME COLUMN usuario_turno_id TO turno_id;
      `);
      console.log('  ✅ Columna renombrada');

      // 4. Recrear Foreign Key antiguo
      console.log('🔧 Recreando Foreign Key antiguo...');
      await queryRunner.query(`
        ALTER TABLE ${tabla} 
        ADD CONSTRAINT fk_cierre_super_turno
        FOREIGN KEY (turno_id) 
        REFERENCES tbl_usuarios_turnos(id) 
        ON DELETE SET NULL;
      `);
      console.log('  ✅ Foreign Key recreado');

      // 5. Recrear índice antiguo
      console.log('🔧 Recreando índice antiguo...');
      await queryRunner.query(`
        CREATE INDEX idx_cierres_super_turno_id ON ${tabla}(turno_id);
      `);
      console.log('  ✅ Índice recreado');

      // 6. Restaurar comentario antiguo
      await queryRunner.query(`
        COMMENT ON COLUMN ${tabla}.turno_id IS 
        'ID del turno que generó este cierre. Permite trazabilidad completa del turno (usuario, caja, horarios) asociado al cierre.';
      `);

      console.log('✅ Reversión completada');
    } catch (error) {
      console.error(`❌ Error revirtiendo migración:`, error.message);
      throw error;
    }
  }
}
