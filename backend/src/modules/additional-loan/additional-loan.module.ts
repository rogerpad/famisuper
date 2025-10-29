import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalLoanService } from './additional-loan.service';
import { AdditionalLoanController } from './additional-loan.controller';
import { AdditionalLoan } from './entities/additional-loan.entity';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdditionalLoan, UsuarioTurno]),
    AuthModule,
  ],
  controllers: [AdditionalLoanController],
  providers: [AdditionalLoanService],
  exports: [AdditionalLoanService],
})
export class AdditionalLoanModule {}
