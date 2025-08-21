import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/requiere-permiso.decorator';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @UseGuards(PermisosGuard)
  @RequierePermiso('admin_forma_pago')
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(createPaymentMethodDto);
  }

  @Get()
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_forma_pago')
  findAll(@Query('onlyActive') onlyActive: boolean = false) {
    return this.paymentMethodsService.findAll(onlyActive);
  }

  @Get(':id')
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_forma_pago')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermisosGuard)
  @RequierePermiso('admin_forma_pago')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  @UseGuards(PermisosGuard)
  @RequierePermiso('admin_forma_pago')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodsService.remove(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(PermisosGuard)
  @RequierePermiso('admin_forma_pago')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodsService.toggleActive(id);
  }
}
