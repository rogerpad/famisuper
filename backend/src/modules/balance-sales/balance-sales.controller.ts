import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpStatus } from '@nestjs/common';
import { BalanceSalesService } from './balance-sales.service';
import { CreateBalanceSaleDto } from './dto/create-balance-sale.dto';
import { UpdateBalanceSaleDto } from './dto/update-balance-sale.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../modules/auth/guards/permisos.guard';
import { RequierePermiso } from '../../modules/auth/decorators/requiere-permiso.decorator';
import { LoggerService } from '../../common/services/logger.service';

@Controller('balance-sales')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class BalanceSalesController {
  constructor(
    private readonly balanceSalesService: BalanceSalesService,
    private readonly logger: LoggerService
  ) {}

  @Post()
  @RequierePermiso('crear_editar_venta')
  async create(@Body() createBalanceSaleDto: CreateBalanceSaleDto) {
    try {
      this.logger.log(
        `Solicitud recibida para crear venta de saldo: ${JSON.stringify(createBalanceSaleDto)}`,
        'BalanceSalesController'
      );
      
      const result = await this.balanceSalesService.create(createBalanceSaleDto);
      
      this.logger.log(
        `Venta de saldo creada exitosamente con ID: ${result.id}`,
        'BalanceSalesController'
      );
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Venta de saldo creada exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(
        `Error al crear venta de saldo: ${error.message}`,
        error.stack,
        'BalanceSalesController'
      );
      throw error;
    }
  }

  @Get()
  @RequierePermiso('ver_venta_paquete')
  findAll(@Query('activo') activo?: string) {
    const activoFilter = activo !== undefined ? activo === 'true' : undefined;
    return this.balanceSalesService.findAll(activoFilter);
  }

  @Get('phone-line/:id')
  @RequierePermiso('ver_venta_paquete')
  findByPhoneLine(@Param('id') id: string) {
    return this.balanceSalesService.findByPhoneLine(+id);
  }

  @Get('balance-flow/:id')
  @RequierePermiso('ver_venta_paquete')
  findByBalanceFlow(@Param('id') id: string) {
    return this.balanceSalesService.findByBalanceFlow(+id);
  }

  @Get(':id')
  @RequierePermiso('ver_venta_paquete')
  findOne(@Param('id') id: string) {
    return this.balanceSalesService.findOne(+id);
  }

  @Patch(':id')
  @RequierePermiso('crear_editar_venta')
  async update(@Param('id') id: string, @Body() updateBalanceSaleDto: UpdateBalanceSaleDto) {
    try {
      this.logger.log(
        `Solicitud recibida para actualizar venta de saldo ID ${id}: ${JSON.stringify(updateBalanceSaleDto)}`,
        'BalanceSalesController'
      );
      
      const result = await this.balanceSalesService.update(+id, updateBalanceSaleDto);
      
      this.logger.log(
        `Venta de saldo ID ${id} actualizada exitosamente`,
        'BalanceSalesController'
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Venta de saldo actualizada exitosamente',
        data: result
      };
    } catch (error) {
      this.logger.error(
        `Error al actualizar venta de saldo ID ${id}: ${error.message}`,
        error.stack,
        'BalanceSalesController'
      );
      throw error;
    }
  }

  @Delete(':id')
  @RequierePermiso('eliminar_venta_paquete')
  async remove(@Param('id') id: string) {
    try {
      this.logger.log(
        `Solicitud recibida para eliminar venta de saldo ID ${id}`,
        'BalanceSalesController'
      );
      
      await this.balanceSalesService.remove(+id);
      
      this.logger.log(
        `Venta de saldo ID ${id} eliminada exitosamente`,
        'BalanceSalesController'
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Venta de saldo eliminada exitosamente'
      };
    } catch (error) {
      this.logger.error(
        `Error al eliminar venta de saldo ID ${id}: ${error.message}`,
        error.stack,
        'BalanceSalesController'
      );
      throw error;
    }
  }
}
