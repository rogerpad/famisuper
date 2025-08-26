import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ConteoBilletesSuperService } from './conteo-billetes-super.service';
import { CreateConteoBilletesSuperDto } from './dto/create-conteo-billetes-super.dto';
import { UpdateConteoBilletesSuperDto } from './dto/update-conteo-billetes-super.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../modules/auth/guards/permissions.guard';
import { RequirePermissions } from '../modules/auth/decorators/require-permissions.decorator';

@Controller('conteo-billetes-super')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ConteoBilletesSuperController {
  constructor(private readonly conteoBilletesSuperService: ConteoBilletesSuperService) {}

  @Post()
  @RequirePermissions('crear_editar_conteo_super')
  create(@Body() createConteoBilletesSuperDto: CreateConteoBilletesSuperDto, @Req() req: any) {
    // Asignar el ID del usuario autenticado si no se proporciona
    if (!createConteoBilletesSuperDto.usuarioId && req.user) {
      createConteoBilletesSuperDto.usuarioId = req.user.id;
    }
    return this.conteoBilletesSuperService.create(createConteoBilletesSuperDto);
  }

  @Get()
  @RequirePermissions('ver_conteo_super')
  findAll() {
    return this.conteoBilletesSuperService.findAll();
  }

  @Get(':id')
  @RequirePermissions('ver_conteo_super')
  findOne(@Param('id') id: string) {
    return this.conteoBilletesSuperService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('crear_editar_conteo_super')
  update(@Param('id') id: string, @Body() updateConteoBilletesSuperDto: UpdateConteoBilletesSuperDto) {
    return this.conteoBilletesSuperService.update(+id, updateConteoBilletesSuperDto);
  }

  @Delete(':id')
  @RequirePermissions('eliminar_conteo_super')
  remove(@Param('id') id: string) {
    return this.conteoBilletesSuperService.remove(+id);
  }
}
