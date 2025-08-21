import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceSalesService } from './balance-sales.service';
import { BalanceSalesController } from './balance-sales.controller';
import { BalanceSale } from './entities/balance-sale.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BalanceSale]),
    AuthModule,
  ],
  controllers: [BalanceSalesController],
  providers: [BalanceSalesService],
  exports: [BalanceSalesService],
})
export class BalanceSalesModule {}
