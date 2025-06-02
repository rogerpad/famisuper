import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RolesModule } from './modules/roles/roles.module';
import { DatabaseModule } from './database/database.module';
import { ProviderTypesModule } from './modules/provider-types/provider-types.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { TransactionTypesModule } from './modules/transaction-types/transaction-types.module';
import { AgentClosingsModule } from './modules/agent-closings/agent-closings.module';
import { FormulaConfigsModule } from './modules/formula-configs/formula-configs.module';
import { MigrationModule } from './database/migrations/migration.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    
    // Módulo de base de datos (PostgreSQL)
    DatabaseModule,
    
    // Módulo de migración para actualizar la estructura de la base de datos
    MigrationModule,
    
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    RolesModule,
    TransactionsModule,
    ReportsModule,
    ProviderTypesModule,
    ProvidersModule,
    TransactionTypesModule,
    AgentClosingsModule,
    FormulaConfigsModule,
  ],
})
export class AppModule {}
