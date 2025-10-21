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
import { PermisosModule } from './modules/permisos/permisos.module';
import { TurnosModule } from './modules/turnos/turnos.module';
import { CashModule } from './modules/cash/cash.module';
import { SuperExpenseTypesModule } from './modules/super-expense-types/super-expense-types.module';
import { PaymentDocumentsModule } from './modules/payment-documents/payment-documents.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { SuperExpensesModule } from './modules/super-expenses/super-expenses.module';
import { PhoneLinesModule } from './modules/phone-lines/phone-lines.module';
import { BalanceFlowsModule } from './modules/balance-flows/balance-flows.module';
import { BalanceSalesModule } from './modules/balance-sales/balance-sales.module';
import { PackagesModule } from './modules/packages/packages.module';
import { LoggerModule } from './common/modules/logger.module';
import { SuperBillCountModule } from './modules/super-bill-count/super-bill-count.module';
import { AdditionalLoanModule } from './modules/additional-loan/additional-loan.module';
import { SuperClosingsModule } from './modules/super-closings/super-closings.module';

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
    
    // Módulo de logging centralizado
    LoggerModule,
    
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    RolesModule,
    PermisosModule,
    TransactionsModule,
    ReportsModule,
    ProviderTypesModule,
    ProvidersModule,
    TransactionTypesModule,
    AgentClosingsModule,
    FormulaConfigsModule,
    TurnosModule,
    CashModule,
    SuperExpenseTypesModule,
    PaymentDocumentsModule,
    PaymentMethodsModule,
    SuperExpensesModule,
    PhoneLinesModule,
    BalanceFlowsModule,
    BalanceSalesModule,
    PackagesModule,
    SuperBillCountModule,
    AdditionalLoanModule,
    SuperClosingsModule,
  ],
})
export class AppModule {}
