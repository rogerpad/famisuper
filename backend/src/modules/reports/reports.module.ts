import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Provider } from '../providers/entities/provider.entity';
import { TransactionType } from '../transaction-types/entities/transaction-type.entity';
import { ProviderType } from '../provider-types/entities/provider-type.entity';
import { SuperClosing } from '../super-closings/entities/super-closing.entity';
import { SuperExpense } from '../super-expenses/entities/super-expense.entity';
import { BalanceSale } from '../balance-sales/entities/balance-sale.entity';
import { BalanceFlow } from '../balance-flows/entities/balance-flow.entity';
import { AgentClosing } from '../agent-closings/entities/agent-closing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Provider,
      TransactionType,
      ProviderType,
      SuperClosing,
      SuperExpense,
      BalanceSale,
      BalanceFlow,
      AgentClosing,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
