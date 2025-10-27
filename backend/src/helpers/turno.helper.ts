import { Repository } from 'typeorm';
import { UsuarioTurno } from '../modules/turnos/entities/usuario-turno.entity';

/**
 * Helper para obtener el número de caja del turno activo de un usuario
 * Retorna null si no hay turno activo o si el turno no tiene caja asignada
 */
export async function obtenerCajaNumeroDelTurno(
  usuarioTurnoRepository: Repository<UsuarioTurno>,
  userId: number
): Promise<number | null> {
  const turnoActivo = await usuarioTurnoRepository.findOne({
    where: { usuarioId: userId, activo: true }
  });
  
  return turnoActivo?.cajaNumero || null;
}
