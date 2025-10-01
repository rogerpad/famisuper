import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, InternalServerErrorException, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { BilletesService } from '../services/billetes.service';
import { Billete } from '../entities/billete.entity';
import { CreateBilleteDto } from '../dto/create-billete.dto';
import { SaveCashCountDto } from '../dto/save-cash-count.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequierePermiso } from '../../auth/decorators/requiere-permiso.decorator';

@Controller('billetes')
@UseGuards(JwtAuthGuard)
export class BilletesController {
  private readonly logger = new Logger('BilletesController');

  constructor(private readonly billetesService: BilletesService) {}

  @Post()
  @RequierePermiso('ver_contador_efectivo')
  create(@Body() createBilleteDto: CreateBilleteDto): Promise<Billete> {
    return this.billetesService.create(createBilleteDto);
  }

  @Post('cash-count')
  @RequierePermiso('ver_contador_efectivo')
  async saveCashCount(@Body() saveCashCountDto: SaveCashCountDto) {
    try {
      this.logger.log(`[BILLETES_CONTROLLER] Recibiendo petición para guardar conteo de efectivo`);
      
      // Validar que el DTO tenga los datos requeridos
      if (!saveCashCountDto) {
        this.logger.error(`[BILLETES_CONTROLLER] DTO inválido o vacío`);
        throw new BadRequestException('Los datos del conteo son requeridos');
      }
      
      // Validar que el usuarioId sea un número válido
      if (!saveCashCountDto.usuarioId || isNaN(Number(saveCashCountDto.usuarioId)) || Number(saveCashCountDto.usuarioId) <= 0) {
        this.logger.error(`[BILLETES_CONTROLLER] ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
        throw new BadRequestException(`ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
      }
      
      // Convertir el usuarioId a número
      saveCashCountDto.usuarioId = Number(saveCashCountDto.usuarioId);
      
      // Validar que el totalGeneral sea un número válido
      if (saveCashCountDto.totalGeneral === undefined || 
          saveCashCountDto.totalGeneral === null || 
          isNaN(Number(saveCashCountDto.totalGeneral))) {
        this.logger.error(`[BILLETES_CONTROLLER] Total general inválido: ${saveCashCountDto.totalGeneral}`);
        throw new BadRequestException(`Total general inválido: ${saveCashCountDto.totalGeneral}`);
      }
      
      // Convertir el totalGeneral a número
      saveCashCountDto.totalGeneral = Number(saveCashCountDto.totalGeneral);
      
      // NOTA: La columna turno_id no existe actualmente en la base de datos
      // Se ha comentado temporalmente hasta que se realice la migración
      /*
      // Validar turnoId si está presente
      if (saveCashCountDto.turnoId !== undefined && saveCashCountDto.turnoId !== null) {
        const turnoId = Number(saveCashCountDto.turnoId);
        if (isNaN(turnoId) || turnoId <= 0) {
          this.logger.error(`[BILLETES_CONTROLLER] ID de turno inválido: ${saveCashCountDto.turnoId}`);
          throw new BadRequestException(`ID de turno inválido: ${saveCashCountDto.turnoId}`);
        }
        saveCashCountDto.turnoId = turnoId;
        this.logger.log(`[BILLETES_CONTROLLER] Validado turno ID: ${turnoId}`);
      }
      */
      
      // Validar y convertir todos los campos numéricos opcionales
      const numericFields = [
        'deno500', 'cant500', 'total500',
        'deno200', 'cant200', 'total200',
        'deno100', 'cant100', 'total100',
        'deno50', 'cant50', 'total50',
        'deno20', 'cant20', 'total20',
        'deno10', 'cant10', 'total10',
        'deno5', 'cant5', 'total5',
        'deno2', 'cant2', 'total2',
        'deno1', 'cant1', 'total1'
      ];
      
      numericFields.forEach(field => {
        if (saveCashCountDto[field] !== undefined && saveCashCountDto[field] !== null) {
          const numValue = Number(saveCashCountDto[field]);
          if (isNaN(numValue)) {
            this.logger.error(`[BILLETES_CONTROLLER] Valor inválido para ${field}: ${saveCashCountDto[field]}`);
            throw new BadRequestException(`Valor inválido para ${field}: ${saveCashCountDto[field]}`);
          }
          saveCashCountDto[field] = numValue;
        }
      });
      
      // Validar el campo estado si está presente
      if (saveCashCountDto.estado !== undefined) {
        saveCashCountDto.estado = Boolean(saveCashCountDto.estado);
      } else {
        // Valor por defecto si no se proporciona
        saveCashCountDto.estado = true;
      }
      
      this.logger.log(`[BILLETES_CONTROLLER] Datos validados correctamente, enviando al servicio`);
      
      // Llamar al servicio para guardar los datos
      const result = await this.billetesService.saveCashCount(saveCashCountDto);
      
      this.logger.log(`[BILLETES_CONTROLLER] Conteo guardado correctamente: ID ${result.id || 'N/A'}`);
      
      return result;
    } catch (error) {
      // Si es un error de validación (BadRequestException), lo propagamos
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Para cualquier otro error, registramos y lanzamos un error genérico
      this.logger.error(`[BILLETES_CONTROLLER] Error al guardar conteo: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error al guardar el conteo de efectivo: ${error.message}`);
    }
  }

  @Get()
  @RequierePermiso('ver_contador_efectivo')
  findAll(): Promise<Billete[]> {
    return this.billetesService.findAll();
  }

  @Get('turno/:id')
  @RequierePermiso('ver_contador_efectivo')
  async findByTurno(@Param('id') id: string): Promise<Billete[]> {
    try {
      // Validar que el ID sea un número válido
      const turnoId = Number(id);
      if (isNaN(turnoId)) {
        throw new BadRequestException(`ID de turno inválido: ${id}`);
      }
      
      return await this.billetesService.findByTurno(turnoId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.message && error.message.includes('ID de turno inválido')) {
        throw new BadRequestException(error.message);
      }
      console.error(`Error al obtener billetes para el turno ${id}:`, error);
      throw new InternalServerErrorException(`Error al obtener billetes para el turno ${id}`);
    }
  }

  @Get('latest')
  @RequierePermiso('ver_contador_efectivo')
  async findLatestCount(): Promise<Billete[]> {
    try {
      return await this.billetesService.findLatestCount();
    } catch (error) {
      console.error('Error al obtener el último conteo de billetes:', error);
      throw new InternalServerErrorException('Error al obtener el último conteo de billetes');
    }
  }

  @Put(':id')
  @RequierePermiso('ver_contador_efectivo')
  async updateCashCount(@Param('id') id: string, @Body() saveCashCountDto: SaveCashCountDto) {
    try {
      this.logger.log(`[BILLETES_CONTROLLER] Recibiendo petición para actualizar conteo de efectivo con ID: ${id}`);
      
      // Validar que el ID sea un número válido
      const billeteId = Number(id);
      if (isNaN(billeteId) || billeteId <= 0) {
        this.logger.error(`[BILLETES_CONTROLLER] ID de conteo inválido: ${id}`);
        throw new BadRequestException(`ID de conteo inválido: ${id}`);
      }
      
      // Validar que el DTO tenga los datos requeridos
      if (!saveCashCountDto) {
        this.logger.error(`[BILLETES_CONTROLLER] DTO inválido o vacío`);
        throw new BadRequestException('Los datos del conteo son requeridos');
      }
      
      // Validar que el usuarioId sea un número válido
      if (!saveCashCountDto.usuarioId || isNaN(Number(saveCashCountDto.usuarioId)) || Number(saveCashCountDto.usuarioId) <= 0) {
        this.logger.error(`[BILLETES_CONTROLLER] ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
        throw new BadRequestException(`ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
      }
      
      // Convertir el usuarioId a número
      saveCashCountDto.usuarioId = Number(saveCashCountDto.usuarioId);
      
      // Validar que el totalGeneral sea un número válido
      if (saveCashCountDto.totalGeneral === undefined || 
          saveCashCountDto.totalGeneral === null || 
          isNaN(Number(saveCashCountDto.totalGeneral))) {
        this.logger.error(`[BILLETES_CONTROLLER] Total general inválido: ${saveCashCountDto.totalGeneral}`);
        throw new BadRequestException(`Total general inválido: ${saveCashCountDto.totalGeneral}`);
      }
      
      // Convertir el totalGeneral a número
      saveCashCountDto.totalGeneral = Number(saveCashCountDto.totalGeneral);
      
      // Validar y convertir todos los campos numéricos opcionales
      const numericFields = [
        'deno500', 'cant500', 'total500',
        'deno200', 'cant200', 'total200',
        'deno100', 'cant100', 'total100',
        'deno50', 'cant50', 'total50',
        'deno20', 'cant20', 'total20',
        'deno10', 'cant10', 'total10',
        'deno5', 'cant5', 'total5',
        'deno2', 'cant2', 'total2',
        'deno1', 'cant1', 'total1'
      ];
      
      numericFields.forEach(field => {
        if (saveCashCountDto[field] !== undefined && saveCashCountDto[field] !== null) {
          const numValue = Number(saveCashCountDto[field]);
          if (isNaN(numValue)) {
            this.logger.error(`[BILLETES_CONTROLLER] Valor inválido para ${field}: ${saveCashCountDto[field]}`);
            throw new BadRequestException(`Valor inválido para ${field}: ${saveCashCountDto[field]}`);
          }
          saveCashCountDto[field] = numValue;
        }
      });
      
      this.logger.log(`[BILLETES_CONTROLLER] Datos validados correctamente, enviando al servicio para actualizar`);
      
      // Llamar al servicio para actualizar los datos
      const result = await this.billetesService.updateCashCount(billeteId, saveCashCountDto);
      
      this.logger.log(`[BILLETES_CONTROLLER] Conteo actualizado correctamente: ID ${result.id}`);
      
      return result;
    } catch (error) {
      // Si es un error de validación (BadRequestException), lo propagamos
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Para cualquier otro error, registramos y lanzamos un error genérico
      this.logger.error(`[BILLETES_CONTROLLER] Error al actualizar conteo: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error al actualizar el conteo de efectivo: ${error.message}`);
    }
  }

  @Delete(':id')
  @RequierePermiso('ver_contador_efectivo')
  async deleteCashCount(@Param('id') id: string) {
    try {
      this.logger.log(`[BILLETES_CONTROLLER] Recibiendo petición para eliminar conteo de efectivo con ID: ${id}`);
      
      // Validar que el ID sea un número válido
      const billeteId = Number(id);
      if (isNaN(billeteId) || billeteId <= 0) {
        this.logger.error(`[BILLETES_CONTROLLER] ID de conteo inválido: ${id}`);
        throw new BadRequestException(`ID de conteo inválido: ${id}`);
      }
      
      // Llamar al servicio para eliminar el conteo
      const result = await this.billetesService.deleteCashCount(billeteId);
      
      this.logger.log(`[BILLETES_CONTROLLER] Conteo eliminado correctamente: ID ${billeteId}`);
      
      return { message: `Conteo con ID ${billeteId} eliminado correctamente`, success: true };
    } catch (error) {
      // Si es un error de validación (BadRequestException), lo propagamos
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Si el conteo no existe, devolver un error específico
      if (error.message && error.message.includes('not found')) {
        throw new BadRequestException(`No se encontró el conteo con ID ${id}`);
      }
      
      // Para cualquier otro error, registramos y lanzamos un error genérico
      this.logger.error(`[BILLETES_CONTROLLER] Error al eliminar conteo: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error al eliminar el conteo de efectivo: ${error.message}`);
    }
  }
}
