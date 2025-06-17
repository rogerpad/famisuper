const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function updateVendedorPermissions() {
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

    const sqlPath = path.join(__dirname, 'update-vendedor-permissions.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Ejecutando script para actualizar permisos del rol de Vendedor...');
    await client.query(sqlContent);
    
    // Verificar que el usuario Mari tenga el rol de Vendedor
    console.log('\nVerificando que Mari tenga el rol de Vendedor:');
    const userResult = await client.query(`
      SELECT u.id, u.username, r.nombre as rol_nombre
      FROM tbl_usuarios u
      LEFT JOIN tbl_roles r ON u.rol_id = r.id
      WHERE u.username = 'mari';
    `);
    
    if (userResult.rows.length > 0) {
      console.table(userResult.rows);
    } else {
      console.log('No se encontró el usuario Mari en la base de datos.');
    }
    
    // Verificar los permisos asignados al rol de Vendedor
    console.log('\nPermisos asignados al rol de Vendedor:');
    const permisosResult = await client.query(`
      SELECT p.id, p.nombre, p.codigo, p.modulo
      FROM tbl_permisos p
      JOIN tbl_permisos_roles pr ON p.id = pr.permiso_id
      JOIN tbl_roles r ON pr.rol_id = r.id
      WHERE r.nombre = 'Vendedor'
      ORDER BY p.modulo, p.nombre;
    `);
    
    if (permisosResult.rows.length > 0) {
      console.table(permisosResult.rows);
      console.log(`\nTotal de permisos asignados: ${permisosResult.rows.length}`);
    } else {
      console.log('No se encontraron permisos asignados al rol de Vendedor.');
    }

  } catch (error) {
    console.error('Error al ejecutar el script:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

updateVendedorPermissions();
