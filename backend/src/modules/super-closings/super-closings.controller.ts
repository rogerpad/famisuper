import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SuperClosingsService } from './super-closings.service';
import { CreateSuperClosingDto, UpdateSuperClosingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('/cierres-super')
@UseGuards(JwtAuthGuard)
export class SuperClosingsController {
  constructor(private readonly superClosingsService: SuperClosingsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('crear_editar_cierre_super')
  create(@Body() createSuperClosingDto: CreateSuperClosingDto) {
    return this.superClosingsService.create(createSuperClosingDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findAll() {
    return this.superClosingsService.findAll();
  }

  @Get('activos')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findActivos() {
    return this.superClosingsService.findActivos();
  }

  @Get('ultimo-cierre-inactivo-dia')
  @UseGuards(JwtAuthGuard)
  async getUltimoCierreInactivoDelDia() {
    console.log('[SUPER_CLOSINGS_CONTROLLER] Endpoint ultimo-cierre-inactivo-dia called');
    const result = await this.superClosingsService.getUltimoCierreInactivoDelDia();
    console.log('[SUPER_CLOSINGS_CONTROLLER] Service result:', result);
    return result;
  }

  @Get('usuario/:usuarioId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.superClosingsService.findByUsuario(+usuarioId);
  }

  @Get('fecha/rango')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findByFecha(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.superClosingsService.findByFecha(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findOne(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error(`Invalid ID: ${id}`);
    }
    return this.superClosingsService.findOne(numericId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('crear_editar_cierre_super')
  update(@Param('id') id: string, @Body() updateSuperClosingDto: UpdateSuperClosingDto) {
    return this.superClosingsService.update(+id, updateSuperClosingDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('eliminar_cierre_super')
  remove(@Param('id') id: string) {
    return this.superClosingsService.remove(+id);
  }
}
