import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../modules/auth/guards/permisos.guard';
import { RequierePermiso } from '../../modules/auth/decorators/requiere-permiso.decorator';

@Controller('packages')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @RequierePermiso('admin_paquetes')
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
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
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(+id, updatePackageDto);
  }

  @Delete(':id')
  @RequierePermiso('admin_paquetes')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(+id);
  }
}
