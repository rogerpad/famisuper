import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceFlow } from './entities/balance-flow.entity';
import { CreateBalanceFlowDto } from './dto/create-balance-flow.dto';
import { UpdateBalanceFlowDto } from './dto/update-balance-flow.dto';
import { LoggerService } from '../../common/services/logger.service';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

@Injectable()
export class BalanceFlowsService {
  constructor(
    @InjectRepository(BalanceFlow)
    private balanceFlowsRepository: Repository<BalanceFlow>,
    @InjectRepository(UsuarioTurno)
    private usuarioTurnoRepository: Repository<UsuarioTurno>,
    private readonly logger: LoggerService
  ) {}

  async create(createBalanceFlowDto: CreateBalanceFlowDto, userId?: number): Promise<BalanceFlow> {
    // Asegurar que la fecha se procese correctamente
    if (createBalanceFlowDto.fecha) {
      console.log('Fecha original en create:', createBalanceFlowDto.fecha);
      createBalanceFlowDto.fecha = new Date(createBalanceFlowDto.fecha);
      console.log('Fecha convertida en create:', createBalanceFlowDto.fecha);
    }
    
    // Obtener cajaNumero del turno activo si se proporciona userId
    let cajaNumero: number | null = null;
    if (userId) {
      const turnoActivo = await this.usuarioTurnoRepository.findOne({
        where: { usuarioId: userId, activo: true }
      });
      cajaNumero = turnoActivo?.cajaNumero || null;
      console.log('[BalanceFlowsService] Caja del turno activo:', cajaNumero);
    }
    
    const balanceFlow = this.balanceFlowsRepository.create({
      ...createBalanceFlowDto,
      cajaNumero  // Asignar caja del turno activo
    });
    return this.balanceFlowsRepository.save(balanceFlow);
  }

  async findAll(activo?: boolean): Promise<BalanceFlow[]> {
    const whereCondition: any = {};
    if (activo !== undefined) {
      whereCondition.activo = activo;
    }

    return this.balanceFlowsRepository.find({
      where: whereCondition,
      relations: ['telefonica'],
      order: { fecha: 'DESC' },
    });
  }

  async findActive(): Promise<BalanceFlow[]> {
    return this.balanceFlowsRepository.find({
      where: { activo: true },
      relations: ['telefonica'],
      order: { fecha: 'DESC' },
    });
  }

