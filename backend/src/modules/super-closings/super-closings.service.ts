import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { SuperClosing } from './entities/super-closing.entity';
import { CreateSuperClosingDto, UpdateSuperClosingDto } from './dto';
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

@Injectable()
export class SuperClosingsService {
  constructor(
    @InjectRepository(SuperClosing)
    private superClosingsRepository: Repository<SuperClosing>,
    @InjectRepository(UsuarioTurno)
    private usuarioTurnoRepository: Repository<UsuarioTurno>,
  ) {}

  async create(createSuperClosingDto: CreateSuperClosingDto): Promise<SuperClosing> {
    // Obtener el turno activo del usuario para obtener cajaNumero y usuarioTurnoId
    const turnoActivo = await this.usuarioTurnoRepository.findOne({
      where: { usuarioId: createSuperClosingDto.usuarioId, activo: true }
    });
    
    if (!turnoActivo) {
      throw new NotFoundException('No se encontró turno activo para el usuario');
    }
    
    const cajaNumero = turnoActivo.cajaNumero || null;
    const usuarioTurnoId = turnoActivo.id;
    
    console.log('[SuperClosingsService] Datos del turno activo:');
    console.log(`  - Usuario-Turno ID: ${usuarioTurnoId}`);
    console.log(`  - Caja: ${cajaNumero}`);
    console.log(`  - Usuario: ${turnoActivo.usuarioId}`);
    
    if (!cajaNumero) {
      throw new NotFoundException('El turno activo no tiene caja asignada');
    }
    
    // 1. Crear el cierre
    const superClosing = this.superClosingsRepository.create({
      ...createSuperClosingDto,
      fechaCierre: createSuperClosingDto.fechaCierre || new Date(),
      cajaNumero,        // Asignar caja del turno activo
      usuarioTurnoId     // Asignar ID del registro usuario-turno que genera el cierre
    });
    const cierreGuardado = await this.superClosingsRepository.save(superClosing);
    
    console.log(`[SuperClosingsService] ✅ Cierre creado con ID: ${cierreGuardado.id} (Usuario-Turno: ${usuarioTurnoId})`);
    
    // 2. Asociar todos los registros pendientes de esta caja al cierre
    await this.asociarRegistrosAlCierre(cierreGuardado.id, cajaNumero, usuarioTurnoId);
    
    return cierreGuardado;
  }

  /**
   * Asocia todos los registros pendientes de una caja específica al cierre recién creado
   * Solo actualiza registros que:
   * - Pertenecen a la misma caja (caja_numero)
   * - No tienen cierre asignado (cierre_id IS NULL)
   * - Fueron creados durante el turno actual
   */
  private async asociarRegistrosAlCierre(
    cierreId: number, 
    cajaNumero: number,
    usuarioTurnoId: number
  ): Promise<void> {
    console.log(`\n[SuperClosingsService] 🔄 Asociando registros al cierre ${cierreId}...`);
    
    const tablas = [
      'tbl_egresos_super',           // Egresos
      'tbl_conteo_billetes_super',   // Conteo de billetes
      'tbl_flujos_saldo',            // Flujos de saldo
      'tbl_ventas_saldo',            // Ventas de saldo
      'tbl_adic_prest'               // Adicionales y préstamos
    ];

    let totalActualizados = 0;

    for (const tabla of tablas) {
      try {
        // Actualizar registros que:
        // 1. Pertenecen a esta caja (caja_numero = X)
        // 2. No tienen cierre asignado (cierre_id IS NULL)
        const result = await this.superClosingsRepository.query(`
          UPDATE ${tabla} 
          SET cierre_id = $1 
          WHERE caja_numero = $2 
            AND cierre_id IS NULL
        `, [cierreId, cajaNumero]);
        
        const registrosActualizados = result[1] || 0; // result[1] contiene el número de filas afectadas
        totalActualizados += registrosActualizados;
        
        if (registrosActualizados > 0) {
          console.log(`  ✅ ${tabla}: ${registrosActualizados} registros asociados`);
        } else {
          console.log(`  ℹ️  ${tabla}: 0 registros pendientes`);
        }
      } catch (error) {
        console.error(`  ❌ Error actualizando ${tabla}:`, error.message);
        // Continuamos con las demás tablas aunque una falle
      }
    }

    console.log(`\n[SuperClosingsService] ✅ Total: ${totalActualizados} registros asociados al cierre ${cierreId}`);
  }

  async findAll(): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SuperClosing> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`Invalid ID: ${id}`);
    }
    
    const superClosing = await this.superClosingsRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    
    if (!superClosing) {
      throw new NotFoundException(`Super Closing with ID ${id} not found`);
    }
    
    return superClosing;
  }

  async update(id: number, updateSuperClosingDto: UpdateSuperClosingDto): Promise<SuperClosing> {
    const superClosing = await this.findOne(id);
    
    Object.assign(superClosing, updateSuperClosingDto);
    
    return this.superClosingsRepository.save(superClosing);
  }

  async remove(id: number): Promise<void> {
    const superClosing = await this.findOne(id);
    await this.superClosingsRepository.remove(superClosing);
  }

  async findByUsuario(usuarioId: number): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      where: { usuarioId },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findByFecha(fechaInicio: Date, fechaFin: Date): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      where: {
        fechaCierre: Between(fechaInicio, fechaFin),
      },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async findActivos(): Promise<SuperClosing[]> {
    return this.superClosingsRepository.find({
      where: { activo: true },
      relations: ['usuario'],
      order: { fechaCierre: 'DESC' },
    });
  }

  async getUltimoCierreInactivoDelDia(): Promise<{ efectivoCierreTurno: number } | null> {
    try {
      console.log(`[SUPER_CLOSINGS_SERVICE] Starting search for last inactive closing of the day`);
      
      const ultimoCierre = await this.superClosingsRepository.findOne({
        where: {
          activo: false,
        },
        order: { fechaCierre: 'DESC' },
      });

      console.log(`[SUPER_CLOSINGS_SERVICE] Last inactive closing found:`, ultimoCierre);

      if (ultimoCierre) {
        const result = { efectivoCierreTurno: Number(ultimoCierre.efectivoCierreTurno) || 0 };
        console.log(`[SUPER_CLOSINGS_SERVICE] Returning:`, result);
        return result;
      }

      console.log(`[SUPER_CLOSINGS_SERVICE] No inactive closing found`);
      return null;
    } catch (error) {
      console.error(`[SUPER_CLOSINGS_SERVICE] Error getting last inactive closing:`, error);
      console.error(`[SUPER_CLOSINGS_SERVICE] Stack trace:`, error.stack);
      throw error;
    }
  }
}
