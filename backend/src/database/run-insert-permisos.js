const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runInsertPermisos() {
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

    const sqlPath = path.join(__dirname, 'insert-permisos.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando script de inserción de permisos...');
    await client.query(sqlContent);
    console.log('Permisos insertados exitosamente');

  } catch (error) {
    console.error('Error al ejecutar el script de permisos:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

runInsertPermisos();
