import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { SuperBillCountService } from './super-bill-count.service';
import { CreateSuperBillCountDto } from './dto/create-super-bill-count.dto';
import { UpdateSuperBillCountDto } from './dto/update-super-bill-count.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('conteo-billetes-super')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuperBillCountController {
  constructor(private readonly superBillCountService: SuperBillCountService) {}

  @Post()
  @RequirePermissions('crear_editar_conteo_super')
  create(@Body() createSuperBillCountDto: CreateSuperBillCountDto, @Req() req: any) {
    // Assign authenticated user ID if not provided
    if (!createSuperBillCountDto.usuarioId && req.user) {
      createSuperBillCountDto.usuarioId = req.user.id;
    }
    return this.superBillCountService.create(createSuperBillCountDto);
  }

  @Get()
  @RequirePermissions('ver_conteo_super')
  findAll(@Query('activo') activo?: string) {
    const activoFilter = activo !== undefined ? activo === 'true' : undefined;
    return this.superBillCountService.findAll(activoFilter);
  }

  @Get('last-active')
  @RequirePermissions('ver_conteo_super')
  findLastActive(@Query('cajaNumero') cajaNumero?: string) {
    const cajaNum = cajaNumero ? parseInt(cajaNumero) : undefined;
    console.log('[SuperBillCountController] findLastActive - Caja:', cajaNum);
    return this.superBillCountService.findLastActive(cajaNum);
  }

  @Get(':id')
  @RequirePermissions('ver_conteo_super')
  findOne(@Param('id') id: string) {
    return this.superBillCountService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('crear_editar_conteo_super')
  update(@Param('id') id: string, @Body() updateSuperBillCountDto: UpdateSuperBillCountDto) {
    return this.superBillCountService.update(+id, updateSuperBillCountDto);
  }

  @Delete(':id')
  @RequirePermissions('eliminar_conteo_super')
  remove(@Param('id') id: string) {
    return this.superBillCountService.remove(+id);
  }
}
