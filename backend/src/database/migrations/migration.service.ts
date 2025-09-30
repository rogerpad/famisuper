import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async onModuleInit() {
    await this.runMigration();
  }

  private async runMigration() {
    try {
      this.logger.log('Ejecutando migración para actualizar campo estado en transacciones...');
      
      // Verificar si la columna estado existe y su tipo
      const columnInfo = await this.getColumnInfo();
      
      if (!columnInfo.exists) {
        // Agregar la columna estado como boolean
        await this.dataSource.query(`ALTER TABLE tbl_transacciones_agentes ADD COLUMN estado BOOLEAN DEFAULT true`);
        this.logger.log('Columna estado agregada a la tabla tbl_transacciones_agentes como boolean');
      } else if (columnInfo.type === 'boolean') {
        // La columna ya es boolean, solo verificar que no hay valores NULL
        this.logger.log('Columna estado ya es de tipo boolean, verificando valores NULL...');
      } else if (columnInfo.type === 'integer') {
        // Si existe como integer, convertir a boolean (para bases de datos legacy)
        this.logger.log('Convirtiendo columna estado de integer a boolean...');
        
        // Primero, actualizar valores integer a boolean equivalentes
        await this.dataSource.query(`UPDATE tbl_transacciones_agentes SET estado = CASE WHEN estado = 1 THEN true ELSE false END WHERE estado IS NOT NULL`);
        
        // Cambiar el tipo de columna
        await this.dataSource.query(`ALTER TABLE tbl_transacciones_agentes ALTER COLUMN estado TYPE BOOLEAN USING estado::boolean`);
        this.logger.log('Columna estado convertida a boolean exitosamente');
      }
      
      // Actualizar registros NULL a true (activo por defecto)
      await this.dataSource.query(`UPDATE tbl_transacciones_agentes SET estado = true WHERE estado IS NULL`);
      this.logger.log('Registros NULL actualizados a true');
      
      // Agregar restricción NOT NULL si no existe
      await this.dataSource.query(`ALTER TABLE tbl_transacciones_agentes ALTER COLUMN estado SET NOT NULL`);
      this.logger.log('Restricción NOT NULL agregada a la columna estado');
      
      this.logger.log('Migración completada exitosamente');
    } catch (error) {
      this.logger.error(`Error al ejecutar la migración: ${error.message}`);
    }
  }

  private async checkIfColumnExists(): Promise<boolean> {
    const result = await this.dataSource.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'tbl_transacciones_agentes' AND column_name = 'estado'
    `);
    
    return result.length > 0;
  }

  private async getColumnInfo(): Promise<{ exists: boolean; type: string | null }> {
    const result = await this.dataSource.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'tbl_transacciones_agentes' AND column_name = 'estado'
    `);
    
    if (result.length === 0) {
      return { exists: false, type: null };
    }
    
    return { exists: true, type: result[0].data_type };
  }
}
