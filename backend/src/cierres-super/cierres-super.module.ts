import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CierresSuperService } from './cierres-super.service';
import { CierresSuperController } from './cierres-super.controller';
import { CierreSuper } from './entities/cierre-super.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CierreSuper])],
  controllers: [CierresSuperController],
  providers: [CierresSuperService],
  exports: [CierresSuperService],
})
export class CierresSuperModule {}
