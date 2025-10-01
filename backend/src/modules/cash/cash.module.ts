import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billete } from './entities/billete.entity';
import { BilletesService } from './services/billetes.service';
import { BilletesController } from './controllers/billetes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Billete])],
  controllers: [BilletesController],
  providers: [BilletesService],
  exports: [BilletesService],
})
export class CashModule {}
