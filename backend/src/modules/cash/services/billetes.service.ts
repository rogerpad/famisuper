import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billete } from '../entities/billete.entity';
import { CreateBilleteDto } from '../dto/create-billete.dto';
import { SaveCashCountDto } from '../dto/save-cash-count.dto';

@Injectable()
export class BilletesService {
  private readonly logger = new Logger('BilletesService');

  constructor(
    @InjectRepository(Billete)
    private readonly billetesRepository: Repository<Billete>,
  ) {}

  async create(createBilleteDto: CreateBilleteDto): Promise<Billete> {
    try {
      this.logger.log(`[BILLETES_SERVICE] Creando billete con denominación: ${createBilleteDto.billete}`);
      
      // Convertir el DTO a una estructura compatible con la entidad Billete
      // Esto es una solución temporal hasta que se alineen completamente los DTOs y entidades
      const billeteData: any = {
        // Mapear los campos según la denominación
        usuarioId: createBilleteDto.turnoId || null, // Temporal, debería venir del contexto de autenticación
        turnoId: createBilleteDto.turnoId || null,
        estado: true,
        activo: createBilleteDto.activo !== undefined ? createBilleteDto.activo : true,
        totalGeneral: createBilleteDto.total || 0,
        fecha: new Date()
      };
      
      // Asignar valores según la denominación
      const denominacion = createBilleteDto.billete;
      switch(denominacion) {
        case 500:
          billeteData.deno500 = denominacion;
          billeteData.cant500 = createBilleteDto.cantidad;
          billeteData.total500 = createBilleteDto.totalBillete;
          break;
        case 200:
          billeteData.deno200 = denominacion;
          billeteData.cant200 = createBilleteDto.cantidad;
          billeteData.total200 = createBilleteDto.totalBillete;
          break;
        case 100:
          billeteData.deno100 = denominacion;
          billeteData.cant100 = createBilleteDto.cantidad;
          billeteData.total100 = createBilleteDto.totalBillete;
          break;
        case 50:
          billeteData.deno50 = denominacion;
          billeteData.cant50 = createBilleteDto.cantidad;
          billeteData.total50 = createBilleteDto.totalBillete;
          break;
        case 20:
          billeteData.deno20 = denominacion;
          billeteData.cant20 = createBilleteDto.cantidad;
          billeteData.total20 = createBilleteDto.totalBillete;
          break;
        case 10:
          billeteData.deno10 = denominacion;
          billeteData.cant10 = createBilleteDto.cantidad;
          billeteData.total10 = createBilleteDto.totalBillete;
          break;
        case 5:
          billeteData.deno5 = denominacion;
          billeteData.cant5 = createBilleteDto.cantidad;
          billeteData.total5 = createBilleteDto.totalBillete;
          break;
        case 2:
          billeteData.deno2 = denominacion;
          billeteData.cant2 = createBilleteDto.cantidad;
          billeteData.total2 = createBilleteDto.totalBillete;
          break;
        case 1:
          billeteData.deno1 = denominacion;
          billeteData.cant1 = createBilleteDto.cantidad;
          billeteData.total1 = createBilleteDto.totalBillete;
          break;
        default:
          throw new Error(`Denominación no válida: ${denominacion}`);
      }
      
      const billete = this.billetesRepository.create(billeteData);
      const savedBillete = await this.billetesRepository.save(billete) as unknown as Billete;
      
      this.logger.log(`[BILLETES_SERVICE] Billete creado con ID: ${savedBillete.id}`);
      return savedBillete;
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al crear billete: ${error.message}`, error.stack);
      throw error;
    }
  }

  async saveCashCount(saveCashCountDto: SaveCashCountDto): Promise<Billete> {
    this.logger.log(`[BILLETES_SERVICE] Iniciando guardado de conteo de efectivo`);
    
    try {
      // Validar que el usuarioId sea un número válido
      if (!saveCashCountDto.usuarioId || isNaN(Number(saveCashCountDto.usuarioId))) {
        this.logger.error(`[BILLETES_SERVICE] ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
        throw new Error(`ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
      }
      
      // Validar que el totalGeneral sea un número válido
      if (saveCashCountDto.totalGeneral === undefined || 
          saveCashCountDto.totalGeneral === null || 
          isNaN(Number(saveCashCountDto.totalGeneral))) {
        this.logger.error(`[BILLETES_SERVICE] Total general inválido: ${saveCashCountDto.totalGeneral}`);
        throw new Error(`Total general inválido: ${saveCashCountDto.totalGeneral}`);
      }
      
      this.logger.log(`[BILLETES_SERVICE] Creando registro de conteo de billetes para usuario: ${saveCashCountDto.usuarioId}`);
      
      // Crear el registro de conteo de billetes
      const billete = this.billetesRepository.create({
        usuarioId: Number(saveCashCountDto.usuarioId),
        // turnoId: validatedTurnoId,
        
        // Denominación de 500
        deno500: saveCashCountDto.deno500 !== undefined ? Number(saveCashCountDto.deno500) : null,
        cant500: saveCashCountDto.cant500 !== undefined ? Number(saveCashCountDto.cant500) : null,
        total500: saveCashCountDto.total500 !== undefined ? Number(saveCashCountDto.total500) : null,
        
        // Denominación de 200
        deno200: saveCashCountDto.deno200 !== undefined ? Number(saveCashCountDto.deno200) : null,
        cant200: saveCashCountDto.cant200 !== undefined ? Number(saveCashCountDto.cant200) : null,
        total200: saveCashCountDto.total200 !== undefined ? Number(saveCashCountDto.total200) : null,
        
        // Denominación de 100
        deno100: saveCashCountDto.deno100 !== undefined ? Number(saveCashCountDto.deno100) : null,
        cant100: saveCashCountDto.cant100 !== undefined ? Number(saveCashCountDto.cant100) : null,
        total100: saveCashCountDto.total100 !== undefined ? Number(saveCashCountDto.total100) : null,
        
        // Denominación de 50
        deno50: saveCashCountDto.deno50 !== undefined ? Number(saveCashCountDto.deno50) : null,
        cant50: saveCashCountDto.cant50 !== undefined ? Number(saveCashCountDto.cant50) : null,
        total50: saveCashCountDto.total50 !== undefined ? Number(saveCashCountDto.total50) : null,
        
        // Denominación de 20
        deno20: saveCashCountDto.deno20 !== undefined ? Number(saveCashCountDto.deno20) : null,
        cant20: saveCashCountDto.cant20 !== undefined ? Number(saveCashCountDto.cant20) : null,
        total20: saveCashCountDto.total20 !== undefined ? Number(saveCashCountDto.total20) : null,
        
        // Denominación de 10
        deno10: saveCashCountDto.deno10 !== undefined ? Number(saveCashCountDto.deno10) : null,
        cant10: saveCashCountDto.cant10 !== undefined ? Number(saveCashCountDto.cant10) : null,
        total10: saveCashCountDto.total10 !== undefined ? Number(saveCashCountDto.total10) : null,
        
        // Denominación de 5
        deno5: saveCashCountDto.deno5 !== undefined ? Number(saveCashCountDto.deno5) : null,
        cant5: saveCashCountDto.cant5 !== undefined ? Number(saveCashCountDto.cant5) : null,
        total5: saveCashCountDto.total5 !== undefined ? Number(saveCashCountDto.total5) : null,
        
        // Denominación de 2
        deno2: saveCashCountDto.deno2 !== undefined ? Number(saveCashCountDto.deno2) : null,
        cant2: saveCashCountDto.cant2 !== undefined ? Number(saveCashCountDto.cant2) : null,
        total2: saveCashCountDto.total2 !== undefined ? Number(saveCashCountDto.total2) : null,
        
        // Denominación de 1
        deno1: saveCashCountDto.deno1 !== undefined ? Number(saveCashCountDto.deno1) : null,
        cant1: saveCashCountDto.cant1 !== undefined ? Number(saveCashCountDto.cant1) : null,
        total1: saveCashCountDto.total1 !== undefined ? Number(saveCashCountDto.total1) : null,
        
        totalGeneral: Number(saveCashCountDto.totalGeneral),
        estado: saveCashCountDto.estado !== undefined ? Boolean(saveCashCountDto.estado) : true,
        fecha: new Date()
      });
      
      // Guardar el registro en la base de datos
      const savedBillete = await this.billetesRepository.save(billete as any) as unknown as Billete;
      this.logger.log(`[BILLETES_SERVICE] Guardado registro con ID: ${savedBillete.id}`);
      
      return savedBillete;
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al guardar conteo: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Billete[]> {
    try {
      this.logger.log('[BILLETES_SERVICE] Obteniendo todos los registros de conteo de billetes');
      const billetes = await this.billetesRepository.find({
        order: { fecha: 'DESC' },
        take: 100 // Limitar a los 100 registros más recientes para evitar problemas de rendimiento
      });
      this.logger.log(`[BILLETES_SERVICE] Se encontraron ${billetes.length} registros de conteo`);
      return billetes;
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al obtener todos los conteos: ${error.message}`, error.stack);
      throw error; // Propagar el error para que el controlador pueda manejarlo adecuadamente
    }
  }

