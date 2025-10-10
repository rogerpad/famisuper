import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AdicionalesPrestamosService } from './adicionales-prestamos.service';
import { 
  CreateAdicionalesPrestamosDto, 
  UpdateAdicionalesPrestamosDto, 
  AdicionalesPrestamosDto 
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('adicionales-prestamos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdicionalesPrestamosController {
  constructor(private readonly adicionalesPrestamosService: AdicionalesPrestamosService) {}

  @Post()
  @RequirePermissions('crear_editar_adic_prest')
  create(@Body() createAdicionalesPrestamosDto: CreateAdicionalesPrestamosDto): Promise<AdicionalesPrestamosDto> {
    return this.adicionalesPrestamosService.create(createAdicionalesPrestamosDto);
  }

  @Get()
  @RequirePermissions('ver_adic_presta')
  findAll(
    @Query('acuerdo') acuerdo?: string,
    @Query('origen') origen?: string,
    @Query('activo') activo?: string,
  ): Promise<AdicionalesPrestamosDto[]> {
    // Convertir el string 'true'/'false' a boolean si existe
    const activoBoolean = activo ? activo === 'true' : undefined;
    
    return this.adicionalesPrestamosService.findAll({
      acuerdo,
      origen,
      activo: activoBoolean,
    });
  }

  @Get(':id')
  @RequirePermissions('ver_adic_presta')
  findOne(@Param('id') id: string): Promise<AdicionalesPrestamosDto> {
    return this.adicionalesPrestamosService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('crear_editar_adic_prest')
  update(
    @Param('id') id: string, 
    @Body() updateAdicionalesPrestamosDto: UpdateAdicionalesPrestamosDto
  ): Promise<AdicionalesPrestamosDto> {
    return this.adicionalesPrestamosService.update(+id, updateAdicionalesPrestamosDto);
  }

  @Delete(':id')
  @RequirePermissions('eliminar_adic_prest')
  remove(@Param('id') id: string): Promise<void> {
    return this.adicionalesPrestamosService.remove(+id);
  }
}
