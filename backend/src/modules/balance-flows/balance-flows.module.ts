import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceFlow } from './entities/balance-flow.entity';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';
import { BalanceFlowsService } from './balance-flows.service';
import { BalanceFlowsController } from './balance-flows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceFlow, UsuarioTurno])],
  controllers: [BalanceFlowsController],
  providers: [BalanceFlowsService],
  exports: [BalanceFlowsService],
})
export class BalanceFlowsModule {}
