import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperExpenseType } from './entities/super-expense-type.entity';
import { SuperExpenseTypesService } from './services/super-expense-types.service';
import { SuperExpenseTypesController } from './controllers/super-expense-types.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperExpenseType]),
  ],
  controllers: [SuperExpenseTypesController],
  providers: [SuperExpenseTypesService],
  exports: [SuperExpenseTypesService],
})
export class SuperExpenseTypesModule {}
