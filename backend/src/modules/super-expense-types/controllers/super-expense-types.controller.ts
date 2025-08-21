import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../auth/guards/permisos.guard';
import { RequierePermiso } from '../../auth/decorators/requiere-permiso.decorator';
import { SuperExpenseTypesService } from '../services/super-expense-types.service';
import { CreateSuperExpenseTypeDto } from '../dto/create-super-expense-type.dto';
import { UpdateSuperExpenseTypeDto } from '../dto/update-super-expense-type.dto';

@Controller('super-expense-types')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class SuperExpenseTypesController {
  constructor(private readonly superExpenseTypesService: SuperExpenseTypesService) {}

  @Get()
  @RequierePermiso('ver_tipos_egresos_super')
  findAll() {
    return this.superExpenseTypesService.findAll();
  }

  @Get('active')
  @RequierePermiso('ver_tipos_egresos_super')
  findAllActive() {
    return this.superExpenseTypesService.findAllActive();
  }

  @Get(':id')
  @RequierePermiso('ver_tipos_egresos_super')
  findOne(@Param('id') id: string) {
    return this.superExpenseTypesService.findOne(+id);
  }

  @Post()
  @RequierePermiso('admin_tipos_egresos_super')
  create(@Body() createSuperExpenseTypeDto: CreateSuperExpenseTypeDto) {
    console.log('Datos recibidos en el controlador:', JSON.stringify(createSuperExpenseTypeDto));
    return this.superExpenseTypesService.create(createSuperExpenseTypeDto);
  }

  @Put(':id')
  @RequierePermiso('admin_tipos_egresos_super')
  update(
    @Param('id') id: string,
    @Body() updateSuperExpenseTypeDto: UpdateSuperExpenseTypeDto,
  ) {
    return this.superExpenseTypesService.update(+id, updateSuperExpenseTypeDto);
  }

  @Delete(':id')
  @RequierePermiso('admin_tipos_egresos_super')
  remove(@Param('id') id: string) {
    return this.superExpenseTypesService.remove(+id);
  }

  @Patch(':id/toggle-status')
  @RequierePermiso('admin_tipos_egresos_super')
  toggleStatus(@Param('id') id: string) {
    return this.superExpenseTypesService.toggleStatus(+id);
  }
}
