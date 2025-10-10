import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { IniciarTurnoDto } from './dto/iniciar-turno.dto';
import { FinalizarTurnoDto } from './dto/finalizar-turno.dto';
import { Turno } from './entities/turno.entity';
import { User } from '../users/entities/user.entity';
import { RegistroActividad } from './entities/registro-actividad.entity';
import { AgentClosingsService } from '../agent-closings/agent-closings.service';
import { TransactionsService } from '../transactions/transactions.service';
import { BilletesService } from '../cash/services/billetes.service';
import { CierreSuper } from '../cierres-super/entities/cierre-super.entity';
import { SuperExpense } from '../super-expenses/entities/super-expense.entity';
import { BalanceFlow } from '../balance-flows/entities/balance-flow.entity';
import { BalanceSale } from '../balance-sales/entities/balance-sale.entity';
import { ConteoBilletesSuper } from '../conteo-billetes-super/entities/conteo-billetes-super.entity';
import { AdicionalesPrestamos } from '../adicionales-prestamos/entities/adicionales-prestamos.entity';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private turnosRepository: Repository<Turno>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RegistroActividad)
    private registroActividadRepository: Repository<RegistroActividad>,
    @InjectRepository(CierreSuper)
    private cierresSuperRepository: Repository<CierreSuper>,
    @InjectRepository(SuperExpense)
    private superExpensesRepository: Repository<SuperExpense>,
    @InjectRepository(BalanceFlow)
    private balanceFlowsRepository: Repository<BalanceFlow>,
    @InjectRepository(BalanceSale)
    private balanceSalesRepository: Repository<BalanceSale>,
    @InjectRepository(ConteoBilletesSuper)
    private conteoBilletesSuperRepository: Repository<ConteoBilletesSuper>,
    @InjectRepository(AdicionalesPrestamos)
    private adicionalesPrestamosRepository: Repository<AdicionalesPrestamos>,
    private agentClosingsService: AgentClosingsService,
    private transactionsService: TransactionsService,
    private billetesService: BilletesService,
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
    
    // Validar que el ID sea un número válido
    if (id === undefined || id === null || isNaN(Number(id))) {
      console.error(`[TURNOS] ID de turno inválido: ${id}`);
      throw new BadRequestException(`ID de turno inválido: ${id}`);
    }
    
    try {
      // Convertir explícitamente a número entero para evitar problemas con NaN
      const turnoId = parseInt(String(id), 10);
      
      if (isNaN(turnoId)) {
        throw new BadRequestException(`ID de turno inválido: ${id}`);
      }
      
      const turno = await this.turnosRepository.findOne({ 
        where: { id: turnoId },
        relations: ['usuarios']
      });
      
      if (!turno) {
        console.log(`[TURNOS] Turno con ID ${turnoId} no encontrado`);
        throw new NotFoundException(`Turno con ID ${turnoId} no encontrado`);
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
    console.log(`[TURNOS] Obteniendo usuarios para turno ID: ${turnoId}`);
    
    // Validar que el ID sea un número válido
    if (turnoId === undefined || turnoId === null || isNaN(Number(turnoId))) {
      console.error(`[TURNOS] ID de turno inválido para getUsuariosPorTurno: ${turnoId}`);
      throw new BadRequestException(`ID de turno inválido: ${turnoId}`);
    }
    
    // Convertir explícitamente a número entero para evitar problemas con NaN
    const validTurnoId = parseInt(String(turnoId), 10);
    
    if (isNaN(validTurnoId)) {
      throw new BadRequestException(`ID de turno inválido: ${turnoId}`);
    }
    
    try {
      const turno = await this.turnosRepository.findOne({
        where: { id: validTurnoId },
        relations: ['usuarios']
      });
      
      if (!turno) {
        console.log(`[TURNOS] Turno con ID ${validTurnoId} no encontrado`);
        throw new NotFoundException(`Turno con ID ${validTurnoId} no encontrado`);
      }
      
      console.log(`[TURNOS] Encontrados ${turno.usuarios?.length || 0} usuarios para el turno ${turno.nombre}`);
      return turno.usuarios || [];
    } catch (error) {
      console.error(`[TURNOS] Error al obtener usuarios por turno:`, error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener usuarios por turno: ${error.message}`);
    }
  }
  
  // Método para obtener los turnos asignados a un usuario
  async getTurnosPorUsuario(usuarioId: number): Promise<Turno[]> {
    console.log(`[TURNOS] Obteniendo turnos para usuario ID: ${usuarioId}`);
    
    // Validar que el ID sea un número válido
    if (usuarioId === undefined || usuarioId === null || isNaN(Number(usuarioId))) {
      console.error(`[TURNOS] ID de usuario inválido para getTurnosPorUsuario: ${usuarioId}`);
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    // Convertir explícitamente a número entero para evitar problemas con NaN
    const validUsuarioId = parseInt(String(usuarioId), 10);
    
    if (isNaN(validUsuarioId)) {
      throw new BadRequestException(`ID de usuario inválido: ${usuarioId}`);
    }
    
    try {
      const turnos = await this.turnosRepository.createQueryBuilder('turno')
        .innerJoin('turno.usuarios', 'usuario', 'usuario.id = :usuarioId', { usuarioId: validUsuarioId })
        .getMany();
      
      console.log(`[TURNOS] Encontrados ${turnos.length} turnos para el usuario ID ${validUsuarioId}`);
      return turnos;
    } catch (error) {
      console.error(`[TURNOS] Error al obtener turnos por usuario:`, error);
      throw new BadRequestException(`Error al obtener turnos por usuario: ${error.message}`);
    }
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
      
      // Actualizar el estado de los cierres de agentes asociados a este turno a inactivo
      try {
        console.log(`[TURNOS] Actualizando estado de cierres de agentes para turno ${id} a inactivo`);
        await this.agentClosingsService.updateClosingStatusByTurno(id, false);
        console.log(`[TURNOS] Estado de cierres de agentes actualizado correctamente`);
      } catch (closingError) {
        console.error(`[TURNOS] Error al actualizar estado de cierres de agentes:`, closingError);
        // No lanzamos el error para que no interrumpa el flujo principal de finalización del turno
        // Solo lo registramos en el log
      }
      
      // Actualizar el estado de las transacciones asociadas a este turno a inactivo
      try {
        console.log(`[TURNOS] Actualizando estado de transacciones para turno ${id} a inactivo`);
        const transactionsUpdated = await this.transactionsService.updateTransactionStatusByTurno(id);
        console.log(`[TURNOS] ${transactionsUpdated} transacciones actualizadas a inactivas`);
      } catch (transactionError) {
        console.error(`[TURNOS] Error al actualizar estado de transacciones:`, transactionError);
        // No lanzamos el error para que no interrumpa el flujo principal de finalización del turno
        // Solo lo registramos en el log
      }
      
      // Actualizar el estado de los conteos de billetes asociados a este turno a inactivo
      try {
        console.log(`[TURNOS] Actualizando estado de conteos de billetes para turno ${id} a inactivo`);
        const cashCountsUpdated = await this.billetesService.updateCashCountStatusByTurno(id);
        console.log(`[TURNOS] ${cashCountsUpdated} conteos de billetes actualizados a inactivos`);
      } catch (cashCountError) {
        console.error(`[TURNOS] Error al actualizar estado de conteos de billetes:`, cashCountError);
        // No lanzamos el error para que no interrumpa el flujo principal de finalización del turno
        // Solo lo registramos en el log
      }
      
      // Retornar el turno actualizado
      return this.findOne(id);
    } catch (error) {
      console.error(`[TURNOS] Error al finalizar turno:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Error al finalizar turno: ${error.message}`);
    }
  }

  // Método para que un vendedor inicie su turno y registre la actividad
  async iniciarTurnoVendedor(id: number, userId: number): Promise<Turno> {
    console.log(`[TURNOS] Vendedor con ID ${userId} iniciando turno con ID ${id}`);
    
    try {
      // Verificar que el turno existe
      const turno = await this.findOne(id);
      
      if (!turno) {
        console.log(`[TURNOS] Error: Turno con ID ${id} no encontrado`);
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }
      
      // Verificar que el usuario existe
      const usuario = await this.usersRepository.findOne({ where: { id: userId } });
      
      if (!usuario) {
        console.log(`[TURNOS] Error: Usuario con ID ${userId} no encontrado`);
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
      
      // Obtener la hora actual en formato HH:MM
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinutes}`;
      
      console.log(`[TURNOS] Actualizando hora de inicio del turno ${turno.nombre} a ${currentTimeString}`);
      
      // Actualizar el turno y marcarlo como activo
      await this.turnosRepository.update(id, { 
        horaInicio: currentTimeString,
        activo: true // Al iniciar un turno, lo marcamos como activo
      });
      
      // Registrar la actividad
      await this.registroActividadRepository.save({
        turno: { id },
        usuario: { id: userId },
        accion: 'iniciar',
        descripcion: `Vendedor ${usuario.nombre} inició el turno ${turno.nombre} a las ${currentTimeString}`
      });
      
      console.log(`[TURNOS] Turno ${turno.nombre} iniciado por vendedor ${usuario.nombre} y registrado en actividad`);
      
      // Retornar el turno actualizado
      return this.findOne(id);
    } catch (error) {
      console.error(`[TURNOS] Error al iniciar turno por vendedor:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Error al iniciar turno: ${error.message}`);
    }
  }

  // Método para que un vendedor finalice su turno y registre la actividad
  async finalizarTurnoVendedor(id: number, userId: number): Promise<Turno> {
    console.log(`[TURNOS] Vendedor con ID ${userId} finalizando turno con ID ${id}`);
    
    try {
      // Verificar que el turno existe
      const turno = await this.findOne(id);
      
      if (!turno) {
        console.log(`[TURNOS] Error: Turno con ID ${id} no encontrado`);
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }
      
      // Verificar que el usuario existe
      const usuario = await this.usersRepository.findOne({ where: { id: userId } });
      
      if (!usuario) {
        console.log(`[TURNOS] Error: Usuario con ID ${userId} no encontrado`);
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
      
      // Obtener la hora actual en formato HH:MM
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHour}:${currentMinutes}`;
      
      console.log(`[TURNOS] Actualizando hora de fin del turno ${turno.nombre} a ${currentTimeString}`);
      
      // Actualizar el turno y marcarlo como inactivo
      await this.turnosRepository.update(id, { 
        horaFin: currentTimeString,
        activo: false // Al finalizar un turno, lo marcamos como inactivo
      });

      // Desactivar registros activos en múltiples tablas relacionadas con el turno
      await this.desactivarRegistrosDelTurno(id, userId);
      
      // Registrar la actividad
      await this.registroActividadRepository.save({
        turno: { id },
        usuario: { id: userId },
        accion: 'finalizar',
        descripcion: `Vendedor ${usuario.nombre} finalizó el turno ${turno.nombre} a las ${currentTimeString}`
      });
      
      console.log(`[TURNOS] Turno ${turno.nombre} finalizado por vendedor ${usuario.nombre} y registrado en actividad`);
      
      // Retornar el turno actualizado
      return this.findOne(id);
    } catch (error) {
      console.error(`[TURNOS] Error al finalizar turno por vendedor:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Error al finalizar turno: ${error.message}`);
    }
  }

  // Método para reiniciar un turno (eliminar hora de inicio y fin)
  async reiniciarTurno(id: number, userId: number): Promise<Turno> {
    console.log(`[TURNOS] Usuario con ID ${userId} reiniciando turno con ID ${id}`);
    
    try {
      // Verificar que el turno existe
      const turno = await this.findOne(id);
      
      if (!turno) {
        console.log(`[TURNOS] Error: Turno con ID ${id} no encontrado`);
        throw new NotFoundException(`Turno con ID ${id} no encontrado`);
      }
      
      // Verificar que el usuario existe
      const usuario = await this.usersRepository.findOne({ where: { id: userId } });
      
      if (!usuario) {
        console.log(`[TURNOS] Error: Usuario con ID ${userId} no encontrado`);
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }
      
      console.log(`[TURNOS] Reiniciando turno ${turno.nombre}`);
      
      // Actualizar el turno: eliminar hora de inicio y fin, y marcarlo como inactivo
      await this.turnosRepository.update(id, { 
        horaInicio: null,
        horaFin: null,
        activo: false // Al reiniciar un turno, lo marcamos como inactivo
      });
      
      // Registrar la actividad
      await this.registroActividadRepository.save({
        turno: { id },
        usuario: { id: userId },
        accion: 'reiniciar',
        descripcion: `Usuario ${usuario.nombre} reinició el turno ${turno.nombre}`
      });
      
      console.log(`[TURNOS] Turno ${turno.nombre} reiniciado por usuario ${usuario.nombre} y registrado en actividad`);
      
      // Retornar el turno actualizado
      return this.findOne(id);
    } catch (error) {
      console.error(`[TURNOS] Error al reiniciar turno:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Error al reiniciar turno: ${error.message}`);
    }
  }

  // Método para obtener los registros de actividad de turnos
  async getRegistrosActividad(options?: { 
    turnoId?: number, 
    usuarioId?: number,
    fechaInicio?: Date,
    fechaFin?: Date,
    limit?: number,
    offset?: number
  }): Promise<{ registros: RegistroActividad[], total: number }> {
    console.log(`[TURNOS] Obteniendo registros de actividad con opciones:`, options);
    
    try {
      // Validar opciones para evitar errores de conversión
      const validatedOptions = {
        ...options
      };
      
      // Validación robusta para turnoId
      if (validatedOptions?.turnoId !== undefined && validatedOptions?.turnoId !== null) {
        const turnoIdNum = Number(validatedOptions.turnoId);
        if (isNaN(turnoIdNum)) {
          console.error(`[TURNOS] Error: turnoId inválido en servicio: ${validatedOptions.turnoId}`);
          delete validatedOptions.turnoId;
        } else {
          // Asegurarse de que sea un entero válido
          validatedOptions.turnoId = Math.floor(turnoIdNum);
          console.log(`[TURNOS] turnoId validado: ${validatedOptions.turnoId}`);
        }
      } else {
        delete validatedOptions.turnoId;
      }
      
      // Validación robusta para usuarioId
      if (validatedOptions?.usuarioId !== undefined && validatedOptions?.usuarioId !== null) {
        const usuarioIdNum = Number(validatedOptions.usuarioId);
        if (isNaN(usuarioIdNum)) {
          console.error(`[TURNOS] Error: usuarioId inválido en servicio: ${validatedOptions.usuarioId}`);
          delete validatedOptions.usuarioId;
        } else {
          // Asegurarse de que sea un entero válido
          validatedOptions.usuarioId = Math.floor(usuarioIdNum);
          console.log(`[TURNOS] usuarioId validado: ${validatedOptions.usuarioId}`);
        }
      } else {
        delete validatedOptions.usuarioId;
      }
      
      console.log(`[TURNOS] Opciones validadas:`, validatedOptions);
      
      // Construir query base con logging SQL
      const queryBuilder = this.registroActividadRepository.createQueryBuilder('registro')
        .leftJoinAndSelect('registro.turno', 'turno')
        .leftJoinAndSelect('registro.usuario', 'usuario')
        .orderBy('registro.fechaHora', 'DESC');
      
      // Imprimir la consulta SQL para depuración
      console.log('[TURNOS] Consulta SQL base:', queryBuilder.getSql());
      
      // Verificar si hay registros en la tabla antes de aplicar filtros
      const totalRegistros = await this.registroActividadRepository.count();
      console.log(`[TURNOS] Total de registros en la tabla antes de filtrar: ${totalRegistros}`);
      
      // Aplicar filtros si se proporcionan y son válidos
      if (validatedOptions?.turnoId !== undefined) {
        queryBuilder.andWhere('registro.turno_id = :turnoId', { turnoId: validatedOptions.turnoId });
      }
      
      if (validatedOptions?.usuarioId !== undefined) {
        queryBuilder.andWhere('registro.usuario_id = :usuarioId', { usuarioId: validatedOptions.usuarioId });
      }
      
      // Validar y aplicar filtros de fecha
      if (validatedOptions?.fechaInicio && validatedOptions.fechaInicio instanceof Date && !isNaN(validatedOptions.fechaInicio.getTime())) {
        queryBuilder.andWhere('registro.fecha_hora >= :fechaInicio', { 
          fechaInicio: validatedOptions.fechaInicio 
        });
      }
      
      if (validatedOptions?.fechaFin && validatedOptions.fechaFin instanceof Date && !isNaN(validatedOptions.fechaFin.getTime())) {
        queryBuilder.andWhere('registro.fecha_hora <= :fechaFin', { 
          fechaFin: validatedOptions.fechaFin 
        });
      }
      
      // Obtener el total de registros para paginación
      const total = await queryBuilder.getCount();
      
      // Validación robusta para limit
      let limit = 10; // Valor predeterminado
      if (validatedOptions?.limit !== undefined && validatedOptions?.limit !== null) {
        const limitNum = Number(validatedOptions.limit);
        if (!isNaN(limitNum) && limitNum > 0) {
          limit = Math.min(Math.floor(limitNum), 100); // Limitar a máximo 100 registros por página
          console.log(`[TURNOS] limit validado: ${limit}`);
        } else {
          console.error(`[TURNOS] Error: limit inválido en servicio: ${validatedOptions.limit}, usando valor por defecto`);
        }
      }
      queryBuilder.take(limit);
      
      // Validación robusta para offset
      let offset = 0; // Valor predeterminado
      if (validatedOptions?.offset !== undefined && validatedOptions?.offset !== null) {
        const offsetNum = Number(validatedOptions.offset);
        if (!isNaN(offsetNum) && offsetNum >= 0) {
          offset = Math.floor(offsetNum);
          console.log(`[TURNOS] offset validado: ${offset}`);
        } else {
          console.error(`[TURNOS] Error: offset inválido en servicio: ${validatedOptions.offset}, usando valor por defecto`);
        }
      }
      queryBuilder.skip(offset);
      
      // Imprimir la consulta SQL final con todos los filtros aplicados
      console.log('[TURNOS] Consulta SQL final:', queryBuilder.getSql());
      console.log('[TURNOS] Parámetros de la consulta:', queryBuilder.getParameters());
      
      // Ejecutar la consulta
      const registros = await queryBuilder.getMany();
      
      console.log(`[TURNOS] Se encontraron ${registros.length} registros de actividad`);
      
      // Log detallado para depuración
      if (registros.length === 0) {
        console.log('[TURNOS] ALERTA: No se encontraron registros. Verificando si hay datos en la tabla...');
        
        // Consulta directa para verificar si hay datos en la tabla
        const countQuery = this.registroActividadRepository.createQueryBuilder('registro')
          .select('COUNT(*)', 'count');
        
        const countResult = await countQuery.getRawOne();
        console.log(`[TURNOS] Total de registros en la tabla: ${countResult?.count || 0}`);
        
        // Si hay registros, obtener algunos ejemplos para diagnóstico
        if (countResult?.count > 0) {
          const sampleQuery = this.registroActividadRepository.createQueryBuilder('registro')
            .leftJoinAndSelect('registro.turno', 'turno')
            .leftJoinAndSelect('registro.usuario', 'usuario')
            .orderBy('registro.fechaHora', 'DESC')
            .take(3);
          
          const sampleRegistros = await sampleQuery.getMany();
          console.log('[TURNOS] Ejemplos de registros en la tabla:');
          sampleRegistros.forEach((registro, index) => {
            console.log(`[TURNOS] Registro ${index + 1}:`, {
              id: registro.id,
              turnoId: registro.turno?.id,
              usuarioId: registro.usuario?.id,
              accion: registro.accion,
              fechaHora: registro.fechaHora,
              descripcion: registro.descripcion
            });
          });
        }
        
        if (countResult?.count > 0) {
          console.log('[TURNOS] Hay registros en la tabla pero no coinciden con los filtros aplicados');
        } else {
          console.log('[TURNOS] La tabla está vacía. No hay registros de actividad para mostrar.');
        }
      } else {
        console.log('[TURNOS] Primeros registros encontrados:', registros.slice(0, 2));
      }
      
      // Obtener el total de registros que coinciden con los filtros
      const totalQuery = this.registroActividadRepository.createQueryBuilder('registro')
        .leftJoinAndSelect('registro.turno', 'turno')
        .leftJoinAndSelect('registro.usuario', 'usuario');
      
      // Aplicar los mismos filtros para el conteo
      if (validatedOptions?.turnoId !== undefined) {
        totalQuery.andWhere('registro.turno_id = :turnoId', { turnoId: validatedOptions.turnoId });
      }
      
      if (validatedOptions?.usuarioId !== undefined) {
        totalQuery.andWhere('registro.usuario_id = :usuarioId', { usuarioId: validatedOptions.usuarioId });
      }
      
      if (validatedOptions?.fechaInicio && validatedOptions.fechaInicio instanceof Date && !isNaN(validatedOptions.fechaInicio.getTime())) {
        totalQuery.andWhere('registro.fecha_hora >= :fechaInicio', { 
          fechaInicio: validatedOptions.fechaInicio 
        });
      }
      
      if (validatedOptions?.fechaFin && validatedOptions.fechaFin instanceof Date && !isNaN(validatedOptions.fechaFin.getTime())) {
        totalQuery.andWhere('registro.fecha_hora <= :fechaFin', { 
          fechaFin: validatedOptions.fechaFin 
        });
      }
      
      const totalCount = await totalQuery.getCount();
      
      return { registros, total: totalCount };
  } catch (error) {
    console.error('[TURNOS] Error al obtener registros de actividad:', error);
    throw new BadRequestException(`Error al obtener registros de actividad: ${error.message}`);
  }
}

// Método privado para desactivar todos los registros relacionados con un turno
private async desactivarRegistrosDelTurno(turnoId: number, usuarioId: number): Promise<void> {
  console.log(`[TURNOS] Desactivando registros relacionados con el turno ${turnoId} para usuario ${usuarioId}`);
  
  try {
    // Obtener la fecha actual para filtrar registros del día (solo año-mes-día)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    console.log(`[TURNOS] Filtrando registros del ${startOfDay.toISOString()} al ${endOfDay.toISOString()}`);

    // 1. Desactivar cierres super del usuario del día actual
    const cierresResult = await this.cierresSuperRepository.update(
      {
        usuarioId: usuarioId,
        activo: true,
        fechaCierre: Between(startOfDay, endOfDay)
      },
      { activo: false }
    );
    console.log(`[TURNOS] Desactivados ${cierresResult.affected} cierres super del usuario ${usuarioId}`);

    // 2. Desactivar gastos super del usuario del día actual
    const gastosResult = await this.superExpensesRepository.update(
      {
        usuarioId: usuarioId,
        activo: true,
        fechaEgreso: Between(startOfDay, endOfDay)
      },
      { activo: false }
    );
    console.log(`[TURNOS] Desactivados ${gastosResult.affected} gastos super del usuario ${usuarioId}`);

    // 3. Desactivar flujos de saldo del día actual (no tiene usuarioId, se desactivan todos del día)
    const flujosResult = await this.balanceFlowsRepository.update(
      {
        activo: true,
        fecha: Between(startOfDay, endOfDay)
      },
      { activo: false }
    );
    console.log(`[TURNOS] Desactivados ${flujosResult.affected} flujos de saldo del día`);

    // 4. Desactivar ventas de saldo del usuario del día actual
    const ventasResult = await this.balanceSalesRepository.update(
      {
        usuarioId: usuarioId,
        activo: true,
        fecha: Between(startOfDay, endOfDay)
      },
      { activo: false }
    );
    console.log(`[TURNOS] Desactivadas ${ventasResult.affected} ventas de saldo del usuario ${usuarioId}`);

    // 5. Desactivar conteos de billetes super del usuario del día actual
    const conteosResult = await this.conteoBilletesSuperRepository.update(
      {
        usuarioId: usuarioId,
        activo: true,
        fecha: Between(startOfDay, endOfDay)
      },
      { activo: false }
    );
    console.log(`[TURNOS] Desactivados ${conteosResult.affected} conteos de billetes super del usuario ${usuarioId}`);

    // 6. Desactivar adicionales y préstamos del usuario del día actual
    const adicionalesResult = await this.adicionalesPrestamosRepository.update(
      {
        usuarioId: usuarioId,
        activo: true,
        fecha: Between(startOfDay, endOfDay)
      },
      { activo: false }
    );
    console.log(`[TURNOS] Desactivados ${adicionalesResult.affected} adicionales y préstamos del usuario ${usuarioId}`);

    console.log(`[TURNOS] Finalizada desactivación de registros para el turno ${turnoId} del usuario ${usuarioId}`);
  } catch (error) {
    console.error(`[TURNOS] Error al desactivar registros del turno ${turnoId}:`, error);
    // No lanzamos el error para no interrumpir el flujo principal de finalización del turno
    // Solo logueamos el error para debugging
  }
}
}
