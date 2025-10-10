import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConteoBilletesSuperService } from './conteo-billetes-super.service';
import { ConteoBilletesSuperController } from './conteo-billetes-super.controller';
import { ConteoBilletesSuper } from './entities/conteo-billetes-super.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConteoBilletesSuper])],
  controllers: [ConteoBilletesSuperController],
  providers: [ConteoBilletesSuperService],
  exports: [ConteoBilletesSuperService],
})
export class ConteoBilletesSuperModule {}