  async findByPhoneLine(telefonicaId: number): Promise<BalanceFlow[]> {
    return this.balanceFlowsRepository.find({
      where: { telefonicaId },
      relations: ['telefonica'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BalanceFlow> {
    const balanceFlow = await this.balanceFlowsRepository.findOne({
      where: { id },
      relations: ['telefonica'],
    });
    
    if (!balanceFlow) {
      throw new NotFoundException(`Flujo de saldo con ID ${id} no encontrado`);
    }
    
    return balanceFlow;
  }

  async update(id: number, updateBalanceFlowDto: UpdateBalanceFlowDto): Promise<BalanceFlow> {
    console.log('Datos recibidos para actualizar (raw):', JSON.stringify(updateBalanceFlowDto));
    
    // Buscar el flujo de saldo existente
    const balanceFlow = await this.findOne(id);
    
    // Crear un objeto limpio para la actualización
    const cleanDto: Partial<BalanceFlow> = {};
    
    // Procesar cada campo individualmente para asegurar la conversión de tipos
    if (updateBalanceFlowDto.nombre !== undefined) {
      cleanDto.nombre = String(updateBalanceFlowDto.nombre).trim();
    }
    
    // Procesar telefonicaId explícitamente para asegurar que se actualice
    if (updateBalanceFlowDto.telefonicaId !== undefined) {
      const telefonicaId = parseInt(String(updateBalanceFlowDto.telefonicaId).trim());
      console.log('Procesando telefonicaId:', telefonicaId);
      cleanDto.telefonicaId = telefonicaId || 0;
    }
    
    // Procesar campos numéricos
    if (updateBalanceFlowDto.saldoInicial !== undefined) {
      cleanDto.saldoInicial = parseFloat(String(updateBalanceFlowDto.saldoInicial).trim()) || 0;
    }
    
    if (updateBalanceFlowDto.saldoComprado !== undefined) {
      cleanDto.saldoComprado = parseFloat(String(updateBalanceFlowDto.saldoComprado).trim()) || 0;
    }
    
    if (updateBalanceFlowDto.saldoVendido !== undefined) {
      cleanDto.saldoVendido = parseFloat(String(updateBalanceFlowDto.saldoVendido).trim()) || 0;
    }
    
    if (updateBalanceFlowDto.saldoFinal !== undefined) {
      cleanDto.saldoFinal = parseFloat(String(updateBalanceFlowDto.saldoFinal).trim()) || 0;
    }
    
    // Procesar campo booleano
    if (updateBalanceFlowDto.activo !== undefined) {
      cleanDto.activo = Boolean(updateBalanceFlowDto.activo);
    }
    
    // Asegurar que la fecha se procese correctamente
    if (updateBalanceFlowDto.fecha) {
      console.log('Fecha original en update:', updateBalanceFlowDto.fecha);
      // Intentar convertir la fecha a un objeto Date válido
      try {
        cleanDto.fecha = new Date(updateBalanceFlowDto.fecha);
        console.log('Fecha convertida en update:', cleanDto.fecha);
      } catch (error) {
        console.error('Error al convertir fecha:', error);
        // Si hay error, no incluir la fecha en la actualización
      }
    }
    
    console.log('DTO limpio para actualizar:', JSON.stringify(cleanDto));
    
    // Usar queryBuilder para actualizar directamente en la base de datos
    // Esto evita problemas con campos que no se actualizan correctamente
    await this.balanceFlowsRepository
      .createQueryBuilder()
      .update(BalanceFlow)
      .set(cleanDto)
      .where("id = :id", { id })
      .execute();
    
    // Devolver el objeto actualizado
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const balanceFlow = await this.findOne(id);
    await this.balanceFlowsRepository.remove(balanceFlow);
  }

  async getSumSaldoVendidoActivos(cajaNumero?: number): Promise<number> {
    console.log(`[BalanceFlowsService] Calculando suma de saldo vendido - Caja: ${cajaNumero || 'Todas'}`);
    
    // Obtener la suma de saldo_vendido de todos los registros activos (filtrado por caja)
    const queryBuilder = this.balanceFlowsRepository
      .createQueryBuilder('balanceFlow')
      .select('SUM(balanceFlow.saldoVendido)', 'total')
      .where('balanceFlow.activo = :activo', { activo: true });
    
    // Si se proporciona cajaNumero, filtrar por esa caja específica
    if (cajaNumero) {
      queryBuilder.andWhere('balanceFlow.cajaNumero = :cajaNumero', { cajaNumero });
    }
    
    const result = await queryBuilder.getRawOne();
    
    // Convertir el resultado a número y manejar el caso de null/undefined
    const total = result?.total ? parseFloat(result.total) : 0;
    console.log(`[BalanceFlowsService] Suma de saldo vendido obtenida: ${total}`);
    return total;
  }
  
  /**
   * Recalcula los saldos vendidos y finales para todos los flujos de saldo activos
   * basado en las ventas de saldo registradas en tbl_ventas_saldo
   */
  async recalcularSaldosVendidos(): Promise<{ actualizados: number, errores: number }> {
    this.logger.log('Iniciando recálculo de saldos vendidos para todos los flujos activos', 'BalanceFlowsService');
    
    let actualizados = 0;
    let errores = 0;
    
    try {
      // 1. Obtener todos los flujos de saldo activos
      const flujosActivos = await this.balanceFlowsRepository.find({
        where: { activo: true }
      });
      
      this.logger.log(`Se encontraron ${flujosActivos.length} flujos activos para recalcular`, 'BalanceFlowsService');
      
      // 2. Para cada flujo, recalcular su saldo vendido y saldo final
      for (const flujo of flujosActivos) {
        try {
          // 2.0 Verificar si es un flujo "Flujo Claro" y omitirlo
          if (flujo.nombre && flujo.nombre.toLowerCase().includes('flujo claro')) {
            this.logger.log(`Omitiendo recálculo para flujo "${flujo.nombre}" (ID: ${flujo.id})`, 'BalanceFlowsService');
            continue; // Saltar este flujo y continuar con el siguiente
          }
          
          // 2.1 Obtener la suma de montos de ventas activas para este flujo
          this.logger.log(`Consultando ventas para flujo ID ${flujo.id}`, 'BalanceFlowsService');
          
          // Primero verificamos si hay ventas para este flujo
          const ventasCount = await this.balanceFlowsRepository.query(
            `SELECT COUNT(*) as total 
             FROM tbl_ventas_saldo vs 
             WHERE vs.flujo_saldo_id = $1`,
            [flujo.id]
          );
          
          this.logger.log(`Total de ventas encontradas para flujo ID ${flujo.id}: ${ventasCount[0]?.total || 0}`, 'BalanceFlowsService');
          
          // Ahora obtenemos la suma de montos de ventas activas
          const resultadoVentas = await this.balanceFlowsRepository.query(
            `SELECT SUM(vs.monto) as total_vendido 
             FROM tbl_ventas_saldo vs 
             WHERE vs.flujo_saldo_id = $1 AND vs.activo = true`,
            [flujo.id]
          );
          
          this.logger.log(`Resultado consulta ventas: ${JSON.stringify(resultadoVentas)}`, 'BalanceFlowsService');
          
          // 2.2 Extraer el total vendido del resultado (o 0 si no hay ventas)
          const totalVendido = resultadoVentas[0]?.total_vendido 
            ? parseFloat(resultadoVentas[0].total_vendido) 
            : 0;
            
          this.logger.log(`Total vendido calculado para flujo ID ${flujo.id}: ${totalVendido}`, 'BalanceFlowsService');
          
          // 2.3 Verificar si es un flujo Tigo para aplicar el cálculo especial
          // Obtenemos la información de la telefónica
          const telefonica = await this.balanceFlowsRepository.query(
            `SELECT nombre FROM tbl_lineas_telefonicas WHERE id = $1`,
            [flujo.telefonicaId]
          );
          
          const nombreTelefonica = telefonica[0]?.nombre || '';
          const esTigo = nombreTelefonica.toLowerCase().includes('tigo');
          
          // 2.4 Calcular el nuevo saldo final
          // Para flujos Tigo: saldo_final = saldo_inicial + saldo_comprado + (saldo_comprado * 0.055) - saldo_vendido
          // Para otros flujos: saldo_final = saldo_inicial + saldo_comprado - saldo_vendido
          let saldoCompradoAjustado = Number(flujo.saldoComprado);
          
          if (esTigo) {
            const bonificacionTigo = saldoCompradoAjustado * 0.055;
            saldoCompradoAjustado += bonificacionTigo;
            this.logger.log(
              `Flujo Tigo ID ${flujo.id}: Aplicando bonificación del 5.5% (${bonificacionTigo.toFixed(2)})`,
              'BalanceFlowsService'
            );
          }
          
          const nuevoSaldoFinal = Number(flujo.saldoInicial) + saldoCompradoAjustado - Number(totalVendido);
          
          this.logger.log(
            `Flujo ID ${flujo.id}: saldoInicial=${flujo.saldoInicial}, saldoComprado=${flujo.saldoComprado}, ` +
            `${esTigo ? 'saldoCompradoAjustado=' + saldoCompradoAjustado.toFixed(2) + ', ' : ''}` +
            `totalVendido=${totalVendido}, nuevoSaldoFinal=${nuevoSaldoFinal}`,
            'BalanceFlowsService'
          );
          
          // 2.5 Actualizar el flujo de saldo con los nuevos valores
          await this.balanceFlowsRepository
            .createQueryBuilder()
            .update(BalanceFlow)
            .set({
              saldoVendido: totalVendido,
              saldoFinal: nuevoSaldoFinal
            })
            .where('id = :id', { id: flujo.id })
            .execute();
          
          actualizados++;
          this.logger.log(`Flujo ID ${flujo.id} actualizado correctamente`, 'BalanceFlowsService');
        } catch (error) {
          errores++;
          this.logger.error(
            `Error al recalcular saldo para flujo ID ${flujo.id}: ${error.message}`,
            error.stack,
            'BalanceFlowsService'
          );
        }
      }
      
      this.logger.log(
        `Recálculo de saldos completado. Actualizados: ${actualizados}, Errores: ${errores}`,
        'BalanceFlowsService'
      );
      
      return { actualizados, errores };
    } catch (error) {
      this.logger.error(
        `Error general en recálculo de saldos: ${error.message}`,
        error.stack,
        'BalanceFlowsService'
      );
      throw error;
    }
  }

  /**
   * Obtener el saldo final del último flujo inactivo
   * Filtrado por: telefonica_id, caja_numero, activo = false
   * Para pre-cargar el saldo inicial en el nuevo flujo
   */
  async getLastInactiveSaldoFinal(telefonicaId: number, cajaNumero: number): Promise<{ saldoFinal: number } | null> {
    console.log('[BalanceFlowsService] Buscando último saldo final - telefonicaId:', telefonicaId, 'cajaNumero:', cajaNumero);
    
    const lastFlow = await this.balanceFlowsRepository.findOne({
      where: {
        telefonicaId,
        cajaNumero,
        activo: false
      },
      order: {
        fecha: 'DESC'
      }
    });

    if (!lastFlow) {
      console.log('[BalanceFlowsService] No se encontró flujo inactivo previo');
      return null;
    }

    console.log('[BalanceFlowsService] Flujo inactivo encontrado - ID:', lastFlow.id, 'Saldo Final:', lastFlow.saldoFinal);
    return { saldoFinal: lastFlow.saldoFinal };
  }
}
