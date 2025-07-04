import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FixUsuariosTurnosMigration {
  constructor(private dataSource: DataSource) {}

  async run() {
    try {
      console.log('Ejecutando migración para corregir la tabla tbl_usuarios_turnos...');
      
      // Leer el script SQL desde el archivo
      const sqlPath = path.join(__dirname, '../fix-usuarios-turnos.sql');
      const sqlScript = fs.readFileSync(sqlPath, 'utf8');
      
      // Ejecutar el script SQL
      await this.dataSource.query(sqlScript);
      
      console.log('Migración completada exitosamente.');
    } catch (error) {
      console.error('Error al ejecutar la migración:', error);
    }
  }
}
