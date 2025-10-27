import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperBillCountService } from './super-bill-count.service';
import { SuperBillCountController } from './super-bill-count.controller';
import { SuperBillCount } from './entities/super-bill-count.entity';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SuperBillCount, UsuarioTurno])],
  controllers: [SuperBillCountController],
  providers: [SuperBillCountService],
  exports: [SuperBillCountService],
})
export class SuperBillCountModule {}
