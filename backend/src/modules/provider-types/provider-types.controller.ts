import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProviderTypesService } from './provider-types.service';
import { CreateProviderTypeDto } from './dto/create-provider-type.dto';
import { UpdateProviderTypeDto } from './dto/update-provider-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProviderType } from './entities/provider-type.entity';

@ApiTags('provider-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('provider-types')
export class ProviderTypesController {
  constructor(private readonly providerTypesService: ProviderTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de proveedor' })
  @ApiResponse({ status: 201, description: 'Tipo de proveedor creado exitosamente', type: ProviderType })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El tipo de proveedor ya existe' })
  create(@Body() createProviderTypeDto: CreateProviderTypeDto) {
    return this.providerTypesService.create(createProviderTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de proveedor' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de proveedor', type: [ProviderType] })
  findAll() {
    return this.providerTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Tipo de proveedor encontrado', type: ProviderType })
  @ApiResponse({ status: 404, description: 'Tipo de proveedor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.providerTypesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de proveedor' })
  @ApiResponse({ status: 200, description: 'Tipo de proveedor actualizado exitosamente', type: ProviderType })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Tipo de proveedor no encontrado' })
  @ApiResponse({ status: 409, description: 'El nombre del tipo de proveedor ya existe' })
  update(@Param('id') id: string, @Body() updateProviderTypeDto: UpdateProviderTypeDto) {
    return this.providerTypesService.update(+id, updateProviderTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de proveedor' })
  @ApiResponse({ status: 200, description: 'Tipo de proveedor eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Tipo de proveedor no encontrado' })
  remove(@Param('id') id: string) {
    return this.providerTypesService.remove(+id);
  }
}
