import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { FinalizarTurnoDto } from './dto/finalizar-turno.dto';
import { Turno } from './entities/turno.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private turnosRepository: Repository<Turno>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTurnoDto: CreateTurnoDto): Promise<Turno> {
    console.log(`[TURNOS] Iniciando creación de turno con datos:`, JSON.stringify(createTurnoDto, null, 2));
    
    try {
      // Validar que la hora de inicio sea anterior a la hora de fin
      if (createTurnoDto.horaInicio >= createTurnoDto.horaFin) {
        console.log(`[TURNOS] Error: Hora inicio (${createTurnoDto.horaInicio}) >= hora fin (${createTurnoDto.horaFin})`);
        throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
      }

      // Verificar si ya existe un turno con el mismo nombre
      const existingTurno = await this.turnosRepository.findOne({ 
        where: { nombre: createTurnoDto.nombre } 
      });
      
      if (existingTurno) {
        console.log(`[TURNOS] Error: Ya existe un turno con el nombre ${createTurnoDto.nombre}`);
        throw new BadRequestException(`Ya existe un turno con el nombre ${createTurnoDto.nombre}`);
      }

      console.log(`[TURNOS] Creando nuevo turno...`);
      
      try {
        // Crear directamente la entidad sin usar create primero
        const turnoData = {
          nombre: createTurnoDto.nombre,
          horaInicio: createTurnoDto.horaInicio,
          horaFin: createTurnoDto.horaFin,
          descripcion: createTurnoDto.descripcion || null,
          activo: createTurnoDto.activo !== undefined ? createTurnoDto.activo : true
        };
        
        console.log(`[TURNOS] Datos a guardar:`, JSON.stringify(turnoData, null, 2));
        
        // Guardar directamente sin crear la entidad primero
        const savedTurno = await this.turnosRepository.save(turnoData);
        console.log(`[TURNOS] Turno guardado exitosamente con ID: ${savedTurno.id}`);
        
        // Si se proporcionaron IDs de usuarios, asignarlos al turno
        if (createTurnoDto.usuariosIds && createTurnoDto.usuariosIds.length > 0) {
          console.log(`[TURNOS] Asignando usuarios al turno: ${createTurnoDto.usuariosIds.join(', ')}`);
          try {
            await this.asignarUsuariosATurno(savedTurno.id, createTurnoDto.usuariosIds);
            console.log(`[TURNOS] Usuarios asignados correctamente`);
          } catch (error) {
            console.error(`[TURNOS] Error al asignar usuarios al turno:`, error);
            // Continuamos aunque falle la asignación de usuarios
          }
        }
        
        return savedTurno;
      } catch (dbError) {
        console.error(`[TURNOS] Error de base de datos al guardar turno:`, dbError);
        throw new BadRequestException(`Error al crear turno: ${dbError.message}`);
      }
    } catch (error) {
      console.error(`[TURNOS] Error al crear turno:`, error);
      if (error instanceof BadRequestException) {
        throw error; // Re-lanzar errores de validación
      }
      throw new BadRequestException(`Error al crear turno: ${error.message}`);
    }
  }

  async findAll(): Promise<Turno[]> {
    console.log(`[TURNOS] Obteniendo todos los turnos`);
    try {
      const turnos = await this.turnosRepository.find({
        relations: ['usuarios'],
        order: {
          horaInicio: 'ASC',
        },
      });
      console.log(`[TURNOS] Se encontraron ${turnos.length} turnos`);
      return turnos;
    } catch (error) {
      console.error(`[TURNOS] Error al obtener turnos:`, error);
      throw new BadRequestException(`Error al obtener turnos: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Turno> {
    console.log(`[TURNOS] Buscando turno con ID ${id}`);
    try {
      const turno = await this.turnosRepository.findOne({ 
        where: { id },
        relations: ['usuarios']
      });
      
      if (!turno) {
        console.log(`[TURNOS] Turno con ID ${id} no encontrado`);
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }
      
      console.log(`[TURNOS] Turno encontrado: ${turno.nombre}`);
      return turno;
    } catch (error) {
      console.error(`[TURNOS] Error al buscar turno:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al buscar turno: ${error.message}`);
    }
  }

  async update(id: number, updateTurnoDto: UpdateTurnoDto): Promise<Turno> {
    console.log(`[TURNOS] Iniciando actualización de turno ID ${id} con datos:`, JSON.stringify(updateTurnoDto, null, 2));
    
    // Verificar que el turno existe
    const turno = await this.findOne(id);
    console.log(`[TURNOS] Turno encontrado:`, JSON.stringify(turno, null, 2));
    
    // Si se está actualizando la hora, validar que inicio sea anterior a fin
    if (updateTurnoDto.horaInicio && updateTurnoDto.horaFin) {
      console.log(`[TURNOS] Validando horas: inicio=${updateTurnoDto.horaInicio}, fin=${updateTurnoDto.horaFin}`);
      if (updateTurnoDto.horaInicio >= updateTurnoDto.horaFin) {
        console.log(`[TURNOS] Error: Hora inicio (${updateTurnoDto.horaInicio}) >= hora fin (${updateTurnoDto.horaFin})`);
        throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
      }
    } else if (updateTurnoDto.horaInicio && !updateTurnoDto.horaFin) {
      console.log(`[TURNOS] Validando hora inicio nueva con hora fin existente: inicio=${updateTurnoDto.horaInicio}, fin=${turno.horaFin}`);
      if (updateTurnoDto.horaInicio >= turno.horaFin) {
        console.log(`[TURNOS] Error: Hora inicio nueva (${updateTurnoDto.horaInicio}) >= hora fin existente (${turno.horaFin})`);
        throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
      }
    } else if (!updateTurnoDto.horaInicio && updateTurnoDto.horaFin) {
      console.log(`[TURNOS] Validando hora inicio existente con hora fin nueva: inicio=${turno.horaInicio}, fin=${updateTurnoDto.horaFin}`);
      if (turno.horaInicio >= updateTurnoDto.horaFin) {
        console.log(`[TURNOS] Error: Hora inicio existente (${turno.horaInicio}) >= hora fin nueva (${updateTurnoDto.horaFin})`);
        throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
      }
    }
    
    // Si se está actualizando el nombre, verificar que no exista otro turno con ese nombre
    if (updateTurnoDto.nombre && updateTurnoDto.nombre !== turno.nombre) {
      console.log(`[TURNOS] Verificando si existe otro turno con el nombre: ${updateTurnoDto.nombre}`);
      const existingTurno = await this.turnosRepository.findOne({ 
        where: { nombre: updateTurnoDto.nombre } 
      });
      
      if (existingTurno) {
        console.log(`[TURNOS] Error: Ya existe un turno con el nombre ${updateTurnoDto.nombre}`);
        throw new BadRequestException(`Ya existe un turno con el nombre ${updateTurnoDto.nombre}`);
      }
    }
    
    // Preparar los datos para actualizar
    const updateData = {};
    
    // Solo incluir los campos que se están actualizando
    if (updateTurnoDto.nombre !== undefined) updateData['nombre'] = updateTurnoDto.nombre;
    if (updateTurnoDto.horaInicio !== undefined) updateData['horaInicio'] = updateTurnoDto.horaInicio;
    
    // Si horaFin se establece a null, también activamos el turno
    if (updateTurnoDto.horaFin !== undefined) {
      updateData['horaFin'] = updateTurnoDto.horaFin;
      // Si se elimina la hora de fin (null), activamos el turno automáticamente
      if (updateTurnoDto.horaFin === null) {
        console.log(`[TURNOS] Hora fin establecida a null, activando turno automáticamente`);
        updateData['activo'] = true;
      }
    }
    
    if (updateTurnoDto.descripcion !== undefined) updateData['descripcion'] = updateTurnoDto.descripcion;
    // Solo actualizamos activo si viene explícitamente en el DTO y no hemos activado por horaFin=null
    if (updateTurnoDto.activo !== undefined && !(updateTurnoDto.horaFin === null)) {
      updateData['activo'] = updateTurnoDto.activo;
    }
    // usuarioId ha sido eliminado de la tabla
    
    console.log(`[TURNOS] Datos a actualizar:`, JSON.stringify(updateData, null, 2));
    
    try {
      // Actualizar y guardar el turno
      await this.turnosRepository.update(id, updateData);
      console.log(`[TURNOS] Turno actualizado exitosamente`);
    } catch (error) {
      console.error(`[TURNOS] Error al actualizar turno:`, error);
      throw new BadRequestException(`Error al actualizar turno: ${error.message}`);
    }
    
    // Si se proporcionaron IDs de usuarios, actualizar las asignaciones
    if (updateTurnoDto.usuariosIds) {
      console.log(`[TURNOS] Actualizando asignaciones de usuarios:`, updateTurnoDto.usuariosIds);
      try {
        await this.asignarUsuariosATurno(id, updateTurnoDto.usuariosIds);
        console.log(`[TURNOS] Asignaciones de usuarios actualizadas exitosamente`);
      } catch (error) {
        console.error(`[TURNOS] Error al actualizar asignaciones de usuarios:`, error);
        throw new BadRequestException(`Error al actualizar asignaciones de usuarios: ${error.message}`);
      }
    }
    
    console.log(`[TURNOS] Obteniendo turno actualizado`);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.turnosRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Turno con ID ${id} no encontrado`);
    }
  }

  // Método para obtener el turno actual basado en la hora
  async getTurnoActual(): Promise<Turno | null> {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    // Buscar todos los turnos activos
    const turnos = await this.turnosRepository.find({ 
      where: { activo: true },
      relations: ['usuarios'],
      order: { horaInicio: 'ASC' } 
    });
    
    // Encontrar el turno actual
    for (const turno of turnos) {
      if (currentTimeString >= turno.horaInicio && currentTimeString < turno.horaFin) {
        return turno;
      }
    }
    
    return null; // No hay turno activo en este momento
  }
  
  // Método para asignar usuarios a un turno
  async asignarUsuariosATurno(turnoId: number, usuariosIds: number[]): Promise<void> {
    console.log(`[TURNOS] Iniciando asignación de usuarios al turno ID ${turnoId}. Usuarios: ${usuariosIds.join(', ')}`);
    
    try {
      // Verificar que el turno existe
      const turno = await this.turnosRepository.findOne({
        where: { id: turnoId },
        relations: ['usuarios']
      });
      
      if (!turno) {
        console.log(`[TURNOS] Error: Turno con ID ${turnoId} no encontrado`);
        throw new NotFoundException(`Turno con ID ${turnoId} no encontrado`);
      }
      
      console.log(`[TURNOS] Turno encontrado: ${turno.nombre}`);
      
      // Si no hay usuarios para asignar, terminar
      if (!usuariosIds || usuariosIds.length === 0) {
        console.log(`[TURNOS] No hay usuarios para asignar, terminando`);
        return;
      }
      
      // Filtrar IDs no válidos (0, null, undefined)
      const validUserIds = usuariosIds.filter(id => id && id > 0);
      
      if (validUserIds.length === 0) {
        console.log(`[TURNOS] No hay IDs de usuario válidos para asignar`);
        return;
      }
      
      console.log(`[TURNOS] Buscando usuarios con IDs: ${validUserIds.join(', ')}`);
      
      // Buscar los usuarios por sus IDs
      const usuarios = await this.usersRepository.find({
        where: { id: In(validUserIds) }
      });
      
      console.log(`[TURNOS] Usuarios encontrados: ${usuarios.length}`);
      
      if (usuarios.length !== validUserIds.length) {
        const encontradosIds = usuarios.map(u => u.id);
        const noEncontrados = validUserIds.filter(id => !encontradosIds.includes(id));
        console.log(`[TURNOS] Advertencia: No se encontraron todos los usuarios. Faltantes: ${noEncontrados.join(', ')}`);
      }
      
      if (usuarios.length === 0) {
        console.log(`[TURNOS] No se encontró ningún usuario válido, terminando`);
        return;
      }
      
      // Asignar los usuarios al turno
      console.log(`[TURNOS] Asignando ${usuarios.length} usuarios al turno`);
      turno.usuarios = usuarios;
      
      await this.turnosRepository.save(turno);
      console.log(`[TURNOS] Usuarios asignados correctamente al turno ID ${turnoId}`);
    } catch (error) {
      console.error(`[TURNOS] Error al asignar usuarios al turno:`, error);
      throw new BadRequestException(`Error al asignar usuarios al turno: ${error.message}`);
    }
  }
  
  // Método para obtener los usuarios asignados a un turno
  async getUsuariosPorTurno(turnoId: number): Promise<User[]> {
    const turno = await this.turnosRepository.findOne({
      where: { id: turnoId },
      relations: ['usuarios']
    });
    
    if (!turno) {
      throw new NotFoundException(`Turno con ID ${turnoId} no encontrado`);
    }
    
    return turno.usuarios;
  }
  
  // Método para obtener los turnos asignados a un usuario
  async getTurnosPorUsuario(usuarioId: number): Promise<Turno[]> {
    const turnos = await this.turnosRepository.createQueryBuilder('turno')
      .innerJoin('turno.usuarios', 'usuario', 'usuario.id = :usuarioId', { usuarioId })
      .getMany();
    
    return turnos;
  }

  // Método para iniciar un turno (actualizar la hora de inicio con la hora actual)
  async iniciarTurno(id: number, iniciarTurnoDto: IniciarTurnoDto): Promise<Turno> {
    console.log(`[TURNOS] Iniciando turno con ID ${id}`);
    
    try {
      // Verificar que el turno existe
      const turno = await this.findOne(id);
      
      if (!turno) {
        console.log(`[TURNOS] Error: Turno con ID ${id} no encontrado`);
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }
      
      // Obtener la hora actual en formato HH:MM
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinutes}`;
      
      // Actualizar la hora de inicio
      const horaInicio = iniciarTurnoDto.horaInicio || currentTimeString;
      
      console.log(`[TURNOS] Actualizando hora de inicio del turno ${turno.nombre} a ${horaInicio}`);
      
      // Actualizar el turno y marcarlo como activo
      await this.turnosRepository.update(id, { 
        horaInicio,
        activo: true // Al iniciar un turno, lo marcamos como activo
      });
      
      console.log(`[TURNOS] Turno ${turno.nombre} iniciado y marcado como activo`);
      
      // Retornar el turno actualizado
      return this.findOne(id);
    } catch (error) {
      console.error(`[TURNOS] Error al iniciar turno:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Error al iniciar turno: ${error.message}`);
    }
  }

  // Método para finalizar un turno (actualizar la hora de fin con la hora actual)
  async finalizarTurno(id: number, finalizarTurnoDto: FinalizarTurnoDto): Promise<Turno> {
    console.log(`[TURNOS] Finalizando turno con ID ${id}`);
    
    try {
      // Verificar que el turno existe
      const turno = await this.findOne(id);
      
      if (!turno) {
        console.log(`[TURNOS] Error: Turno con ID ${id} no encontrado`);
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }
      
      // Obtener la hora actual en formato HH:MM
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinutes}`;
      
      // Actualizar la hora de fin
      const horaFin = finalizarTurnoDto.horaFin || currentTimeString;
      
      console.log(`[TURNOS] Actualizando hora de fin del turno ${turno.nombre} a ${horaFin}`);
      
      // Actualizar el turno y marcarlo como inactivo
      await this.turnosRepository.update(id, { 
        horaFin,
        activo: false // Al finalizar un turno, lo marcamos como inactivo
      });
      
      console.log(`[TURNOS] Turno ${turno.nombre} finalizado y marcado como inactivo`);
      
      // Retornar el turno actualizado
      return this.findOne(id);
    } catch (error) {
      console.error(`[TURNOS] Error al finalizar turno:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Error al finalizar turno: ${error.message}`);
    }
  }
}
