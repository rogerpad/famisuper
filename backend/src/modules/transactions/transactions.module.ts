import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ProvidersModule } from '../providers/providers.module';
import { TransactionTypesModule } from '../transaction-types/transaction-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    ProvidersModule,
    TransactionTypesModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
