const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de la conexión
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Post2025',
  database: 'db_famisuper',
  connectionTimeoutMillis: 10000
});

async function createAdminUser() {
  const client = await pool.connect();
  try {
    console.log('Conexión exitosa a PostgreSQL');
    
    // Verificar si existe al menos un rol
    const rolesResult = await client.query(`
      SELECT id FROM tbl_roles WHERE activo = true LIMIT 1
    `);
    
    if (rolesResult.rows.length === 0) {
      console.log('No hay roles activos en la base de datos. Creando rol de administrador...');
      
      // Crear un rol de administrador
      const createRoleResult = await client.query(`
        INSERT INTO tbl_roles (nombre, descripcion, activo)
        VALUES ('Administrador', 'Rol con acceso completo al sistema', true)
        RETURNING id
      `);
      
      const rolId = createRoleResult.rows[0].id;
      console.log(`Rol de administrador creado con ID: ${rolId}`);
      
      // Crear usuario administrador
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await client.query(`
        INSERT INTO tbl_usuarios (username, password, nombre, apellido, email, activo, rol_id)
        VALUES ('admin', $1, 'Administrador', 'Sistema', 'admin@famisuper.com', true, $2)
      `, [hashedPassword, rolId]);
      
      console.log('Usuario administrador creado con éxito');
      console.log('Credenciales:');
      console.log('- Username: admin');
      console.log('- Password: admin123');
    } else {
      const rolId = rolesResult.rows[0].id;
      
      // Verificar si ya existe un usuario administrador
      const userResult = await client.query(`
        SELECT id FROM tbl_usuarios WHERE username = 'admin'
      `);
      
      if (userResult.rows.length === 0) {
        // Crear usuario administrador
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        await client.query(`
          INSERT INTO tbl_usuarios (username, password, nombre, apellido, email, activo, rol_id)
          VALUES ('admin', $1, 'Administrador', 'Sistema', 'admin@famisuper.com', true, $2)
        `, [hashedPassword, rolId]);
        
        console.log('Usuario administrador creado con éxito');
        console.log('Credenciales:');
        console.log('- Username: admin');
        console.log('- Password: admin123');
      } else {
        console.log('El usuario administrador ya existe');
        console.log('Credenciales por defecto:');
        console.log('- Username: admin');
        console.log('- Password: admin123');
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
    console.log('Conexión cerrada');
  }
}

createAdminUser();
