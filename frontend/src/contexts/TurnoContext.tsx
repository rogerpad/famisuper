import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import turnosApi, { Turno } from '../api/turnos/turnosApi';
import { useAuth } from './AuthContext';
import { isValidId, toValidId } from '../utils/idValidation';

// Usamos la interfaz Turno importada de turnosApi

interface TurnoContextType {
  turnoActual: Turno | null;
  loading: boolean;
  error: string | null;
  refetchTurno: () => void;
  notificacionVisible: boolean;
  tiempoRestante: number;
  cerrarNotificacion: () => void;
}

const TurnoContext = createContext<TurnoContextType>({
  turnoActual: null,
  loading: false,
  error: null,
  refetchTurno: () => {},
  notificacionVisible: false,
  tiempoRestante: 0,
  cerrarNotificacion: () => {}
});

export const useTurno = () => useContext(TurnoContext);

export const TurnoProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notificacionVisible, setNotificacionVisible] = useState<boolean>(false);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);

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
    } catch (err: any) {
      // Evitamos mostrar errores 401 en la consola
      if (err?.response?.status === 401) {
        // Silenciosamente manejamos el error de autenticación
        setTurnoActual(null);
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
          loading, 
          error, 
          refetchTurno: fetchTurnoActual,
          notificacionVisible,
          tiempoRestante,
          cerrarNotificacion
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
