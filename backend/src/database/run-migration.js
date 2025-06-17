const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Post2025',
    database: process.env.DB_DATABASE || 'db_famisuper',
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos PostgreSQL');

    const sqlPath = path.join(__dirname, 'add-codigo-column.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando migración...');
    await client.query(sqlContent);
    console.log('Migración completada exitosamente');

  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

runMigration();
