import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.logger.log('Servicio de base de datos inicializado');
  }

  /**
   * Obtiene la conexión a la base de datos
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Verifica si la conexión a la base de datos está activa
   */
  async isConnected(): Promise<boolean> {
    try {
      return this.dataSource.isInitialized;
    } catch (error) {
      this.logger.error('Error al verificar la conexión', error);
      return false;
    }
  }

  /**
   * Obtiene la lista de tablas en la base de datos
   */
  async getTables(): Promise<string[]> {
    const tables = await this.dataSource.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    return tables.map((table: { table_name: string }) => table.table_name);
  }
}
