import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class FixUsuariosTurnosMigration {
  private readonly logger = new Logger(FixUsuariosTurnosMigration.name);

  constructor(private dataSource: DataSource) {}

  async run() {
    try {
      this.logger.log('Verificando estructura de la tabla tbl_usuarios_turnos...');
      
      // Verificar si la tabla existe
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        this.logger.log('Tabla tbl_usuarios_turnos no existe, omitiendo migración');
        return;
      }

      // Verificar y corregir columnas si es necesario
      await this.ensureColumnsExist();
      
      this.logger.log('Verificación de tbl_usuarios_turnos completada exitosamente.');
    } catch (error) {
      this.logger.error('Error al ejecutar la migración de tbl_usuarios_turnos:', error.message);
      // No lanzar el error para evitar que falle el inicio del backend
    }
  }

  private async checkTableExists(): Promise<boolean> {
    const result = await this.dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'tbl_usuarios_turnos'
      )
    `);
    
    return result[0]?.exists || false;
  }

  private async ensureColumnsExist() {
    // Verificar columnas esenciales y agregarlas si no existen
    const requiredColumns = [
      { name: 'activo', type: 'BOOLEAN', default: 'true' },
      { name: 'agente', type: 'BOOLEAN', default: 'false' },
      { name: 'super', type: 'BOOLEAN', default: 'false' }
    ];

    for (const column of requiredColumns) {
      const exists = await this.checkColumnExists(column.name);
      if (!exists) {
        await this.dataSource.query(`
          ALTER TABLE tbl_usuarios_turnos 
          ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}
        `);
        this.logger.log(`Columna ${column.name} agregada a tbl_usuarios_turnos`);
      }
    }
  }

  private async checkColumnExists(columnName: string): Promise<boolean> {
    const result = await this.dataSource.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'tbl_usuarios_turnos' AND column_name = $1
    `, [columnName]);
    
    return result.length > 0;
  }
}
