import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneLinesService } from './phone-lines.service';
import { PhoneLinesController } from './phone-lines.controller';
import { PhoneLine } from './entities/phone-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneLine])],
  controllers: [PhoneLinesController],
  providers: [PhoneLinesService],
  exports: [PhoneLinesService],
})
export class PhoneLinesModule {}
