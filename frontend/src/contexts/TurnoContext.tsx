import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import turnosApi, { Turno } from '../api/turnos/turnosApi';
import usuariosTurnosApi, { UsuarioTurno } from '../api/turnos/usuarios-turnos';
import { useAuth } from './AuthContext';
import { isValidId, toValidId } from '../utils/validationUtils';

// Usamos la interfaz Turno importada de turnosApi

interface TurnoContextType {
  turnoActual: Turno | null;
  turnosActivos: UsuarioTurno[];
  loading: boolean;
  error: string | null;
  refetchTurno: () => void;
  notificacionVisible: boolean;
  tiempoRestante: number;
  cerrarNotificacion: () => void;
  tieneTurnoActivo: boolean;
  operacionActiva: 'agente' | 'super' | null;
  setOperacionActiva: (operacion: 'agente' | 'super' | null) => void;
}

const TurnoContext = createContext<TurnoContextType>({
  turnoActual: null,
  turnosActivos: [],
  loading: false,
  error: null,
  refetchTurno: () => {},
  notificacionVisible: false,
  tiempoRestante: 0,
  cerrarNotificacion: () => {},
  tieneTurnoActivo: false,
  operacionActiva: null,
  setOperacionActiva: () => {}
});

export const useTurno = () => useContext(TurnoContext);

