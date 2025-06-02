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
      
      // Verificar si la columna estado existe
      const columnExists = await this.checkIfColumnExists();
      
      if (!columnExists) {
        // Agregar la columna estado
        await this.dataSource.query(`ALTER TABLE tbl_transacciones_agentes ADD COLUMN estado INTEGER DEFAULT 1`);
        this.logger.log('Columna estado agregada a la tabla tbl_transacciones_agentes');
      }
      
      // Actualizar todas las transacciones existentes para que tengan estado = 1
      await this.dataSource.query(`UPDATE tbl_transacciones_agentes SET estado = 1 WHERE estado IS NULL`);
      this.logger.log('Todas las transacciones han sido actualizadas con estado = 1');
      
      // Agregar restricción NOT NULL a la columna estado
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
}
