import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperExpensesService } from './super-expenses.service';
import { SuperExpensesController } from './super-expenses.controller';
import { SuperExpense } from './entities/super-expense.entity';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { SuperExpenseTypesModule } from '../super-expense-types/super-expense-types.module';
import { PaymentDocumentsModule } from '../payment-documents/payment-documents.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperExpense, UsuarioTurno]),
    PaymentMethodsModule,
    SuperExpenseTypesModule,
    PaymentDocumentsModule,
    UsersModule
  ],
  controllers: [SuperExpensesController],
  providers: [SuperExpensesService],
  exports: [SuperExpensesService],
})
export class SuperExpensesModule {}
