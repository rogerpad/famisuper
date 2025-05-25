import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderTypesService } from './provider-types.service';
import { ProviderTypesController } from './provider-types.controller';
import { ProviderType } from './entities/provider-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderType])],
  controllers: [ProviderTypesController],
  providers: [ProviderTypesService],
  exports: [ProviderTypesService],
})
export class ProviderTypesModule {}
