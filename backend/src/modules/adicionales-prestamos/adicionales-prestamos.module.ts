import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdicionalesPrestamosService } from './adicionales-prestamos.service';
import { AdicionalesPrestamosController } from './adicionales-prestamos.controller';
import { AdicionalesPrestamos } from './entities/adicionales-prestamos.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdicionalesPrestamos]),
    AuthModule,
  ],
  controllers: [AdicionalesPrestamosController],
  providers: [AdicionalesPrestamosService],
  exports: [AdicionalesPrestamosService],
})
export class AdicionalesPrestamosModule {}
