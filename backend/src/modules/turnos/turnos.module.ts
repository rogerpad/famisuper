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
import { CierreSuper } from '../cierres-super/entities/cierre-super.entity';
import { SuperExpense } from '../super-expenses/entities/super-expense.entity';
import { BalanceFlow } from '../balance-flows/entities/balance-flow.entity';
import { BalanceSale } from '../balance-sales/entities/balance-sale.entity';
import { ConteoBilletesSuper } from '../conteo-billetes-super/entities/conteo-billetes-super.entity';
import { AdicionalesPrestamos } from '../adicionales-prestamos/entities/adicionales-prestamos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Turno, 
      User, 
      RegistroActividad, 
      UsuarioTurno,
      CierreSuper,
      SuperExpense,
      BalanceFlow,
      BalanceSale,
      ConteoBilletesSuper,
      AdicionalesPrestamos
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
