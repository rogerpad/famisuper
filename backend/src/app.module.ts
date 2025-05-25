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

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    
    // Módulo de base de datos (PostgreSQL)
    DatabaseModule,
    
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    RolesModule,
    TransactionsModule,
    ReportsModule,
    ProviderTypesModule,
    ProvidersModule,
  ],
})
export class AppModule {}
