/**
 * Script para marcar las migraciones antiguas como ya ejecutadas
 * Ejecutar con: npx ts-node -r tsconfig-paths/register src/scripts/mark-migrations.ts
 */

import { DataSource } from 'typeorm';
import { dbConfig } from '../database/config';

const oldMigrations = [
  { timestamp: 1686536584000, name: 'ReorderAndAddTurnoIdToAgentClosings1686536584000' },
  { timestamp: 1717979200000, name: 'AddSumaTotalToFormulaConfig1717979200000' },
  { timestamp: 1718586000000, name: 'AddCodigoToPermisos1718586000000' },
  { timestamp: 1720000000000, name: 'AddTurnosPermisosToVendedor1720000000000' },
  { timestamp: 1720100000000, name: 'CreateRegistroActividadTable1720100000000' },
  { timestamp: 1720200000000, name: 'AddReiniciarTurnosPermisoToVendedor1720200000000' },
  { timestamp: 1721234000000, name: 'AddCashCounterPermission1721234000000' },
  { timestamp: 1721500000000, name: 'InsertInitialBilletes1721500000000' },
  { timestamp: 1721600000000, name: 'CreateConteoBilletesTable1721600000000' },
  { timestamp: 1723652870000, name: 'CreateTipoEgresosTable1723652870000' },
];

async function markOldMigrationsAsExecuted() {
  const dataSource = new DataSource({
    ...dbConfig,
    entities: [],
    migrations: [],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a base de datos establecida');

    for (const migration of oldMigrations) {
      try {
        // Verificar si ya existe
        const existing = await dataSource.query(
          `SELECT * FROM migrations WHERE name = $1`,
          [migration.name]
        );
        
        if (existing.length === 0) {
          await dataSource.query(
            `INSERT INTO migrations (timestamp, name) VALUES ($1, $2)`,
            [migration.timestamp, migration.name]
          );
          console.log(`✅ Migración marcada: ${migration.name}`);
        } else {
          console.log(`⚠️  Migración ya existe: ${migration.name}`);
        }
      } catch (error) {
        console.log(`❌ Error con ${migration.name}:`, error.message);
      }
    }

    console.log('\n🎉 Todas las migraciones antiguas han sido marcadas como ejecutadas');
    console.log('📌 Ahora puedes ejecutar: npm run migration:run');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

markOldMigrationsAsExecuted();
