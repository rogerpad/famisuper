import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';
import { UsuariosTurnosService } from './usuarios-turnos.service';
import { Turno } from './entities/turno.entity';
import { UsuarioTurno } from './entities/usuario-turno.entity';
import { RegistroActividad } from './entities/registro-actividad.entity';
import { User } from '../users/entities/user.entity';
import { AgentClosingsModule } from '../agent-closings/agent-closings.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CashModule } from '../cash/cash.module';
import { SuperClosing } from '../super-closings/entities/super-closing.entity';
import { SuperExpense } from '../super-expenses/entities/super-expense.entity';
import { BalanceFlow } from '../balance-flows/entities/balance-flow.entity';
import { BalanceSale } from '../balance-sales/entities/balance-sale.entity';
import { SuperBillCount } from '../super-bill-count/entities/super-bill-count.entity';
import { AdditionalLoan } from '../additional-loan/entities/additional-loan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Turno, 
      User, 
      RegistroActividad, 
      UsuarioTurno,
      SuperClosing,
      SuperExpense,
      BalanceFlow,
      BalanceSale,
      SuperBillCount,
      AdditionalLoan
    ]),
    AgentClosingsModule,
    TransactionsModule,
    CashModule
  ],
  controllers: [TurnosController],
  providers: [TurnosService, UsuariosTurnosService],
  exports: [TurnosService, UsuariosTurnosService]
})
export class TurnosModule {}
