import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentDocument } from './entities/payment-document.entity';
import { PaymentDocumentsService } from './services/payment-documents.service';
import { PaymentDocumentsController } from './controllers/payment-documents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentDocument])],
  controllers: [PaymentDocumentsController],
  providers: [PaymentDocumentsService],
  exports: [PaymentDocumentsService],
})
export class PaymentDocumentsModule {}