export const TurnoProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null);
  const [turnosActivos, setTurnosActivos] = useState<UsuarioTurno[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notificacionVisible, setNotificacionVisible] = useState<boolean>(false);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [tieneTurnoActivo, setTieneTurnoActivo] = useState<boolean>(false);
  const [operacionActiva, setOperacionActiva] = useState<'agente' | 'super' | null>(() => {
    // Recuperar la operación activa del localStorage al inicializar
    const savedOperacion = localStorage.getItem('operacionActiva');
    return savedOperacion as 'agente' | 'super' | null;
  });

  // Función para cerrar la notificación
  const cerrarNotificacion = () => {
    setNotificacionVisible(false);
  };

  // Función para verificar si el turno está por terminar
  const verificarFinTurno = () => {
    // Verificar que turnoActual exista y tenga horaFin
    if (!turnoActual || !turnoActual.horaFin) {
      setNotificacionVisible(false);
      return;
    }

    try {
      const horaActual = new Date();
      const [horaFin, minutoFin] = turnoActual.horaFin.split(':').map(Number);
      
      // Crear fecha con la hora de fin del turno
      const fechaFin = new Date();
      fechaFin.setHours(horaFin, minutoFin, 0, 0);
      
      // Calcular minutos restantes hasta el fin del turno
      const minutosRestantes = Math.floor((fechaFin.getTime() - horaActual.getTime()) / (1000 * 60));
      
      // Si faltan 30 minutos o menos para el fin del turno, mostrar notificación
      if (minutosRestantes <= 30 && minutosRestantes > 0) {
        setTiempoRestante(minutosRestantes);
        setNotificacionVisible(true);
      } else {
        setNotificacionVisible(false);
      }
    } catch (err) {
      console.error('Error al verificar fin de turno:', err);
      setNotificacionVisible(false);
    }
  };

  const { state: authState } = useAuth();

  const fetchTurnoActual = async () => {
    // Verificar si hay un token válido antes de hacer la petición
    const token = localStorage.getItem('token');
    if (!token) {
      // Si no hay token, no hacemos la petición para evitar errores 401
      setTurnoActual(null);
      setTurnosActivos([]);
      setTieneTurnoActivo(false);
      setLoading(false);
      return;
    }
    
    // Verificar si estamos en la página de login
    if (window.location.pathname.includes('/login')) {
      // No hacemos peticiones en la página de login
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Obtener los turnos activos del usuario usando la nueva tabla tbl_usuarios_turnos
      if (authState.user?.id) {
        try {
          const usuarioTurnos = await usuariosTurnosApi.getTurnosActivosPorUsuario(authState.user.id);
          console.log(`[TURNO_CONTEXT] Turnos activos encontrados para el usuario: ${usuarioTurnos.length}`);
          // Usar el operador de propagación para crear un nuevo array y evitar problemas de tipo
          setTurnosActivos([...usuarioTurnos]);
          setTieneTurnoActivo(usuarioTurnos.length > 0);
          
          // Si hay turnos activos, detectar automáticamente la operación activa
          if (usuarioTurnos.length > 0) {
            const usuarioTurno = usuarioTurnos[0];
            
            // Detectar operación activa basándose en los campos agente/super
            let operacionDetectada: 'agente' | 'super' | null = null;
            if (usuarioTurno.agente) {
              operacionDetectada = 'agente';
            } else if (usuarioTurno.super) {
              operacionDetectada = 'super';
            }
            
            // Solo actualizar si hay una operación detectada y es diferente a la actual
            if (operacionDetectada && operacionDetectada !== operacionActiva) {
              console.log(`[TURNO_CONTEXT] Operación activa detectada desde BD: ${operacionDetectada}`);
              setOperacionActiva(operacionDetectada);
              localStorage.setItem('operacionActiva', operacionDetectada);
            }
            
            // Obtener el detalle del turno
            if (usuarioTurno.turnoId) {
              try {
                const turnoDetalle = await turnosApi.getById(usuarioTurno.turnoId);
                setTurnoActual(turnoDetalle);
                console.log(`[TURNO_CONTEXT] Turno actual establecido desde usuario-turno: ${turnoDetalle.id}`);
              } catch (detailError) {
                console.error('[TURNO_CONTEXT] Error al obtener detalle del turno:', detailError);
              }
            }
          } else {
            // Si no hay turnos activos, limpiar la operación activa
            if (operacionActiva) {
              console.log('[TURNO_CONTEXT] No hay turnos activos, limpiando operación activa');
              setOperacionActiva(null);
              localStorage.removeItem('operacionActiva');
            }
          }
        } catch (turnosActivosError) {
          console.error('[TURNO_CONTEXT] Error al obtener turnos activos:', turnosActivosError);
        }
      }
      
      // Si no se encontraron turnos activos en tbl_usuarios_turnos, usar el método anterior
      if (turnosActivos.length === 0) {
        // Si el usuario tiene un turno asignado, lo usamos
        if (authState.user?.turno) {
          // Validar que el turno tenga un ID válido
          const turno = authState.user.turno;
          
          if (isValidId(turno.id)) {
            console.log(`[TURNO_CONTEXT] Usuario tiene turno asignado con ID válido: ${turno.id}`);
            setTurnoActual(turno);
          } else {
            console.error(`[TURNO_CONTEXT] Usuario tiene turno con ID inválido: ${turno.id}`);
            // Intentar corregir el ID si es posible
            const validId = toValidId(turno.id);
            if (validId) {
              turno.id = validId;
              setTurnoActual(turno);
              console.log(`[TURNO_CONTEXT] ID de turno corregido a: ${validId}`);
            } else {
              // Si no se puede corregir, buscar un turno activo
              console.log(`[TURNO_CONTEXT] Buscando turno activo alternativo...`);
              await buscarTurnoActivo();
            }
          }
        } else {
          // Si no tiene turno asignado, buscamos cualquier turno activo
          await buscarTurnoActivo();
        }
      }
    } catch (err: any) {
      // Evitamos mostrar errores 401 en la consola
      if (err?.response?.status === 401) {
        // Silenciosamente manejamos el error de autenticación
        setTurnoActual(null);
        setTurnosActivos([]);
        setTieneTurnoActivo(false);
      } else {
        console.error('[TURNO_CONTEXT] Error al obtener el turno actual:', err);
        setError('No se pudo obtener el turno actual');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Función auxiliar para buscar un turno activo
  const buscarTurnoActivo = async () => {
    try {
      const turnos = await turnosApi.getAll();
      
      // Filtrar turnos con IDs válidos
      const turnosValidos = turnos.filter(turno => isValidId(turno.id));
      
      if (turnosValidos.length === 0) {
        console.warn('[TURNO_CONTEXT] No se encontraron turnos con IDs válidos');
      }
      
      // Buscamos el primer turno que esté activo y tenga ID válido
      const turnoActivo = turnosValidos.find(turno => turno.activo === true);
      
      if (turnoActivo) {
        console.log(`[TURNO_CONTEXT] Turno activo encontrado con ID: ${turnoActivo.id}`);
        setTurnoActual(turnoActivo);
      } else {
        // Si no hay ningún turno activo
        console.log('[TURNO_CONTEXT] No hay turnos activos disponibles');
        setTurnoActual(null);
      }
    } catch (error) {
      console.error('[TURNO_CONTEXT] Error al buscar turno activo:', error);
      setTurnoActual(null);
    }
  };

  // Efecto para cargar el turno inicial y configurar intervalos
  useEffect(() => {
    // Carga inicial del turno
    fetchTurnoActual();
    
    // Verificar el turno cada 5 minutos en lugar de cada minuto
    // Esto reduce significativamente las peticiones al servidor
    const intervalTurno = setInterval(fetchTurnoActual, 5 * 60000);
    
    // Verificar fin de turno cada 5 minutos
    const intervalNotificacion = setInterval(verificarFinTurno, 5 * 60000);
    
    // Verificar inmediatamente si estamos cerca del fin de turno
    verificarFinTurno();
    
    return () => {
      clearInterval(intervalTurno);
      clearInterval(intervalNotificacion);
    };
  }, []);

  // Efecto para actualizar la verificación de fin de turno cuando cambia el turno actual
  useEffect(() => {
    if (turnoActual) {
      verificarFinTurno();
    }
  }, [turnoActual]);

  return (
    <>
      <TurnoContext.Provider 
        value={{ 
          turnoActual, 
          turnosActivos,
          loading, 
          error, 
          refetchTurno: fetchTurnoActual,
          notificacionVisible,
          tiempoRestante,
          cerrarNotificacion,
          tieneTurnoActivo,
          operacionActiva,
          setOperacionActiva: (operacion: 'agente' | 'super' | null) => {
            setOperacionActiva(operacion);
            // Persistir en localStorage
            if (operacion) {
              localStorage.setItem('operacionActiva', operacion);
            } else {
              localStorage.removeItem('operacionActiva');
            }
          }
        }}
      >
        {children}
      </TurnoContext.Provider>
      
      {/* Notificación de fin de turno */}
      <Snackbar 
        open={notificacionVisible} 
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={cerrarNotificacion} 
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {`¡Atención! Tu turno finalizará en ${tiempoRestante} minutos.`}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TurnoProvider;
