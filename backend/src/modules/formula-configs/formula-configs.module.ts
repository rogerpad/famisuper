import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormulaConfigsService } from './formula-configs.service';
import { FormulaConfigsController } from './formula-configs.controller';
import { FormulaConfig } from './entities/formula-config.entity';
import { ProvidersModule } from '../providers/providers.module';
import { TransactionTypesModule } from '../transaction-types/transaction-types.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FormulaConfig]),
    ProvidersModule,
    TransactionTypesModule,
    TransactionsModule,
  ],
  controllers: [FormulaConfigsController],
  providers: [FormulaConfigsService],
  exports: [FormulaConfigsService],
})
export class FormulaConfigsModule {}
