import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CierresSuperService } from './cierres-super.service';
import { CreateCierreSuperDto } from './dto/create-cierre-super.dto';
import { UpdateCierreSuperDto } from './dto/update-cierre-super.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('/cierres-super')
@UseGuards(JwtAuthGuard)
export class CierresSuperController {
  constructor(private readonly cierresSuperService: CierresSuperService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('crear_editar_cierre_super')
  create(@Body() createCierreSuperDto: CreateCierreSuperDto) {
    return this.cierresSuperService.create(createCierreSuperDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findAll() {
    return this.cierresSuperService.findAll();
  }

  @Get('activos')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findActivos() {
    return this.cierresSuperService.findActivos();
  }

  @Get('ultimo-cierre-inactivo-dia')
  @UseGuards(JwtAuthGuard)
  async getUltimoCierreInactivoDelDia() {
    console.log('[CIERRES_SUPER_CONTROLLER] Endpoint ultimo-cierre-inactivo-dia llamado');
    const result = await this.cierresSuperService.getUltimoCierreInactivoDelDia();
    console.log('[CIERRES_SUPER_CONTROLLER] Resultado del servicio:', result);
    return result;
  }

  @Get('usuario/:usuarioId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findByUsuario(@Param('usuarioId') usuarioId: string) {
    return this.cierresSuperService.findByUsuario(+usuarioId);
  }

  @Get('fecha/rango')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('ver_cierre_super')
  findByFecha(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.cierresSuperService.findByFecha(
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
      throw new Error(`ID inválido: ${id}`);
    }
    return this.cierresSuperService.findOne(numericId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('crear_editar_cierre_super')
  update(@Param('id') id: string, @Body() updateCierreSuperDto: UpdateCierreSuperDto) {
    return this.cierresSuperService.update(+id, updateCierreSuperDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('eliminar_cierre_super')
  remove(@Param('id') id: string) {
    return this.cierresSuperService.remove(+id);
  }
}
