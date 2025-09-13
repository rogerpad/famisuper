import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioTurno } from './entities/usuario-turno.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UsuariosTurnosService {
  constructor(
    @InjectRepository(UsuarioTurno)
    private usuarioTurnoRepository: Repository<UsuarioTurno>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UsuarioTurno[]> {
    console.log(`[USUARIOS_TURNOS] Obteniendo todas las asignaciones de usuarios a turnos`);
    return this.usuarioTurnoRepository.find({
      relations: ['usuario', 'turno'],
    });
  }

  async findByUsuarioId(usuarioId: number): Promise<UsuarioTurno[]> {
    console.log(`[USUARIOS_TURNOS] Obteniendo asignaciones para usuario ID: ${usuarioId}`);
    
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    return this.usuarioTurnoRepository.find({
      where: { usuarioId },
      relations: ['usuario', 'turno'],
    });
  }

  async findByTurnoId(turnoId: number): Promise<UsuarioTurno[]> {
    console.log(`[USUARIOS_TURNOS] Obteniendo asignaciones para turno ID: ${turnoId}`);
    
    if (!turnoId || isNaN(Number(turnoId))) {
      throw new BadRequestException(`ID de turno inválido: ${turnoId}`);
    }
    
    return this.usuarioTurnoRepository.find({
      where: { turnoId },
      relations: ['usuario', 'turno'],
    });
  }

  async findOne(id: number): Promise<UsuarioTurno> {
    console.log(`[USUARIOS_TURNOS] Buscando asignación con ID: ${id}`);
    
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException(`ID de asignación inválido: ${id}`);
    }
    
    const asignacion = await this.usuarioTurnoRepository.findOne({
      where: { id },
      relations: ['usuario', 'turno'],
    });
    
    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
    
    return asignacion;
  }

  async findByUsuarioAndTurno(usuarioId: number, turnoId: number): Promise<UsuarioTurno> {
    console.log(`[USUARIOS_TURNOS] Buscando asignación para usuario ID: ${usuarioId} y turno ID: ${turnoId}`);
    
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    if (!turnoId || isNaN(Number(turnoId))) {
      throw new BadRequestException(`ID de turno inválido: ${turnoId}`);
    }
    
    const asignacion = await this.usuarioTurnoRepository.findOne({
      where: { usuarioId, turnoId },
      relations: ['usuario', 'turno'],
    });
    
    return asignacion; // Puede ser null si no existe
  }

  async usuarioTieneOtroTurnoActivo(usuarioId: number, turnoIdExcluir?: number): Promise<boolean> {
    console.log(`[USUARIOS_TURNOS] Verificando si usuario ID: ${usuarioId} tiene otro turno activo`);
    
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    const query = this.usuarioTurnoRepository.createQueryBuilder('ut')
      .where('ut.usuario_id = :usuarioId', { usuarioId })
      .andWhere('ut.activo = :activo', { activo: true });
    
    // Si se proporciona un turnoId para excluir, lo añadimos a la consulta
    if (turnoIdExcluir && !isNaN(Number(turnoIdExcluir))) {
      query.andWhere('ut.turno_id != :turnoId', { turnoId: turnoIdExcluir });
    }
    
    const count = await query.getCount();
    return count > 0;
  }

  async operacionEstaEnUso(tipoOperacion: 'agente' | 'super', usuarioIdExcluir?: number): Promise<{ enUso: boolean; usuario?: User }> {
    console.log(`[USUARIOS_TURNOS] Verificando si operación '${tipoOperacion}' está en uso`);
    
    const query = this.usuarioTurnoRepository.createQueryBuilder('ut')
      .leftJoinAndSelect('ut.usuario', 'usuario')
      .where('ut.activo = :activo', { activo: true });
    
    // Verificar según el tipo de operación
    if (tipoOperacion === 'agente') {
      query.andWhere('ut.agente = :agente', { agente: true });
    } else if (tipoOperacion === 'super') {
      query.andWhere('ut.super = :super', { super: true });
    }
    
    // Excluir un usuario específico si se proporciona (útil para actualizaciones)
    if (usuarioIdExcluir && !isNaN(Number(usuarioIdExcluir))) {
      query.andWhere('ut.usuario_id != :usuarioId', { usuarioId: usuarioIdExcluir });
    }
    
    const asignacionActiva = await query.getOne();
    
    if (asignacionActiva) {
      console.log(`[USUARIOS_TURNOS] Operación '${tipoOperacion}' está en uso por usuario ID: ${asignacionActiva.usuarioId}`);
      return { 
        enUso: true, 
        usuario: asignacionActiva.usuario 
      };
    }
    
    console.log(`[USUARIOS_TURNOS] Operación '${tipoOperacion}' está disponible`);
    return { enUso: false };
  }

  async iniciarTurnoVendedor(
    usuarioId: number, 
    turnoId: number, 
    operationType?: { agente: boolean; super: boolean }
  ): Promise<UsuarioTurno> {
    console.log(`[USUARIOS_TURNOS] Iniciando turno ID: ${turnoId} para vendedor ID: ${usuarioId}`);
    if (operationType) {
      console.log(`[USUARIOS_TURNOS] Tipo de operación: Agente=${operationType.agente}, Super=${operationType.super}`);
    }
    
    // Validar IDs
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    if (!turnoId || isNaN(Number(turnoId))) {
      throw new BadRequestException(`ID de turno inválido: ${turnoId}`);
    }
    
    // Verificar si el usuario tiene otro turno activo
    const tieneOtroTurnoActivo = await this.usuarioTieneOtroTurnoActivo(usuarioId, turnoId);
    if (tieneOtroTurnoActivo) {
      throw new BadRequestException(`El usuario con ID ${usuarioId} ya tiene un turno activo`);
    }
    
    // Validar que la operación solicitada no esté en uso por otro usuario
    if (operationType) {
      if (operationType.agente) {
        const resultadoAgente = await this.operacionEstaEnUso('agente', usuarioId);
        if (resultadoAgente.enUso) {
          const nombreUsuario = resultadoAgente.usuario ? 
            `${resultadoAgente.usuario.nombre} ${resultadoAgente.usuario.apellido}` : 
            'Usuario desconocido';
          throw new BadRequestException(
            `La operación de Agentes ya está siendo utilizada por ${nombreUsuario}. Solo un usuario puede acceder a esta operación a la vez.`
          );
        }
      }
      
      if (operationType.super) {
        const resultadoSuper = await this.operacionEstaEnUso('super', usuarioId);
        if (resultadoSuper.enUso) {
          const nombreUsuario = resultadoSuper.usuario ? 
            `${resultadoSuper.usuario.nombre} ${resultadoSuper.usuario.apellido}` : 
            'Usuario desconocido';
          throw new BadRequestException(
            `La operación de Super ya está siendo utilizada por ${nombreUsuario}. Solo un usuario puede acceder a esta operación a la vez.`
          );
        }
      }
    }
    
    // Buscar la asignación existente
    let asignacion = await this.findByUsuarioAndTurno(usuarioId, turnoId);
    
    // Obtener la hora actual en formato HH:MM
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinutes}`;
    
    if (asignacion) {
      // Actualizar la asignación existente
      asignacion.horaInicioReal = currentTimeString;
      asignacion.horaFinReal = null;
      asignacion.activo = true;
      
      // Actualizar tipo de operación si se proporciona
      if (operationType) {
        asignacion.agente = operationType.agente;
        asignacion.super = operationType.super;
      }
      
      await this.usuarioTurnoRepository.save(asignacion);
      console.log(`[USUARIOS_TURNOS] Asignación actualizada: ${asignacion.id}`);
    } else {
      // Crear una nueva asignación
      asignacion = this.usuarioTurnoRepository.create({
        usuarioId,
        turnoId,
        horaInicioReal: currentTimeString,
        horaFinReal: null,
        activo: true,
        // Establecer tipo de operación si se proporciona
        agente: operationType ? operationType.agente : false,
        super: operationType ? operationType.super : false,
      });
      
      await this.usuarioTurnoRepository.save(asignacion);
      console.log(`[USUARIOS_TURNOS] Nueva asignación creada: ${asignacion.id}`);
    }
    
    return this.findOne(asignacion.id);
  }

  async finalizarTurnoVendedor(usuarioId: number, turnoId: number): Promise<UsuarioTurno> {
    console.log(`[USUARIOS_TURNOS] Finalizando turno ID: ${turnoId} para vendedor ID: ${usuarioId}`);
    
    // Validar IDs
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    if (!turnoId || isNaN(Number(turnoId))) {
      throw new BadRequestException(`ID de turno inválido: ${turnoId}`);
    }
    
    // Buscar la asignación existente
    const asignacion = await this.findByUsuarioAndTurno(usuarioId, turnoId);
    
    if (!asignacion) {
      throw new NotFoundException(`No se encontró asignación para usuario ID: ${usuarioId} y turno ID: ${turnoId}`);
    }
    
    // Obtener la hora actual en formato HH:MM
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinutes}`;
    
    // Actualizar la asignación
    asignacion.horaFinReal = currentTimeString;
    asignacion.activo = false;
    // Resetear los campos de operación al finalizar el turno
    asignacion.agente = false;
    asignacion.super = false;
    
    await this.usuarioTurnoRepository.save(asignacion);
    console.log(`[USUARIOS_TURNOS] Asignación finalizada: ${asignacion.id}`);
    
    return this.findOne(asignacion.id);
  }

  async reiniciarTurnoVendedor(usuarioId: number, turnoId: number): Promise<UsuarioTurno> {
    console.log(`[USUARIOS_TURNOS] Reiniciando turno ID: ${turnoId} para vendedor ID: ${usuarioId}`);
    
    // Validar IDs
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    if (!turnoId || isNaN(Number(turnoId))) {
      throw new BadRequestException(`ID de turno inválido: ${turnoId}`);
    }
    
    // Buscar la asignación existente
    const asignacion = await this.findByUsuarioAndTurno(usuarioId, turnoId);
    
    if (!asignacion) {
      throw new NotFoundException(`No se encontró asignación para usuario ID: ${usuarioId} y turno ID: ${turnoId}`);
    }
    
    // Actualizar la asignación - Usar una consulta directa para asegurarnos de que los campos se establecen como NULL en la base de datos
    await this.usuarioTurnoRepository
      .createQueryBuilder()
      .update(UsuarioTurno)
      .set({
        horaInicioReal: null,
        horaFinReal: null,
        activo: false
      })
      .where("id = :id", { id: asignacion.id })
      .execute();
    
    console.log(`[USUARIOS_TURNOS] Asignación reiniciada: ${asignacion.id}`);
    
    // Obtener la asignación actualizada
    return this.findOne(asignacion.id);
  }

  async getTurnosActivosPorUsuario(usuarioId: number): Promise<UsuarioTurno[]> {
    console.log(`[USUARIOS_TURNOS] Obteniendo turnos activos para usuario ID: ${usuarioId}`);
    
    if (!usuarioId || isNaN(Number(usuarioId))) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    return this.usuarioTurnoRepository.find({
      where: { usuarioId, activo: true },
      relations: ['usuario', 'turno'],
    });
  }

  async getOperacionesEnUso(): Promise<{
    operacionAgente: { enUso: boolean; usuario?: User };
    operacionSuper: { enUso: boolean; usuario?: User };
  }> {
    console.log(`[USUARIOS_TURNOS] Obteniendo estado de operaciones en uso`);
    
    const operacionAgente = await this.operacionEstaEnUso('agente');
    const operacionSuper = await this.operacionEstaEnUso('super');
    
    return {
      operacionAgente,
      operacionSuper
    };
  }
}
