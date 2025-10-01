import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTipoEgresosTable1723652870000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Verificar si la tabla existe usando SQL directo
      const tablesResult = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'tbl_tipo_egresos'
        )
      `);
      
      const tableExists = tablesResult[0].exists;
      
      if (!tableExists) {
        // Si la tabla no existe, crearla desde cero
        await queryRunner.query(`
          CREATE TABLE tbl_tipo_egresos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            descripcion VARCHAR(255),
            activo BOOLEAN DEFAULT TRUE,
            fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        console.log('Tabla tbl_tipo_egresos creada correctamente');
      } else {
        // Si la tabla existe, verificar y agregar columnas faltantes usando SQL directo
        const columnsResult = await queryRunner.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'tbl_tipo_egresos'
        `);
        
        const columns = columnsResult.map(col => col.column_name);
        
        if (!columns.includes('activo')) {
          await queryRunner.query(`ALTER TABLE tbl_tipo_egresos ADD COLUMN activo BOOLEAN DEFAULT TRUE`);
          console.log('Columna activo agregada a la tabla tbl_tipo_egresos');
        }
        
        if (!columns.includes('fecha_creacion')) {
          await queryRunner.query(`ALTER TABLE tbl_tipo_egresos ADD COLUMN fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);
          console.log('Columna fecha_creacion agregada a la tabla tbl_tipo_egresos');
        }
        
        if (!columns.includes('fecha_actualizacion')) {
          await queryRunner.query(`ALTER TABLE tbl_tipo_egresos ADD COLUMN fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);
          console.log('Columna fecha_actualizacion agregada a la tabla tbl_tipo_egresos');
        }
        
        console.log('Tabla tbl_tipo_egresos actualizada correctamente');
      }
    } catch (error) {
      console.error('Error en la migración de tbl_tipo_egresos:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No eliminamos la tabla en el método down para evitar pérdida de datos
    // Si es necesario, se puede modificar para eliminar solo las columnas agregadas
    console.log('Método down no implementado para evitar pérdida de datos');
  }
}
