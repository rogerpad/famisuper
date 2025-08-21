import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { FinalizarTurnoDto } from './dto/finalizar-turno.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisosGuard } from '../auth/guards/permisos.guard';
import { RequierePermiso } from '../auth/decorators/requiere-permiso.decorator';
// La importación de AsignarUsuariosDto se eliminó porque no existe
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroActividad } from './entities/registro-actividad.entity';
import { Turno } from './entities/turno.entity';
import { User } from '../users/entities/user.entity';

@Controller('turnos')
@UseGuards(JwtAuthGuard, PermisosGuard)
export class TurnosController {
  constructor(
    private readonly turnosService: TurnosService,
    @InjectRepository(RegistroActividad)
    private readonly registroActividadRepository: Repository<RegistroActividad>,
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Post()
  @RequierePermiso('crear_turnos')
  create(@Body() createTurnoDto: CreateTurnoDto) {
    return this.turnosService.create(createTurnoDto);
  }

  @Get()
  @RequierePermiso('ver_turnos', 'ver_mis_turnos')
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
  @RequierePermiso('ver_turnos', 'ver_mis_turnos')
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

  @Patch(':id/iniciar-vendedor')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('iniciar_turnos')
  iniciarTurnoVendedor(
    @Req() req,
    @Param('id') id: string
  ) {
    const userId = req.user.id;
    return this.turnosService.iniciarTurnoVendedor(+id, userId);
  }

  @Patch(':id/finalizar-vendedor')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('finalizar_turnos')
  finalizarTurnoVendedor(
    @Req() req,
    @Param('id') id: string
  ) {
    const userId = req.user.id;
    return this.turnosService.finalizarTurnoVendedor(+id, userId);
  }

  @Patch(':id/reiniciar')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('reiniciar_turnos')
  reiniciarTurno(
    @Req() req,
    @Param('id') id: string
  ) {
    const userId = req.user.id;
    return this.turnosService.reiniciarTurno(+id, userId);
  }

  @Get('verificar-registros-actividad')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('ver_registro_actividad_turnos')
  async verificarRegistrosActividad() {
    try {
      console.log('[TURNOS] Verificando registros de actividad en la base de datos');
      
      // Contar registros existentes
      const count = await this.registroActividadRepository.count();
      console.log(`[TURNOS] Total de registros en la tabla: ${count}`);
      
      // Si no hay registros, crear algunos de prueba
      if (count === 0) {
        console.log('[TURNOS] No hay registros de actividad. Creando registros de prueba...');
        
        // Obtener un turno y un usuario para los registros de prueba
        const turno = await this.turnoRepository.findOne({ where: {} });
        const usuario = await this.userRepository.findOne({ where: {} });
        
        if (!turno || !usuario) {
          console.error('[TURNOS] No se pueden crear registros de prueba: No hay turnos o usuarios en la base de datos');
          return {
            success: false,
            message: 'No se pueden crear registros de prueba porque no hay turnos o usuarios en la base de datos',
            count
          };
        }
        
        // Crear registros de prueba
        const registros = [
          this.registroActividadRepository.create({
            turno,
            usuario,
            accion: 'iniciar',
            fechaHora: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
            descripcion: 'Inicio de turno automático (registro de prueba)'
          }),
          this.registroActividadRepository.create({
            turno,
            usuario,
            accion: 'pausar',
            fechaHora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000), // 2.5 días atrás
            descripcion: 'Pausa para almuerzo (registro de prueba)'
          }),
          this.registroActividadRepository.create({
            turno,
            usuario,
            accion: 'reanudar',
            fechaHora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 11 * 60 * 60 * 1000), // 2.45 días atrás
            descripcion: 'Reanudación después de almuerzo (registro de prueba)'
          }),
          this.registroActividadRepository.create({
            turno,
            usuario,
            accion: 'finalizar',
            fechaHora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
            descripcion: 'Finalización de turno normal (registro de prueba)'
          }),
          this.registroActividadRepository.create({
            turno,
            usuario,
            accion: 'iniciar',
            fechaHora: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
            descripcion: 'Inicio de turno manual (registro de prueba)'
          }),
          this.registroActividadRepository.create({
            turno,
            usuario,
            accion: 'finalizar',
            fechaHora: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
            descripcion: 'Finalización de turno anticipada (registro de prueba)'
          })
        ];
        
        // Guardar los registros
        await this.registroActividadRepository.save(registros);
        
        const newCount = await this.registroActividadRepository.count();
        console.log(`[TURNOS] Se crearon ${newCount - count} registros de prueba`);
        
        return {
          success: true,
          message: `Se crearon ${newCount - count} registros de actividad de prueba`,
          count: newCount
        };
      }
      
      // Si hay registros, obtener algunos ejemplos para diagnóstico
      const sampleQuery = this.registroActividadRepository.createQueryBuilder('registro')
        .leftJoinAndSelect('registro.turno', 'turno')
        .leftJoinAndSelect('registro.usuario', 'usuario')
        .orderBy('registro.fechaHora', 'DESC')
        .take(3);
      
      const sampleRegistros = await sampleQuery.getMany();
      console.log('[TURNOS] Ejemplos de registros en la tabla:');
      
      const ejemplos = [];
      
      sampleRegistros.forEach((registro, index) => {
        const registroInfo = {
          id: registro.id,
          turnoId: registro.turno?.id,
          usuarioId: registro.usuario?.id,
          accion: registro.accion,
          fechaHora: registro.fechaHora,
          descripcion: registro.descripcion
        };
        
        console.log(`[TURNOS] Registro ${index + 1}:`, registroInfo);
        ejemplos.push(registroInfo);
      });
      
      return {
        success: true,
        message: `Ya existen ${count} registros de actividad en la base de datos`,
        count,
        ejemplos
      };
    } catch (error) {
      console.error('[TURNOS] Error al verificar/crear registros de actividad:', error);
      throw new BadRequestException(`Error al verificar/crear registros de actividad: ${error.message}`);
    }
  }

  @Get('registros-actividad')
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequierePermiso('ver_registro_actividad_turnos')
  async getRegistrosActividad(
    @Query('turnoId') turnoId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    console.log(`[TURNOS] Solicitando registros de actividad con filtros:`, { turnoId, usuarioId, fechaInicio, fechaFin, limit, offset });
    
    const options: any = {};
    
    // Validar y convertir parámetros numéricos con validación robusta
    if (turnoId !== undefined && turnoId !== null && turnoId !== '') {
      const turnoIdNum = parseInt(turnoId, 10);
      if (!isNaN(turnoIdNum)) {
        options.turnoId = turnoIdNum;
        console.log(`[TURNOS] turnoId válido: ${turnoIdNum}`);
      } else {
        console.error(`[TURNOS] Error: turnoId inválido recibido: ${turnoId}`);
        // No incluimos este parámetro en las opciones
      }
    }
    
    if (usuarioId !== undefined && usuarioId !== null && usuarioId !== '') {
      const usuarioIdNum = parseInt(usuarioId, 10);
      if (!isNaN(usuarioIdNum)) {
        options.usuarioId = usuarioIdNum;
        console.log(`[TURNOS] usuarioId válido: ${usuarioIdNum}`);
      } else {
        console.error(`[TURNOS] Error: usuarioId inválido recibido: ${usuarioId}`);
        // No incluimos este parámetro en las opciones
      }
    }
    
    // Validar y convertir fechas
    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio);
      if (!isNaN(fechaInicioDate.getTime())) {
        options.fechaInicio = fechaInicioDate;
      }
    }
    
    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin);
      if (!isNaN(fechaFinDate.getTime())) {
        options.fechaFin = fechaFinDate;
      }
    }
    
    // Validar y convertir parámetros de paginación con validación robusta
    if (limit !== undefined && limit !== null && limit !== '') {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        options.limit = limitNum;
        console.log(`[TURNOS] limit válido: ${limitNum}`);
      } else {
        console.error(`[TURNOS] Error: limit inválido recibido: ${limit}`);
        // Usar un valor por defecto seguro
        options.limit = 10;
        console.log(`[TURNOS] Usando limit por defecto: ${options.limit}`);
      }
    } else {
      // Valor por defecto si no se especifica
      options.limit = 10;
      console.log(`[TURNOS] Usando limit por defecto: ${options.limit}`);
    }
    
    if (offset !== undefined && offset !== null && offset !== '') {
      const offsetNum = parseInt(offset, 10);
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        options.offset = offsetNum;
        console.log(`[TURNOS] offset válido: ${offsetNum}`);
      } else {
        console.error(`[TURNOS] Error: offset inválido recibido: ${offset}`);
        // Usar un valor por defecto seguro
        options.offset = 0;
        console.log(`[TURNOS] Usando offset por defecto: ${options.offset}`);
      }
    } else {
      // Valor por defecto si no se especifica
      options.offset = 0;
      console.log(`[TURNOS] Usando offset por defecto: ${options.offset}`);
    }
    
    console.log(`[TURNOS] Opciones procesadas:`, options);
    
    return this.turnosService.getRegistrosActividad(options);
  }
}
