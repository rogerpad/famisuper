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
  // FUNCIONES OBSOLETAS - Ya no se usan
  // obtenerTurnoActual?: () => void;
  // refetchTurnoActual?: () => void;
  // limpiarTurnoActual?: () => void;
  // buscarTurnoActivo?: () => void;
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
  console.log('[TURNO_CONTEXT] TurnoProvider inicializando...');
  
  const [turnoActual, setTurnoActual] = useState<Turno | null>(() => {
    // Recuperar turno del localStorage al inicializar
    const savedTurno = localStorage.getItem('turnoActual');
    console.log('[TURNO_CONTEXT] Verificando localStorage al inicializar:', savedTurno);
    if (savedTurno) {
      try {
        const parsed = JSON.parse(savedTurno);
        console.log('[TURNO_CONTEXT] Turno recuperado del localStorage:', parsed);
        return parsed;
      } catch (error) {
        console.error('[TURNO_CONTEXT] Error al parsear turno del localStorage:', error);
        localStorage.removeItem('turnoActual');
      }
    }
    console.log('[TURNO_CONTEXT] No hay turno en localStorage, iniciando como null');
    return null;
  });
  const [turnosActivos, setTurnosActivos] = useState<UsuarioTurno[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notificacionVisible, setNotificacionVisible] = useState<boolean>(false);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [tieneTurnoActivo, setTieneTurnoActivo] = useState<boolean>(() => {
    // Inicializar basándose en si hay turno en localStorage
    const savedTurno = localStorage.getItem('turnoActual');
    return savedTurno !== null;
  });
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
  console.log('[TURNO_CONTEXT] AuthState obtenido:', authState);

  const fetchTurnoActual = async () => {
    console.log('[TURNO_CONTEXT] fetchTurnoActual iniciado');
    console.log('[TURNO_CONTEXT] authState:', authState);
    console.log('[TURNO_CONTEXT] window.location.pathname:', window.location.pathname);
    
    // Verificar si estamos en la página de login
    if (window.location.pathname.includes('/login')) {
      // No hacemos peticiones en la página de login
      console.log('[TURNO_CONTEXT] En página de login, saltando consulta');
      setLoading(false);
      return;
    }
    
    // Verificar si hay usuario autenticado
    if (!authState.user?.id) {
      console.log('[TURNO_CONTEXT] No hay usuario autenticado, saltando consulta');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Obtener los turnos activos del usuario usando la nueva tabla tbl_usuarios_turnos
      if (authState.user?.id) {
        console.log(`[TURNO_CONTEXT] Iniciando consulta para usuario ID: ${authState.user.id}`);
        try {
          const usuarioTurnos = await usuariosTurnosApi.getTurnosActivosPorUsuario(authState.user.id);
          console.log(`[TURNO_CONTEXT] Turnos activos encontrados para el usuario: ${usuarioTurnos.length}`);
          console.log(`[TURNO_CONTEXT] Datos completos del usuario turno:`, usuarioTurnos);
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
            
            // Crear el objeto turno real usando los datos de tbl_usuarios_turnos
            const turnoReal: Turno = {
              id: usuarioTurno.turno?.id || 0,
              nombre: usuarioTurno.turno?.nombre || 'Turno Desconocido',
              horaInicio: usuarioTurno.horaInicioReal || '00:00:00',
              horaFin: usuarioTurno.horaFinReal || null,
              activo: usuarioTurno.activo,
              fechaAsignacion: usuarioTurno.fechaAsignacion,
              // Datos adicionales del usuario turno
              usuarioTurnoId: usuarioTurno.id,
              usuarioId: usuarioTurno.usuarioId,
              agente: usuarioTurno.agente,
              super: usuarioTurno.super
            };
            
            console.log(`[TURNO_CONTEXT] Antes de setTurnoActual - turnoActual actual:`, turnoActual);
            setTurnoActual(turnoReal);
            // Persistir turno en localStorage
            localStorage.setItem('turnoActual', JSON.stringify(turnoReal));
            console.log(`[TURNO_CONTEXT] Turno real creado y guardado en localStorage:`, turnoReal);
            console.log(`[TURNO_CONTEXT] Verificando localStorage después de guardar:`, localStorage.getItem('turnoActual'));
            console.log(`[TURNO_CONTEXT] Hora inicio real:`, usuarioTurno.horaInicioReal);
          } else {
            // Si no hay turnos activos, limpiar la operación activa
            if (operacionActiva) {
              console.log('[TURNO_CONTEXT] No hay turnos activos, limpiando operación activa');
              setOperacionActiva(null);
              localStorage.removeItem('operacionActiva');
            }
            // También limpiar turnoActual si no hay turnos activos
            console.log('[TURNO_CONTEXT] No hay turnos activos, limpiando turnoActual');
            setTurnoActual(null);
            localStorage.removeItem('turnoActual');
          }
        } catch (turnosActivosError) {
          console.error('[TURNO_CONTEXT] Error al obtener turnos activos:', turnosActivosError);
        }
      }
      
      // Si no se encontraron turnos activos en tbl_usuarios_turnos, limpiar turno actual
      if (turnosActivos.length === 0) {
        console.log('[TURNO_CONTEXT] No hay turnos activos en tbl_usuarios_turnos, limpiando turno actual');
        setTurnoActual(null);
        localStorage.removeItem('turnoActual');
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
  
  // FUNCIÓN OBSOLETA - Ya no se usa, solo tbl_usuarios_turnos
  // const buscarTurnoActivo = async () => {
  //   console.log('[TURNO_CONTEXT] buscarTurnoActivo() - Función obsoleta, solo se usa tbl_usuarios_turnos');
  //   setTurnoActual(null);
  // };

  // Efecto para cargar el turno inicial y configurar intervalos
  useEffect(() => {
    console.log('[TURNO_CONTEXT] useEffect inicial - authState.user:', authState.user);
    
    // Solo ejecutar si hay usuario autenticado
    if (authState.user?.id) {
      console.log('[TURNO_CONTEXT] Usuario autenticado, cargando turno inicial');
      
      // Si ya hay un turno en localStorage, mostrar inmediatamente
      const savedTurno = localStorage.getItem('turnoActual');
      if (savedTurno && !turnoActual) {
        console.log('[TURNO_CONTEXT] Mostrando turno desde localStorage mientras se valida con servidor');
        setTieneTurnoActivo(true);
      }
      
      // Carga inicial del turno (validar con servidor)
      fetchTurnoActual();
      
      // Verificar el turno cada 2 minutos para balance entre UX y performance
      const intervalTurno = setInterval(fetchTurnoActual, 2 * 60000);
      
      // Verificar fin de turno cada 5 minutos
      const intervalNotificacion = setInterval(verificarFinTurno, 5 * 60000);
      
      // Verificar inmediatamente si estamos cerca del fin de turno
      verificarFinTurno();
      
      return () => {
        clearInterval(intervalTurno);
        clearInterval(intervalNotificacion);
      };
    } else {
      console.log('[TURNO_CONTEXT] No hay usuario autenticado, no se carga turno');
    }
  }, [authState.user]);

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
