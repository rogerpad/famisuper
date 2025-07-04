import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnosController } from './turnos.controller';
import { TurnosService } from './turnos.service';
import { Turno } from './entities/turno.entity';
import { RegistroActividad } from './entities/registro-actividad.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, User, RegistroActividad])],
  controllers: [TurnosController],
  providers: [TurnosService],
  exports: [TurnosService]
})
export class TurnosModule {}
