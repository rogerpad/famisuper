import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SuperExpensesService } from './super-expenses.service';
import { CreateSuperExpenseDto, UpdateSuperExpenseDto } from './dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../modules/auth/guards/permisos.guard';
import { RequierePermiso } from '../modules/auth/decorators/requiere-permiso.decorator';
import { Request } from 'express';

@Controller('super-expenses')
@UseGuards(JwtAuthGuard)
export class SuperExpensesController {
  constructor(private readonly superExpensesService: SuperExpensesService) {}

  @Post()
  @UseGuards(PermisosGuard)
  @RequierePermiso('crear_egreso_super')
  async create(@Body() createSuperExpenseDto: CreateSuperExpenseDto, @Req() req: Request) {
    try {
      console.log('========== INICIO CREACIÓN EGRESO SUPER ==========');
      console.log('Datos recibidos:', JSON.stringify(createSuperExpenseDto));
      
      // Verificar que el usuario exista en la sesión
      if (!req.user || !req.user['id']) {
        console.error('ERROR: No se encontró el ID de usuario en la sesión');
        throw new Error('No se encontró el ID de usuario en la sesión');
      }
      
      // Asegurarse de que los campos numéricos sean números
      const parsedDto = {
        ...createSuperExpenseDto,
        tipoEgresoId: Number(createSuperExpenseDto.tipoEgresoId),
        documentoPagoId: createSuperExpenseDto.documentoPagoId ? Number(createSuperExpenseDto.documentoPagoId) : null,
        excento: Number(createSuperExpenseDto.excento || 0),
        gravado: Number(createSuperExpenseDto.gravado || 0),
        impuesto: Number(createSuperExpenseDto.impuesto || 0),
        total: Number(createSuperExpenseDto.total),
        formaPagoId: Number(createSuperExpenseDto.formaPagoId),
      };
      
      const userId = req.user['id'];
      console.log('Usuario ID:', userId);
      console.log('Datos parseados:', JSON.stringify(parsedDto));
      
      // Verificar que la fecha sea válida
      try {
        const fecha = new Date(createSuperExpenseDto.fechaEgreso);
        if (isNaN(fecha.getTime())) {
          throw new Error('La fecha proporcionada no es válida');
        }
        console.log('Fecha parseada:', fecha.toISOString());
      } catch (dateError) {
        console.error('ERROR: Fecha inválida:', dateError);
        throw new Error(`La fecha proporcionada no es válida: ${createSuperExpenseDto.fechaEgreso}`);
      }
      
      // Verificar que los IDs existan antes de llamar al servicio
      try {
        // Verificar que el tipo de egreso exista
        const tipoEgresoId = Number(createSuperExpenseDto.tipoEgresoId);
        console.log('Verificando tipo de egreso ID:', tipoEgresoId);
        
        // Verificar que la forma de pago exista
        const formaPagoId = Number(createSuperExpenseDto.formaPagoId);
        console.log('Verificando forma de pago ID:', formaPagoId);
        
        // Verificar documento de pago si existe
        if (createSuperExpenseDto.documentoPagoId) {
          const documentoPagoId = Number(createSuperExpenseDto.documentoPagoId);
          console.log('Verificando documento de pago ID:', documentoPagoId);
        }
      } catch (verificationError) {
        console.error('ERROR: Al verificar IDs:', verificationError);
      }
      
      console.log('Llamando al servicio para crear egreso...');
      const result = await this.superExpensesService.create(parsedDto, userId);
      console.log('Egreso creado exitosamente:', result);
      console.log('========== FIN CREACIÓN EGRESO SUPER ==========');
      return result;
    } catch (error) {
      console.error('========== ERROR CREACIÓN EGRESO SUPER ==========');
      console.error('Error al crear egreso de super:', error);
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
      console.error('========== FIN ERROR CREACIÓN EGRESO SUPER ==========');
      
      // Devolver un error más descriptivo al frontend
      throw new Error(`Error al crear egreso de super: ${error.message}`);
    }
  }

  @Get()
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_egresos_super')
  findAll(@Query('showInactive') showInactive: boolean = false) {
    return this.superExpensesService.findAll(showInactive);
  }

  @Get(':id')
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_egresos_super')
  findOne(@Param('id') id: string) {
    return this.superExpensesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(PermisosGuard)
  @RequierePermiso('editar_egreso_super')
  update(@Param('id') id: string, @Body() updateSuperExpenseDto: UpdateSuperExpenseDto) {
    return this.superExpensesService.update(+id, updateSuperExpenseDto);
  }

  @Delete(':id')
  @UseGuards(PermisosGuard)
  @RequierePermiso('eliminar_egreso_super')
  remove(@Param('id') id: string) {
    return this.superExpensesService.remove(+id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(PermisosGuard)
  @RequierePermiso('editar_egreso_super')
  toggleActive(@Param('id') id: string) {
    return this.superExpensesService.toggleActive(+id);
  }

  @Get('filter/by-date-range')
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_egresos_super')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.superExpensesService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('sum/pago-productos-efectivo')
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_egresos_super')
  async getSumPagoProductosEfectivo() {
    const suma = await this.superExpensesService.getSumPagoProductosEfectivo();
    return { suma };
  }

  @Get('sum/gastos-efectivo')
  @UseGuards(PermisosGuard)
  @RequierePermiso('ver_egresos_super')
  async getSumGastosEfectivo() {
    const suma = await this.superExpensesService.getSumGastosEfectivo();
    return { suma };
  }
}
