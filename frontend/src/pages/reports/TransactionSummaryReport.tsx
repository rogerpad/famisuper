import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTurno } from '../../contexts/TurnoContext';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import turnosApi, { Turno } from '../../api/turnos/turnosApi';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  CircularProgress,
  TextField,
  Alert
} from '@mui/material';
// Las importaciones de iconos han sido eliminadas ya que no se utilizan
import { useQuery } from '@tanstack/react-query';
import reportsApi, { TransactionReportData } from '../../api/reports/reportsApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2pdf from 'html2pdf.js';

const TransactionSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  // Eliminados los estados de fechas ya que no se utilizan
  const [turno, setTurno] = useState<string>(''); // Valor por defecto del turno
  const [turnoId, setTurnoId] = useState<number | string>(''); // ID del turno seleccionado - usamos string vacío como valor por defecto
  const [turnos, setTurnos] = useState<Turno[]>([]); // Lista de turnos disponibles
  const [horaInicio, setHoraInicio] = useState<string>('08:00'); // Hora de inicio por defecto
  const [horaFin, setHoraFin] = useState<string>('16:00'); // Hora de fin por defecto
  const [horaActual, setHoraActual] = useState<string>(''); // Hora actual del sistema
  const [usuario, setUsuario] = useState<string>(''); // Usuario que ingresó las transacciones
  const { state: authState } = useAuth(); // Obtener el contexto de autenticación
  const { turnoActual, loading: isLoadingTurno } = useTurno(); // Obtener el turno actual del contexto
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Consulta para obtener los turnos disponibles
  const { data: turnosData } = useReactQuery({
    queryKey: ['turnos'],
    queryFn: () => turnosApi.getAll(),
    onSuccess: (data) => {
      setTurnos(data);
    }
  });

  // Función para obtener la hora actual formateada como HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Efecto para actualizar la hora actual cada minuto
  useEffect(() => {
    // Actualizar la hora actual inmediatamente
    setHoraActual(getCurrentTime());
    
    // Configurar un intervalo para actualizar la hora cada minuto
    const interval = setInterval(() => {
      setHoraActual(getCurrentTime());
    }, 60000); // 60000 ms = 1 minuto
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  // Efecto para establecer el usuario actual y su turno cuando se carga el componente
  useEffect(() => {
    if (authState.user) {
      // Establecer el nombre del usuario
      setUsuario(`${authState.user.nombre} ${authState.user.apellido || ''}`);
    }
  }, [authState.user]);
  
  // Efecto para establecer el turno actual desde el contexto TurnoContext
  useEffect(() => {
    if (turnoActual) {
      // Usar el turno actual del contexto global
      setTurno(turnoActual.nombre || '');
      setTurnoId(turnoActual.id || '');
      setHoraInicio(turnoActual.horaInicio || '08:00');
      setHoraFin(turnoActual.horaFin || '16:00');
    } else if (turnos.length > 0) {
      // Si no hay turno activo pero hay turnos disponibles, usar el primero
      setTurno(turnos[0].nombre || '');
      setTurnoId(turnos[0].id || '');
      setHoraInicio(turnos[0].horaInicio || '08:00');
      setHoraFin(turnos[0].horaFin || '16:00');
    } else {
      // Si no hay turno activo ni turnos disponibles, usar valores por defecto
      setTurno('');
      setTurnoId('');
      setHoraInicio('08:00');
      setHoraFin('16:00');
    }
  }, [turnoActual, turnos]);
  
  // Consulta para obtener los datos del reporte
  const { data, isLoading, isError, refetch } = useQuery<TransactionReportData>({
    queryKey: ['transactionSummary'],
    queryFn: () => reportsApi.getTransactionSummary(),
  });

  // Las funciones handleExportToExcel y handlePrint han sido eliminadas ya que no se utilizan

  // Función para formatear valores monetarios
  const formatCurrency = (value: number) => {
    // Asegurarse de que el valor sea un número
    const numValue = Number(value);
    // Usar Intl.NumberFormat para formatear correctamente los números
    return `L${new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue)}`;
  };

  // Función para generar el reporte en PDF
  const handleGenerateReport = async () => {
    try {
      if (!reportRef.current) {
        throw new Error('No se pudo encontrar el elemento del reporte');
      }

      // Crear una copia del elemento para no modificar el original
      const element = reportRef.current.cloneNode(true) as HTMLElement;
      
      // Asegurarse de que los datos del usuario, turno y horario estén presentes en el reporte
      const userInfoElement = element.querySelector('#user-info');
      if (userInfoElement) {
        // Actualizar la información del usuario en el elemento clonado
        const userNameElement = userInfoElement.querySelector('#user-name');
        if (userNameElement) {
          userNameElement.textContent = `Usuario: ${usuario || 'No especificado'}`;
        }
        
        const turnoElement = userInfoElement.querySelector('#turno-info');
        if (turnoElement) {
          turnoElement.textContent = `Turno: ${turno}`;
        }
        
        const horarioElement = userInfoElement.querySelector('#horario-info');
        if (horarioElement) {
          horarioElement.textContent = `Horario: ${horaInicio} - ${horaActual}`;
        }
      }
      
      // Configurar opciones para el PDF
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Reporte_Transacciones_${format(new Date(), 'yyyy-MM-dd')}_${turno}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      // Generar el PDF
      console.log('Generando PDF...');
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          console.log('PDF generado correctamente');
        })
        .catch((err: any) => {
          console.error('Error al generar el PDF:', err);
          alert('Error al generar el PDF. Por favor, intente nuevamente.');
        });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };
  
  // Función para navegar al formulario de nuevo cierre
  const handleGenerarCierre = () => {
    navigate('/agent-closings/new');
  };

  // Función para calcular el total general de efectivo (suma de todos los tipos)
  const calcularTotalEfectivo = () => {
    let total = 0;
    reportData.transactionTypes.forEach(tipo => {
      total += calcularTotalPorTipo(tipo);
    });
    return total;
  };

  // Función para calcular el total por tipo de transacción (suma de agentes + efectivo)
  const calcularTotalPorTipo = (row: any) => {
    let total = row.efectivo || 0;
    // Sumar los valores de todos los agentes para este tipo de transacción
    Object.values(row.agentes).forEach((valor: any) => {
      total += Number(valor) || 0;
    });
    return total;
  };

  // Función para calcular el total por agente
  const calcularTotalPorAgente = (agenteId: number) => {
    let total = 0;
    reportData.transactionTypes.forEach(tipo => {
      total += Number(tipo.agentes[agenteId]) || 0;
    });
    return total;
  };

  // Datos de ejemplo para desarrollo y pruebas
  const mockData: TransactionReportData = {
    transactionTypes: [
      {
        tipoTransaccion: 'Adicional del Super',
        tipoTransaccionId: 1,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'AdicionalCasa',
        tipoTransaccionId: 2,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Comisión',
        tipoTransaccionId: 3,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Comisión p. servicios',
        tipoTransaccionId: 4,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Depósito',
        tipoTransaccionId: 5,
        agentes: { '1': 800, '2': 1400, '3': 0, '4': 0, '5': 0 },
        efectivo: 1200
      },
      {
        tipoTransaccion: 'Pago',
        tipoTransaccionId: 6,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Pago de factura sin efectivo',
        tipoTransaccionId: 7,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Pago super con transferencia',
        tipoTransaccionId: 8,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Prestamo a caja del super',
        tipoTransaccionId: 9,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Remesa',
        tipoTransaccionId: 10,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Retiro',
        tipoTransaccionId: 11,
        agentes: { '1': 200, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 200
      },
      {
        tipoTransaccion: 'Saldo',
        tipoTransaccionId: 12,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Tasa de Seguridad',
        tipoTransaccionId: 13,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      }
    ],
    agentes: [
      { id: 1, nombre: 'Atlantida' },
      { id: 2, nombre: 'BAC' },
      { id: 3, nombre: 'Banpais' },
      { id: 4, nombre: 'Occidente' },
      { id: 5, nombre: 'TENGO' }
    ],
    totales: { '1': 1000, '2': 1400, '3': 0, '4': 0, '5': 0 },
    totalEfectivo: 1400
  };

  // Usar datos reales o datos de ejemplo
  const reportData = data || mockData;
  
  // Reorganizar los agentes para que "EFECTIVO AGENTE" aparezca en la antepenúltima columna
  const reorderedAgentes = [...reportData.agentes];
  
  // Encontrar el índice del agente "EFECTIVO AGENTE"
  const efectivoAgenteIndex = reorderedAgentes.findIndex(agente => agente.nombre === 'EFECTIVO AGENTE');
  
  // Si se encuentra "EFECTIVO AGENTE", moverlo a la última posición del array
  if (efectivoAgenteIndex !== -1) {
    const efectivoAgente = reorderedAgentes.splice(efectivoAgenteIndex, 1)[0];
    reorderedAgentes.push(efectivoAgente);
  }
  
  // Usar los agentes reordenados
  const allAgentes = reorderedAgentes;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Resumen de Transacciones
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Información del Reporte
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="textSecondary">
            * Reporte generado con los datos actuales del sistema
          </Typography>
        </Box>
        
        <Grid container spacing={3} alignItems="flex-start">
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Turno"
              select
              value={turnoId || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedTurno = turnos.find(t => t.id === Number(selectedId));
                if (selectedTurno) {
                  setTurnoId(selectedTurno.id);
                  setTurno(selectedTurno.nombre);
                  setHoraInicio(selectedTurno.horaInicio);
                  setHoraFin(selectedTurno.horaFin);
                } else {
                  setTurnoId('');
                  setTurno('');
                }
              }}
              disabled={true} // Siempre deshabilitado para usar el turno actual
              InputLabelProps={{ shrink: true }}
              helperText={turnoActual ? "Turno actual activo" : "No hay turno activo"}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: turnoActual ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  height: '56px' // Altura fija para todos los campos
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc7633'
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: turnoActual ? 'green' : 'inherit',
                  position: 'absolute',
                  top: '100%',
                  marginTop: '2px'
                }
              }}
            >
              {turnos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Hora Inicio"
              type="time"
              value={horaInicio}
              disabled={true} // Siempre deshabilitado
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              helperText="Hora inicio del turno"
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: turnoActual ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  height: '56px' // Altura fija para todos los campos
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc7633'
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: turnoActual ? 'green' : 'inherit',
                  position: 'absolute',
                  top: '100%',
                  marginTop: '2px'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Hora Fin"
              type="time"
              value={horaActual} // Usar la hora actual en lugar de horaFin
              disabled={true} // Siempre deshabilitado
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              helperText="Hora actual del sistema"
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: 'rgba(33, 150, 243, 0.1)', // Color azul para diferenciar
                  height: '56px' // Altura fija para todos los campos
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc7633'
                  }
                },
                '& .MuiFormHelperText-root': {
                  color: '#1976d2', // Color azul para el texto de ayuda
                  position: 'absolute',
                  top: '100%',
                  marginTop: '2px'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Usuario"
              value={usuario}
              disabled={true}
              InputLabelProps={{ shrink: true }}
              helperText="Usuario actual del sistema"
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  height: '56px' // Altura fija para todos los campos
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc7633'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateReport}
              disabled={isLoading}
              sx={{ 
                bgcolor: '#ff9800', // Naranja
                '&:hover': { bgcolor: '#f57c00' },
                height: '48px',
                fontWeight: 'medium',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Generar Reporte'}
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerarCierre}
              disabled={!turnoActual}
              sx={{ 
                bgcolor: '#4caf50', // Verde
                '&:hover': { bgcolor: '#388e3c' },
                height: '48px',
                fontWeight: 'medium',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                opacity: turnoActual ? 1 : 0.7
              }}
            >
              Crear Cierre
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los datos del reporte. Por favor, intente nuevamente.
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Resumen de Transacciones
          </Typography>
        </Box>
        
        <div ref={reportRef}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Reporte de Transacciones
            </Typography>
            {/* Se ha eliminado el periodo de fechas del reporte */}
            <Box id="user-info" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, mt: 1, flexWrap: 'wrap' }}>
              <Typography id="turno-info" variant="body1" sx={{ fontWeight: 'medium' }}>
                Turno: {turno}
              </Typography>
              <Typography id="fecha-info" variant="body1" sx={{ fontWeight: 'medium' }}>
                Fecha: {format(new Date(), 'dd/MM/yyyy')}
              </Typography>
              <Typography id="horario-info" variant="body1" sx={{ fontWeight: 'medium' }}>
                Horario: {horaInicio} - {horaFin}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Typography id="user-name" variant="body1" sx={{ fontWeight: 'medium' }}>
                Usuario: {usuario || 'No especificado'}
              </Typography>
            </Box>
          </Box>
          
          <TableContainer>
            <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.8 } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#dc7633', '& > *': { fontSize: '0.875rem', lineHeight: 1.2, py: 0.8 } }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tipo de Transacción</TableCell>
                  {allAgentes.map((agente) => (
                    <TableCell key={agente.id} align="right" sx={{ fontWeight: 'bold', color: 'white' }}>
                      {agente.nombre}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Efectivo
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.transactionTypes.map((row) => (
                  <TableRow key={row.tipoTransaccionId} sx={{ '& > *': { fontSize: '0.875rem', lineHeight: 1.2 } }}>
                    <TableCell>{row.tipoTransaccion}</TableCell>
                    {allAgentes.map((agente) => (
                      <TableCell key={agente.id} align="right">
                        {row.agentes[agente.id] > 0 
                          ? formatCurrency(row.agentes[agente.id]) 
                          : '-'}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ bgcolor: 'hsl(23, 40%, 73%)' }}>
                      {calcularTotalPorTipo(row) > 0 ? formatCurrency(calcularTotalPorTipo(row)) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', bgcolor: 'primary.light', color: 'white', fontSize: '0.875rem', lineHeight: 1.2, py: 0.8 } }}>
                  <TableCell>TOTAL</TableCell>
                  {allAgentes.map((agente) => (
                    <TableCell key={agente.id} align="right">
                      {calcularTotalPorAgente(agente.id) > 0 
                        ? formatCurrency(calcularTotalPorAgente(agente.id)) 
                        : 'L0.00'}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ bgcolor: 'hsl(23, 40%, 73%)', color: 'black', fontWeight: 'bold' }}>
                    {formatCurrency(calcularTotalEfectivo())}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </div>
      </Paper>
    </Box>
  );
};

export default TransactionSummaryReport;
