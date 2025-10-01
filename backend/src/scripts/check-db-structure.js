const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'db_famisuper',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Post2025',
  });

  try {
    await client.connect();
    console.log('Conexión a la base de datos establecida');

    // Verificar si la tabla tbl_usuarios existe
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tbl_usuarios'
      );
    `);
    
    const tableExists = tableResult.rows[0].exists;
    console.log(`¿La tabla tbl_usuarios existe? ${tableExists}`);

    if (tableExists) {
      // Obtener la estructura de la tabla
      const columnResult = await client.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'tbl_usuarios'
        ORDER BY ordinal_position;
      `);
      
      console.log('Estructura de la tabla tbl_usuarios:');
      console.table(columnResult.rows);
    }

  } catch (error) {
    console.error('Error al verificar la estructura de la base de datos:', error);
  } finally {
    await client.end();
    console.log('Conexión a la base de datos cerrada');
  }
}

main().catch(console.error);
