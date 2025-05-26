import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Provider } from '../providers/entities/provider.entity';
import { TransactionType } from '../transaction-types/entities/transaction-type.entity';
import { ProviderType } from '../provider-types/entities/provider-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Provider,
      TransactionType,
      ProviderType
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
