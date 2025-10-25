import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperClosingsService } from './super-closings.service';
import { SuperClosingsController } from './super-closings.controller';
import { SuperClosing } from './entities/super-closing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SuperClosing])],
  controllers: [SuperClosingsController],
  providers: [SuperClosingsService],
  exports: [SuperClosingsService],
})
export class SuperClosingsModule {}
