import { DataSource } from 'typeorm';
import { dbConfig } from './database/config';

// DataSource para ejecutar migraciones desde CLI
export const AppDataSource = new DataSource({
  ...dbConfig,
  // Asegurarse de que las entidades y migraciones se carguen correctamente
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/migrations/[0-9]*{.ts,.js}'],
});
