import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentClosingsService } from './agent-closings.service';
import { AgentClosingsController } from './agent-closings.controller';
import { AgentClosing } from './entities/agent-closing.entity';
import { ClosingAdjustment } from './entities/closing-adjustment.entity';
import { Provider } from '../providers/entities/provider.entity';
import { FormulaConfigsModule } from '../formula-configs/formula-configs.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentClosing, ClosingAdjustment, Provider]),
    FormulaConfigsModule,
    TransactionsModule,
  ],
  controllers: [AgentClosingsController],
  providers: [AgentClosingsService],
  exports: [AgentClosingsService],
})
export class AgentClosingsModule {}
