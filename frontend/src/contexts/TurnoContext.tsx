import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

interface Turno {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  descripcion?: string;
  activo: boolean;
}

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
    if (!turnoActual) return;

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
  };

  const fetchTurnoActual = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // En un entorno real, esto sería una llamada a la API
      // const response = await axios.get('/api/turnos/actual');
      // setTurnoActual(response.data);
      
      // Por ahora, simulamos la respuesta basada en la hora actual
      const horaActual = new Date();
      const hora = horaActual.getHours();
      const minutos = horaActual.getMinutes();
      
      // Turno A: 8:00 - 14:00
      // Turno B: 14:00 - 20:00
      if (hora >= 8 && hora < 14) {
        setTurnoActual({
          id: 1,
          nombre: 'Turno A',
          horaInicio: '08:00',
          horaFin: '14:00',
          descripcion: 'Turno de mañana',
          activo: true
        });
      } else if (hora >= 14 && hora < 20) {
        setTurnoActual({
          id: 2,
          nombre: 'Turno B',
          horaInicio: '14:00',
          horaFin: '20:00',
          descripcion: 'Turno de tarde',
          activo: true
        });
      } else {
        setTurnoActual(null); // Fuera de horario de atención
      }
      
    } catch (err) {
      console.error('Error al obtener el turno actual:', err);
      setError('No se pudo obtener el turno actual');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar el turno inicial y configurar intervalos
  useEffect(() => {
    fetchTurnoActual();
    
    // Verificar el turno cada minuto
    const intervalTurno = setInterval(fetchTurnoActual, 60000);
    
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
