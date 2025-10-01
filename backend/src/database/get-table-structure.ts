import { DataSource } from 'typeorm';
import { dbConfig } from './config';

async function getTableStructure() {
  try {
    console.log('Conectando a la base de datos PostgreSQL...');
    
    const dataSource = new DataSource({
      ...dbConfig,
      name: 'tableStructureConnection',
    });

    await dataSource.initialize();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    
    // Consultar la estructura de la tabla tbl_roles
    const tableStructure = await dataSource.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tbl_roles'
      ORDER BY ordinal_position
    `);
    
    console.log('\nEstructura de la tabla tbl_roles:');
    tableStructure.forEach((column: any) => {
      console.log(`- ${column.column_name}: ${column.data_type}${column.character_maximum_length ? `(${column.character_maximum_length})` : ''} ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    await dataSource.destroy();
    console.log('\nConexión cerrada correctamente');
  } catch (error) {
    console.error('\n❌ Error al conectar a la base de datos:');
    console.error(error);
  }
}

getTableStructure();
