import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReorderAndAddTurnoIdToAgentClosings1686536584000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si la tabla existe
    const tableExists = await queryRunner.hasTable('tbl_cierre_final_agentes');
    if (!tableExists) {
      console.log('La tabla tbl_cierre_final_agentes no existe. Saltando migración.');
      return;
    }

    console.log('Iniciando migración para reordenar columnas y agregar turno_id a tbl_cierre_final_agentes');

    // Crear tabla temporal con el nuevo orden de columnas y la nueva columna turno_id
    await queryRunner.query(`
      CREATE TABLE tbl_cierre_final_agentes_temp (
        id SERIAL PRIMARY KEY,
        proveedor_id INTEGER NOT NULL,
        turno_id INTEGER,
        fecha_cierre DATE NOT NULL,
        saldo_inicial DECIMAL(10,2) DEFAULT 0,
        adicional_cta DECIMAL(10,2) DEFAULT 0,
        resultado_final DECIMAL(10,2) DEFAULT 0,
        saldo_final DECIMAL(10,2) DEFAULT 0,
        diferencia DECIMAL(10,2) DEFAULT 0,
        
        observaciones TEXT,
        estado VARCHAR DEFAULT 'activo',
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_proveedor_temp FOREIGN KEY (proveedor_id) REFERENCES tbl_proveedores(id)
      )
    `);

    console.log('Tabla temporal creada con el nuevo orden de columnas y la columna turno_id');

    // Copiar datos con el nuevo orden y establecer turno_id como NULL para registros existentes
    await queryRunner.query(`
      INSERT INTO tbl_cierre_final_agentes_temp (
        id, proveedor_id, turno_id, fecha_cierre, 
        saldo_inicial, adicional_cta, resultado_final, saldo_final, diferencia,
        observaciones, estado, fecha_creacion, fecha_actualizacion
      )
      SELECT 
        id, proveedor_id, NULL, fecha_cierre, 
        saldo_inicial, adicional_cta, resultado_final, saldo_final, diferencia,
        observaciones, estado, fecha_creacion, fecha_actualizacion
      FROM tbl_cierre_final_agentes
    `);

    console.log('Datos copiados a la tabla temporal');

    // Eliminar tabla original (primero las restricciones de clave foránea)
    await queryRunner.query(`
      ALTER TABLE tbl_cierre_final_agentes 
      DROP CONSTRAINT IF EXISTS fk_proveedor
    `);
    await queryRunner.query(`DROP TABLE tbl_cierre_final_agentes`);

    console.log('Tabla original eliminada');

    // Renombrar tabla temporal
    await queryRunner.query(`ALTER TABLE tbl_cierre_final_agentes_temp RENAME TO tbl_cierre_final_agentes`);
    await queryRunner.query(`
      ALTER TABLE tbl_cierre_final_agentes 
      RENAME CONSTRAINT fk_proveedor_temp TO fk_proveedor
    `);

    console.log('Tabla temporal renombrada a tbl_cierre_final_agentes');
    console.log('Migración completada exitosamente');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Iniciando reversión de migración para tbl_cierre_final_agentes');
    
    // En caso de necesitar revertir, recreamos la tabla con el orden original sin la columna turno_id
    await queryRunner.query(`
      CREATE TABLE tbl_cierre_final_agentes_temp (
        id SERIAL PRIMARY KEY,
        proveedor_id INTEGER NOT NULL,
        fecha_cierre DATE NOT NULL,
        saldo_inicial DECIMAL(10,2) DEFAULT 0,
        adicional_cta DECIMAL(10,2) DEFAULT 0,
        resultado_final DECIMAL(10,2) DEFAULT 0,
        saldo_final DECIMAL(10,2) DEFAULT 0,
        diferencia DECIMAL(10,2) DEFAULT 0,
        observaciones TEXT,
        estado VARCHAR DEFAULT 'activo',
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_proveedor_temp FOREIGN KEY (proveedor_id) REFERENCES tbl_proveedores(id)
      )
    `);

    // Copiar datos con el orden original, omitiendo la columna turno_id
    await queryRunner.query(`
      INSERT INTO tbl_cierre_final_agentes_temp (
        id, proveedor_id, fecha_cierre, saldo_inicial, adicional_cta, 
        resultado_final, saldo_final, diferencia, observaciones, estado, 
        fecha_creacion, fecha_actualizacion
      )
      SELECT 
        id, proveedor_id, fecha_cierre, saldo_inicial, adicional_cta, 
        resultado_final, saldo_final, diferencia, observaciones, estado, 
        fecha_creacion, fecha_actualizacion
      FROM tbl_cierre_final_agentes
    `);

    // Eliminar tabla actual
    await queryRunner.query(`
      ALTER TABLE tbl_cierre_final_agentes 
      DROP CONSTRAINT IF EXISTS fk_proveedor
    `);
    await queryRunner.query(`DROP TABLE tbl_cierre_final_agentes`);

    // Renombrar tabla temporal
    await queryRunner.query(`ALTER TABLE tbl_cierre_final_agentes_temp RENAME TO tbl_cierre_final_agentes`);
    await queryRunner.query(`
      ALTER TABLE tbl_cierre_final_agentes 
      RENAME CONSTRAINT fk_proveedor_temp TO fk_proveedor
    `);

    console.log('Reversión completada exitosamente');
  }
}
