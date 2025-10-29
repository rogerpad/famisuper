import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperClosingsService } from './super-closings.service';
import { SuperClosingsController } from './super-closings.controller';
import { SuperClosing } from './entities/super-closing.entity';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SuperClosing, UsuarioTurno])],
  controllers: [SuperClosingsController],
  providers: [SuperClosingsService],
  exports: [SuperClosingsService],
})
export class SuperClosingsModule {}
