import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PhoneLinesService } from './phone-lines.service';
import { CreatePhoneLineDto } from './dto/create-phone-line.dto';
import { UpdatePhoneLineDto } from './dto/update-phone-line.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../../modules/auth/guards/permisos.guard';
import { RequierePermiso } from '../../modules/auth/decorators/requiere-permiso.decorator';

@Controller('phone-lines')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class PhoneLinesController {
  constructor(private readonly phoneLinesService: PhoneLinesService) {}

  @Post()
  @RequierePermiso('admin_lineas_telefonicas')
  create(@Body() createPhoneLineDto: CreatePhoneLineDto) {
    return this.phoneLinesService.create(createPhoneLineDto);
  }

  @Get()
  @RequierePermiso('admin_lineas_telefonicas')
  findAll() {
    return this.phoneLinesService.findAll();
  }

  @Get('active')
  @RequierePermiso('admin_lineas_telefonicas')
  findActive() {
    return this.phoneLinesService.findActive();
  }

  @Get(':id')
  @RequierePermiso('admin_lineas_telefonicas')
  findOne(@Param('id') id: string) {
    return this.phoneLinesService.findOne(+id);
  }

  @Patch(':id')
  @RequierePermiso('admin_lineas_telefonicas')
  update(@Param('id') id: string, @Body() updatePhoneLineDto: UpdatePhoneLineDto) {
    return this.phoneLinesService.update(+id, updatePhoneLineDto);
  }

  @Delete(':id')
  @RequierePermiso('admin_lineas_telefonicas')
  remove(@Param('id') id: string) {
    return this.phoneLinesService.remove(+id);
  }
}
