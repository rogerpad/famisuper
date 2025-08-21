import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../auth/guards/permisos.guard';
import { RequierePermiso } from '../../auth/decorators/requiere-permiso.decorator';
import { PaymentDocumentsService } from '../services/payment-documents.service';
import { CreatePaymentDocumentDto } from '../dto/create-payment-document.dto';
import { UpdatePaymentDocumentDto } from '../dto/update-payment-document.dto';

@Controller('payment-documents')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class PaymentDocumentsController {
  constructor(private readonly paymentDocumentsService: PaymentDocumentsService) {}

  @Get()
  @RequierePermiso('ver_documento_pago')
  findAll() {
    return this.paymentDocumentsService.findAll();
  }

  @Get('active')
  @RequierePermiso('ver_documento_pago')
  findAllActive() {
    return this.paymentDocumentsService.findAllActive();
  }

  @Get(':id')
  @RequierePermiso('ver_documento_pago')
  findOne(@Param('id') id: string) {
    return this.paymentDocumentsService.findOne(+id);
  }

  @Post()
  @RequierePermiso('admin_documentos_pago')
  create(@Body() createPaymentDocumentDto: CreatePaymentDocumentDto) {
    return this.paymentDocumentsService.create(createPaymentDocumentDto);
  }

  @Put(':id')
  @RequierePermiso('admin_documentos_pago')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDocumentDto: UpdatePaymentDocumentDto,
  ) {
    return this.paymentDocumentsService.update(+id, updatePaymentDocumentDto);
  }

  @Delete(':id')
  @RequierePermiso('admin_documentos_pago')
  remove(@Param('id') id: string) {
    return this.paymentDocumentsService.remove(+id);
  }

  @Patch(':id/toggle-status')
  @RequierePermiso('admin_documentos_pago')
  toggleStatus(@Param('id') id: string) {
    return this.paymentDocumentsService.toggleStatus(+id);
  }
}
