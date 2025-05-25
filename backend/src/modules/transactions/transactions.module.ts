import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Aquí irán las entidades relacionadas con transacciones
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class TransactionsModule {}
