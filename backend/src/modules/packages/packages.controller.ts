import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../modules/auth/guards/permisos.guard';
import { RequierePermiso } from '../../modules/auth/decorators/requiere-permiso.decorator';

@Controller('packages')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class PackagesController {
  private readonly logger = new Logger(PackagesController.name);
  private processingRequests = new Map<string, boolean>();
  
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @RequierePermiso('admin_paquetes')
  async create(@Body() createPackageDto: CreatePackageDto) {
    // Crear un identificador único para esta solicitud basado en los datos
    const requestId = `create-${createPackageDto.nombre}-${createPackageDto.telefonicaId}-${Date.now()}`;
    
    // Verificar si ya estamos procesando una solicitud idéntica
    if (this.processingRequests.get(requestId)) {
      this.logger.warn(`Solicitud duplicada detectada: ${requestId}. Ignorando.`);
      return { message: 'Solicitud en proceso, por favor espere', duplicated: true };
    }
    
    try {
      // Marcar esta solicitud como en proceso
      this.processingRequests.set(requestId, true);
      this.logger.log(`Iniciando procesamiento de solicitud: ${requestId}`);
      
      // Procesar la solicitud
      const result = await this.packagesService.create(createPackageDto);
      
      // Liberar el bloqueo después de procesar
      this.processingRequests.delete(requestId);
      this.logger.log(`Solicitud completada exitosamente: ${requestId}`);
      
      return result;
    } catch (error) {
      // En caso de error, también liberar el bloqueo
      this.processingRequests.delete(requestId);
      this.logger.error(`Error procesando solicitud ${requestId}: ${error.message}`);
      throw error;
    }
  }

  @Get()
  @RequierePermiso('ver_paquetes')
  findAll() {
    return this.packagesService.findAll();
  }

  @Get('active')
  @RequierePermiso('ver_paquetes')
  findActive() {
    return this.packagesService.findActive();
  }

  @Get('phone-line/:id')
  @RequierePermiso('ver_paquetes')
  findByPhoneLine(@Param('id') id: string) {
    return this.packagesService.findByPhoneLine(+id);
  }

  @Get(':id')
  @RequierePermiso('ver_paquetes')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(+id);
  }

  @Patch(':id')
  @RequierePermiso('admin_paquetes')
  async update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    // Crear un identificador único para esta solicitud basado en los datos
    const requestId = `update-${id}-${updatePackageDto.nombre}-${Date.now()}`;
    
    // Verificar si ya estamos procesando una solicitud idéntica
    if (this.processingRequests.get(requestId)) {
      this.logger.warn(`Solicitud de actualización duplicada detectada: ${requestId}. Ignorando.`);
      return { message: 'Solicitud en proceso, por favor espere', duplicated: true };
    }
    
    try {
      // Marcar esta solicitud como en proceso
      this.processingRequests.set(requestId, true);
      this.logger.log(`Iniciando procesamiento de actualización: ${requestId}`);
      
      // Procesar la solicitud
      const result = await this.packagesService.update(+id, updatePackageDto);
      
      // Liberar el bloqueo después de procesar
      this.processingRequests.delete(requestId);
      this.logger.log(`Actualización completada exitosamente: ${requestId}`);
      
      return result;
    } catch (error) {
      // En caso de error, también liberar el bloqueo
      this.processingRequests.delete(requestId);
      this.logger.error(`Error procesando actualización ${requestId}: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  @RequierePermiso('admin_paquetes')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
}
