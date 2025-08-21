import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermisosService } from '../services/permisos.service';
import { Permiso } from '../entities/permiso.entity';
import { AssignPermisosDto } from '../dto/assign-permisos.dto';
import { CreatePermisoDto } from '../dto/create-permiso.dto';
import { UpdatePermisoDto } from '../dto/update-permiso.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../auth/guards/permisos.guard';

@ApiTags('permisos')
@Controller('permisos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los permisos' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de permisos', type: [Permiso] })
  async findAll(): Promise<Permiso[]> {
    return this.permisosService.findAll();
  }

  @Get('modulos')
  @ApiOperation({ summary: 'Obtener permisos agrupados por módulo' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permisos agrupados por módulo' })
  async findByModulos(): Promise<{ [key: string]: Permiso[] }> {
    return this.permisosService.findByModulos();
  }

  @Get('modulo/:modulo')
  @ApiOperation({ summary: 'Obtener permisos por módulo' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de permisos por módulo', type: [Permiso] })
  async findByModulo(@Param('modulo') modulo: string): Promise<Permiso[]> {
    return this.permisosService.findByModulo(modulo);
  }

  @Get('roles/:rolId')
  @ApiOperation({ summary: 'Obtener permisos asignados a un rol' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de permisos asignados a un rol', type: [Permiso] })
  async findByRol(@Param('rolId') rolId: number): Promise<Permiso[]> {
    return this.permisosService.findByRol(rolId);
  }

  @Post('roles')
  @ApiOperation({ summary: 'Asignar permisos a un rol' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permisos asignados correctamente' })
  async assignToRol(@Body() assignPermisosDto: AssignPermisosDto): Promise<{ message: string }> {
    console.log('Recibida solicitud para asignar permisos:', assignPermisosDto);
    
    // Validar y filtrar permisos válidos
    const validPermisosIds = await this.permisosService.validatePermisosExist(assignPermisosDto.permisosIds);
    
    // Crear un nuevo DTO con solo los IDs válidos
    const validatedDto = {
      rolId: assignPermisosDto.rolId,
      permisosIds: validPermisosIds
    };
    
    console.log('Asignando permisos validados:', validatedDto);
    
    // Asignar permisos al rol
    await this.permisosService.assignToRol(validatedDto);
    
    return { message: 'Permisos asignados correctamente' };
  }

  @Post()
  @UseGuards(PermisosGuard)
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Permiso creado correctamente', type: Permiso })
  async create(@Body() createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    console.log('[PERMISOS-CONTROLLER] Creando nuevo permiso:', createPermisoDto);
    return this.permisosService.create(createPermisoDto);
  }

  @Put(':id')
  @UseGuards(PermisosGuard)
  @ApiOperation({ summary: 'Actualizar un permiso existente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permiso actualizado correctamente', type: Permiso })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermisoDto: UpdatePermisoDto
  ): Promise<Permiso> {
    console.log(`[PERMISOS-CONTROLLER] Actualizando permiso con ID: ${id}`, updatePermisoDto);
    return this.permisosService.update(id, updatePermisoDto);
  }

  @Delete(':id')
  @UseGuards(PermisosGuard)
  @ApiOperation({ summary: 'Eliminar un permiso' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permiso eliminado correctamente' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    console.log(`[PERMISOS-CONTROLLER] Eliminando permiso con ID: ${id}`);
    await this.permisosService.remove(id);
    return { message: 'Permiso eliminado correctamente' };
  }
}