  async findByTurno(turnoId: number): Promise<Billete[]> {
    try {
      // Validar que el turnoId sea un número válido
      if (isNaN(turnoId)) {
        this.logger.error(`[BILLETES_SERVICE] ID de turno inválido: ${turnoId}`);
        throw new Error(`ID de turno inválido: ${turnoId}`);
      }
      
      this.logger.log(`[BILLETES_SERVICE] Buscando conteos para el turno ID: ${turnoId}`);
      
      // NOTA: La columna turnoId no existe actualmente en la base de datos
      // Por ahora, devolvemos una lista vacía y registramos un mensaje informativo
      this.logger.warn(`[BILLETES_SERVICE] La columna turnoId no existe en la tabla tbl_conteo_billetes. Se requiere una migración.`);
      
      // Cuando se implemente la columna turnoId, se puede descomentar este código:
      /*
      const billetes = await this.billetesRepository.find({
        where: { turnoId },
        order: { fecha: 'DESC' }
      });
      return billetes;
      */
      
      return [];
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al buscar conteos para el turno ${turnoId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findLatestCount(): Promise<Billete[]> {
    try {
      this.logger.log('[BILLETES_SERVICE] Buscando el último conteo de billetes');
      
      // Verificar si hay registros en la tabla
      const count = await this.billetesRepository.count();
      if (count === 0) {
        this.logger.log('[BILLETES_SERVICE] No hay registros de conteo de billetes');
        return [];
      }
      
      // Obtener la fecha del último conteo usando una consulta más robusta
      const latestDate = await this.billetesRepository
        .createQueryBuilder('billete')
        .select('MAX(billete.fecha)', 'maxDate') // Corregido: fecha en lugar de fecha_registro
        .getRawOne();
      
      if (!latestDate || !latestDate.maxDate) {
        this.logger.log('[BILLETES_SERVICE] No se pudo determinar la fecha más reciente');
        return [];
      }
      
      this.logger.log(`[BILLETES_SERVICE] Fecha más reciente encontrada: ${latestDate.maxDate}`);
      
      // Obtener todos los billetes de esa fecha
      const billetes = await this.billetesRepository.find({
        order: { fecha: 'DESC' },
        take: 50 // Limitar a los 50 registros más recientes para evitar problemas de rendimiento
      });
      
      this.logger.log(`[BILLETES_SERVICE] Se encontraron ${billetes.length} registros de conteo`);
      
      // Filtrar por fecha más reciente (en caso de que la consulta anterior no funcione correctamente)
      if (billetes.length > 0) {
        const fechas = billetes.map(b => new Date(b.fecha).getTime());
        const maxFecha = Math.max(...fechas);
        
        const filteredBilletes = billetes.filter(b => new Date(b.fecha).getTime() === maxFecha);
        this.logger.log(`[BILLETES_SERVICE] Devolviendo ${filteredBilletes.length} registros con la fecha más reciente`);
        return filteredBilletes;
      }
      
      return [];
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al obtener el último conteo de billetes: ${error.message}`, error.stack);
      throw error; // Propagar el error para que el controlador pueda manejarlo adecuadamente
    }
  }

  async updateCashCount(id: number, saveCashCountDto: SaveCashCountDto): Promise<Billete> {
    try {
      this.logger.log(`[BILLETES_SERVICE] Actualizando conteo de efectivo con ID: ${id}`);
      
      // Verificar si el registro existe
      const existingBillete = await this.billetesRepository.findOne({ where: { id } });
      if (!existingBillete) {
        this.logger.error(`[BILLETES_SERVICE] No se encontró el conteo con ID: ${id}`);
        throw new Error(`No se encontró el conteo con ID: ${id}`);
      }
      
      // Validar usuarioId
      if (!saveCashCountDto.usuarioId || isNaN(Number(saveCashCountDto.usuarioId))) {
        this.logger.error(`[BILLETES_SERVICE] ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
        throw new Error(`ID de usuario inválido: ${saveCashCountDto.usuarioId}`);
      }
      
      // Crear objeto con los datos actualizados
      const updatedData: any = {
        id,
        usuarioId: Number(saveCashCountDto.usuarioId),
        
        // Denominación de 500
        deno500: saveCashCountDto.deno500 !== undefined ? Number(saveCashCountDto.deno500) : existingBillete.deno500,
        cant500: saveCashCountDto.cant500 !== undefined ? Number(saveCashCountDto.cant500) : existingBillete.cant500,
        total500: saveCashCountDto.total500 !== undefined ? Number(saveCashCountDto.total500) : existingBillete.total500,
        
        // Denominación de 200
        deno200: saveCashCountDto.deno200 !== undefined ? Number(saveCashCountDto.deno200) : existingBillete.deno200,
        cant200: saveCashCountDto.cant200 !== undefined ? Number(saveCashCountDto.cant200) : existingBillete.cant200,
        total200: saveCashCountDto.total200 !== undefined ? Number(saveCashCountDto.total200) : existingBillete.total200,
        
        // Denominación de 100
        deno100: saveCashCountDto.deno100 !== undefined ? Number(saveCashCountDto.deno100) : existingBillete.deno100,
        cant100: saveCashCountDto.cant100 !== undefined ? Number(saveCashCountDto.cant100) : existingBillete.cant100,
        total100: saveCashCountDto.total100 !== undefined ? Number(saveCashCountDto.total100) : existingBillete.total100,
        
        // Denominación de 50
        deno50: saveCashCountDto.deno50 !== undefined ? Number(saveCashCountDto.deno50) : existingBillete.deno50,
        cant50: saveCashCountDto.cant50 !== undefined ? Number(saveCashCountDto.cant50) : existingBillete.cant50,
        total50: saveCashCountDto.total50 !== undefined ? Number(saveCashCountDto.total50) : existingBillete.total50,
        
        // Denominación de 20
        deno20: saveCashCountDto.deno20 !== undefined ? Number(saveCashCountDto.deno20) : existingBillete.deno20,
        cant20: saveCashCountDto.cant20 !== undefined ? Number(saveCashCountDto.cant20) : existingBillete.cant20,
        total20: saveCashCountDto.total20 !== undefined ? Number(saveCashCountDto.total20) : existingBillete.total20,
        
        // Denominación de 10
        deno10: saveCashCountDto.deno10 !== undefined ? Number(saveCashCountDto.deno10) : existingBillete.deno10,
        cant10: saveCashCountDto.cant10 !== undefined ? Number(saveCashCountDto.cant10) : existingBillete.cant10,
        total10: saveCashCountDto.total10 !== undefined ? Number(saveCashCountDto.total10) : existingBillete.total10,
        
        // Denominación de 5
        deno5: saveCashCountDto.deno5 !== undefined ? Number(saveCashCountDto.deno5) : existingBillete.deno5,
        cant5: saveCashCountDto.cant5 !== undefined ? Number(saveCashCountDto.cant5) : existingBillete.cant5,
        total5: saveCashCountDto.total5 !== undefined ? Number(saveCashCountDto.total5) : existingBillete.total5,
        
        // Denominación de 2
        deno2: saveCashCountDto.deno2 !== undefined ? Number(saveCashCountDto.deno2) : existingBillete.deno2,
        cant2: saveCashCountDto.cant2 !== undefined ? Number(saveCashCountDto.cant2) : existingBillete.cant2,
        total2: saveCashCountDto.total2 !== undefined ? Number(saveCashCountDto.total2) : existingBillete.total2,
        
        // Denominación de 1
        deno1: saveCashCountDto.deno1 !== undefined ? Number(saveCashCountDto.deno1) : existingBillete.deno1,
        cant1: saveCashCountDto.cant1 !== undefined ? Number(saveCashCountDto.cant1) : existingBillete.cant1,
        total1: saveCashCountDto.total1 !== undefined ? Number(saveCashCountDto.total1) : existingBillete.total1,
        
        totalGeneral: Number(saveCashCountDto.totalGeneral),
        estado: saveCashCountDto.estado !== undefined ? Boolean(saveCashCountDto.estado) : existingBillete.estado,
        fecha: existingBillete.fecha // Mantener la fecha original
      };
      
      // Actualizar el registro
      await this.billetesRepository.update(id, updatedData);
      
      // Obtener el registro actualizado
      const updatedBillete = await this.billetesRepository.findOne({ where: { id } });
      if (!updatedBillete) {
        throw new Error(`Error al obtener el conteo actualizado con ID: ${id}`);
      }
      
      this.logger.log(`[BILLETES_SERVICE] Conteo actualizado correctamente: ID ${updatedBillete.id}`);
      return updatedBillete;
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al actualizar conteo: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteCashCount(id: number): Promise<boolean> {
    try {
      this.logger.log(`[BILLETES_SERVICE] Eliminando conteo de efectivo con ID: ${id}`);
      
      // Verificar si el registro existe
      const existingBillete = await this.billetesRepository.findOne({ where: { id } });
      if (!existingBillete) {
        this.logger.error(`[BILLETES_SERVICE] No se encontró el conteo con ID: ${id}`);
        throw new Error(`No se encontró el conteo con ID: ${id}`);
      }
      
      // Eliminar el registro
      const deleteResult = await this.billetesRepository.delete(id);
      
      if (deleteResult.affected === 0) {
        this.logger.error(`[BILLETES_SERVICE] No se pudo eliminar el conteo con ID: ${id}`);
        throw new Error(`No se pudo eliminar el conteo con ID: ${id}`);
      }
      
      this.logger.log(`[BILLETES_SERVICE] Conteo eliminado correctamente: ID ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al eliminar conteo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualiza el estado de todos los conteos de billetes asociados a un turno específico
   * @param turnoId ID del turno que se está finalizando
   * @returns Número de registros actualizados
   */
  async updateCashCountStatusByTurno(turnoId: number): Promise<number> {
    this.logger.log(`[BILLETES_SERVICE] Actualizando estado de conteos de billetes para el turno ${turnoId}`);
    
    try {
      // Validar que el turnoId sea un número válido
      if (!turnoId || isNaN(Number(turnoId)) || Number(turnoId) <= 0) {
        this.logger.error(`[BILLETES_SERVICE] ID de turno inválido: ${turnoId}`);
        throw new Error(`ID de turno inválido: ${turnoId}`);
      }
      
      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      this.logger.log(`[BILLETES_SERVICE] Fecha actual: ${formattedDate}, Turno ID: ${turnoId}`);
      
      // Identificar los IDs de los conteos que queremos actualizar usando una subconsulta con joins
      const cashCountIdsToUpdate = await this.billetesRepository
        .createQueryBuilder('billete')
        .select('billete.id')
        .innerJoin('tbl_usuarios_turnos', 'ut', 'billete.usuario_id = ut.usuario_id')
        .where('DATE(billete.fecha) = :fecha', { fecha: formattedDate })
        .andWhere('billete.estado = :estado', { estado: true }) // Solo los activos
        .andWhere('ut.turno_id = :turnoId', { turnoId })
        .getMany();
      
      // Si no hay conteos para actualizar, retornamos 0
      if (cashCountIdsToUpdate.length === 0) {
        this.logger.log(`[BILLETES_SERVICE] No se encontraron conteos de billetes para actualizar en el turno ${turnoId}`);
        return 0;
      }
      
      // Extraemos solo los IDs
      const ids = cashCountIdsToUpdate.map(b => b.id);
      
      this.logger.log(`[BILLETES_SERVICE] Conteos de billetes a actualizar: ${ids.length} con IDs: ${ids.join(', ')}`);
      
      // Actualizamos los conteos identificados
      const result = await this.billetesRepository
        .createQueryBuilder()
        .update(Billete)
        .set({ estado: false }) // false = inactivo
        .whereInIds(ids)
        .execute();
      
      this.logger.log(`[BILLETES_SERVICE] ${result.affected} conteos de billetes actualizados a inactivos para el turno ${turnoId}`);
      
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`[BILLETES_SERVICE] Error al actualizar conteos de billetes: ${error.message}`);
      throw new Error(`Error al actualizar el estado de los conteos de billetes: ${error.message}`);
    }
  }
}
