const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updatePermisosCodigo() {
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

    const sqlPath = path.join(__dirname, 'update-permisos-codigo.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el script en instrucciones individuales
    const instructions = sqlContent.split(';');

    console.log('Ejecutando script de actualización de códigos de permisos...');
    
    // Ejecutar cada instrucción por separado y mostrar resultados
    for (const instruction of instructions) {
      const trimmedInstruction = instruction.trim();
      if (trimmedInstruction && !trimmedInstruction.startsWith('--')) {
        try {
          const result = await client.query(trimmedInstruction + ';');
          
          // Si la consulta devuelve resultados, mostrarlos
          if (result.rows && result.rows.length > 0) {
            console.log('\n--- Resultados de la consulta ---');
            console.table(result.rows);
          }
        } catch (err) {
          console.error(`Error al ejecutar: ${trimmedInstruction}`);
          console.error(err);
        }
      }
    }

    console.log('\nVerificando permisos actualizados:');
    const result = await client.query(`
      SELECT id, nombre, codigo, modulo
      FROM tbl_permisos
      ORDER BY id;
    `);
    
    console.table(result.rows);
    console.log(`\nTotal de permisos: ${result.rows.length}`);
    
    // Verificar si hay permisos sin código
    const nullCodigos = await client.query(`
      SELECT COUNT(*) as sin_codigo
      FROM tbl_permisos
      WHERE codigo IS NULL OR codigo = '';
    `);
    
    console.log(`Permisos sin código: ${nullCodigos.rows[0].sin_codigo}`);

  } catch (error) {
    console.error('Error al ejecutar el script de actualización de permisos:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

updatePermisosCodigo();
