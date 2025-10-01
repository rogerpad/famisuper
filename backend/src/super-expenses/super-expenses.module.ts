import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperExpensesService } from './super-expenses.service';
import { SuperExpensesController } from './super-expenses.controller';
import { SuperExpense } from './entities/super-expense.entity';
import { PaymentMethodsModule } from '../modules/payment-methods/payment-methods.module';
import { SuperExpenseTypesModule } from '../modules/super-expense-types/super-expense-types.module';
import { PaymentDocumentsModule } from '../modules/payment-documents/payment-documents.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperExpense]),
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
