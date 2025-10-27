import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Configuración de la base de datos PostgreSQL
export const dbConfig: TypeOrmModuleOptions & PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Post2025',
  database: process.env.DB_DATABASE || 'db_famisuper',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Desactivado temporalmente para evitar problemas con la estructura de la tabla
  logging: process.env.DB_LOGGING === 'true',
  autoLoadEntities: true,
  migrations: [__dirname + '/migrations/[0-9]*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl: false,
  // Configuración adicional para mejorar la estabilidad de la conexión
  retryAttempts: 10,
  retryDelay: 3000,
  keepConnectionAlive: true,
  extra: {
    // Configuración adicional para mejorar la conexión
    max: 20, // máximo de conexiones en el pool
    connectionTimeoutMillis: 5000, // tiempo de espera para la conexión
  },
};

// Función para obtener la configuración de la base de datos
export const getDbConfig = (): TypeOrmModuleOptions & PostgresConnectionOptions => {
  return dbConfig;
};
