import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../../common/services/logger.service';
import { BalanceFlowsService } from './balance-flows.service';
import { CreateBalanceFlowDto } from './dto/create-balance-flow.dto';
import { UpdateBalanceFlowDto } from './dto/update-balance-flow.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../modules/auth/guards/permisos.guard';
import { RequierePermiso } from '../../modules/auth/decorators/requiere-permiso.decorator';

@Controller('balance-flows')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class BalanceFlowsController {
  constructor(
    private readonly balanceFlowsService: BalanceFlowsService,
    private readonly logger: LoggerService
  ) {}

  @Post()
  @RequierePermiso('crear_editar_flujo')
  create(@Body() createBalanceFlowDto: CreateBalanceFlowDto, @Req() req: Request) {
    const userId = req.user ? req.user['id'] : undefined;
    console.log('[BalanceFlowsController] userId del request:', userId);
    return this.balanceFlowsService.create(createBalanceFlowDto, userId);
  }

  @Get()
  @RequierePermiso('ver_flujos_saldo')
  findAll(@Query('activo') activo?: string) {
    const activoFilter = activo !== undefined ? activo === 'true' : undefined;
    return this.balanceFlowsService.findAll(activoFilter);
  }

  @Get('active')
  @RequierePermiso('ver_flujos_saldo')
  findActive() {
    return this.balanceFlowsService.findActive();
  }

  @Get('sum-saldo-vendido')
  @RequierePermiso('ver_flujos_saldo')
  getSumSaldoVendido() {
    return this.balanceFlowsService.getSumSaldoVendidoActivos();
  }

  @Get('last-inactive-saldo/:telefonicaId/:cajaNumero')
  @RequierePermiso('ver_flujos_saldo')
  getLastInactiveSaldoFinal(
    @Param('telefonicaId') telefonicaId: string,
    @Param('cajaNumero') cajaNumero: string
  ) {
    return this.balanceFlowsService.getLastInactiveSaldoFinal(+telefonicaId, +cajaNumero);
  }

  @Post('recalcular-saldos')
  @RequierePermiso('crear_editar_flujo')
  async recalcularSaldosVendidos() {
    try {
      this.logger.log(
        'Solicitud recibida para recalcular saldos vendidos',
        'BalanceFlowsController'
      );
      
      const resultado = await this.balanceFlowsService.recalcularSaldosVendidos();
      
      this.logger.log(
        `Recálculo de saldos completado. Actualizados: ${resultado.actualizados}, Errores: ${resultado.errores}`,
        'BalanceFlowsController'
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Recálculo de saldos completado',
        data: resultado
      };
    } catch (error) {
      this.logger.error(
        `Error al recalcular saldos: ${error.message}`,
        error.stack,
        'BalanceFlowsController'
      );
      throw error;
    }
  }

  @Get('by-phone-line/:id')
  @RequierePermiso('ver_flujos_saldo')
  findByPhoneLine(@Param('id') id: string) {
    return this.balanceFlowsService.findByPhoneLine(+id);
  }

  @Get(':id')
  @RequierePermiso('ver_flujos_saldo')
  findOne(@Param('id') id: string) {
    return this.balanceFlowsService.findOne(+id);
  }

  @Patch(':id')
  @RequierePermiso('crear_editar_flujo')
  update(@Param('id') id: string, @Body() updateBalanceFlowDto: any) {
    console.log('Datos recibidos para actualizar (raw):', JSON.stringify(updateBalanceFlowDto));
    
    // Crear un nuevo objeto limpio para la actualización
    const cleanedDto: any = {};
    
    // Copiar solo los campos necesarios, excluyendo la fecha por ahora
    if (updateBalanceFlowDto.nombre !== undefined) cleanedDto.nombre = updateBalanceFlowDto.nombre;
    if (updateBalanceFlowDto.telefonicaId !== undefined) cleanedDto.telefonicaId = updateBalanceFlowDto.telefonicaId;
    if (updateBalanceFlowDto.saldoInicial !== undefined) cleanedDto.saldoInicial = updateBalanceFlowDto.saldoInicial;
    if (updateBalanceFlowDto.saldoComprado !== undefined) cleanedDto.saldoComprado = updateBalanceFlowDto.saldoComprado;
    if (updateBalanceFlowDto.saldoVendido !== undefined) cleanedDto.saldoVendido = updateBalanceFlowDto.saldoVendido;
    if (updateBalanceFlowDto.saldoFinal !== undefined) cleanedDto.saldoFinal = updateBalanceFlowDto.saldoFinal;
    if (updateBalanceFlowDto.activo !== undefined) cleanedDto.activo = updateBalanceFlowDto.activo;
    
    // Manejar la fecha manualmente si existe
    if (updateBalanceFlowDto.fecha) {
      try {
        // Intentar convertir a fecha válida
        cleanedDto.fecha = new Date(updateBalanceFlowDto.fecha);
        console.log('Fecha convertida:', cleanedDto.fecha);
      } catch (error) {
        console.error('Error al convertir fecha:', error);
        // No incluir la fecha si hay error
      }
    }
    
    console.log('DTO limpio para actualizar:', JSON.stringify(cleanedDto));
    return this.balanceFlowsService.update(+id, cleanedDto);
  }

  @Delete(':id')
  @RequierePermiso('eliminar_flujo')
  remove(@Param('id') id: string) {
    return this.balanceFlowsService.remove(+id);
  }
}
