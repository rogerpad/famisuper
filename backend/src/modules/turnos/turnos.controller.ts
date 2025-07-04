import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { FinalizarTurnoDto } from './dto/finalizar-turno.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequierePermiso } from '../auth/decorators/requiere-permiso.decorator';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { User } from '../users/entities/user.entity';

@Controller('turnos')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  @RequierePermiso('crear_turnos')
  create(@Body() createTurnoDto: CreateTurnoDto) {
    return this.turnosService.create(createTurnoDto);
  }

  @Get()
  @RequierePermiso('ver_turnos')
  findAll() {
    return this.turnosService.findAll();
  }

  @Get('actual')
  @UseGuards(JwtAuthGuard)
  async getTurnoActual() {
    return this.turnosService.getTurnoActual();
  }

  @Post(':id/usuarios')
  @RequierePermiso('asignar_usuarios_turnos')
  async asignarUsuarios(
    @Param('id') id: string,
    @Body() body: { usuariosIds: number[] }
  ) {
    await this.turnosService.asignarUsuariosATurno(+id, body.usuariosIds);
    return { message: 'Usuarios asignados correctamente' };
  }

  @Get(':id/usuarios')
  @UseGuards(JwtAuthGuard)
  async getUsuariosPorTurno(@Param('id') id: string): Promise<User[]> {
    return this.turnosService.getUsuariosPorTurno(+id);
  }

  @Get('usuario/:usuarioId')
  @UseGuards(JwtAuthGuard)
  async getTurnosPorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.turnosService.getTurnosPorUsuario(+usuarioId);
  }

  @Get(':id')
  @RequierePermiso('ver_turnos')
  findOne(@Param('id') id: string) {
    return this.turnosService.findOne(+id);
  }

  @Patch(':id')
  @RequierePermiso('editar_turnos')
  update(@Param('id') id: string, @Body() updateTurnoDto: UpdateTurnoDto) {
    console.log('Actualizando turno:', id, updateTurnoDto);
    return this.turnosService.update(+id, updateTurnoDto);
  }

  @Delete(':id')
  @RequierePermiso('eliminar_turnos')
  remove(@Param('id') id: string) {
    return this.turnosService.remove(+id);
  }

  @Patch(':id/iniciar')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('iniciar_turnos')
  iniciarTurno(
    @Param('id') id: string,
    @Body() iniciarTurnoDto: IniciarTurnoDto
  ) {
    return this.turnosService.iniciarTurno(+id, iniciarTurnoDto);
  }

  @Patch(':id/finalizar')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('finalizar_turnos')
  finalizarTurno(
    @Param('id') id: string,
    @Body() finalizarTurnoDto: FinalizarTurnoDto
  ) {
    return this.turnosService.finalizarTurno(+id, finalizarTurnoDto);
  }
}
