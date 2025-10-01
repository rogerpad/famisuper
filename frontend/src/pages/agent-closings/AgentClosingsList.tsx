import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTurno } from '../../contexts/TurnoContext';
import { useAuth } from '../../contexts/AuthContext';
import turnosApi from '../../api/turnos/turnosApi';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Tooltip, Snackbar, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import AdjustIcon from '@mui/icons-material/Adjust';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSnackbar } from 'notistack';
import html2pdf from 'html2pdf.js';

import { agentClosingsApi, AgentClosing } from '../../api/agent-closings/agentClosingsApi';
import ClosingAdjustmentForm from './ClosingAdjustmentForm';
import ClosingAdjustmentHistory from './ClosingAdjustmentHistory';

const AgentClosingsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { turnoActual, refetchTurno } = useTurno();
  const { state: authState } = useAuth();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClosingId, setSelectedClosingId] = useState<number | null>(null);
  const [finalizarTurnoDialogOpen, setFinalizarTurnoDialogOpen] = useState(false);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState<AgentClosing | null>(null);
  const [showNoTurnoAlert, setShowNoTurnoAlert] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const tableRef = useRef<HTMLDivElement>(null);

  // Formatear fechas para la API
  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  // Consulta para obtener los cierres finales de agentes
  const { data: closings, isLoading, refetch } = useQuery({
    queryKey: ['agentClosings', formattedStartDate, formattedEndDate],
    queryFn: () => agentClosingsApi.getAllAgentClosings(formattedStartDate, formattedEndDate),
  });

  // Mutación para eliminar un cierre
  const deleteMutation = useMutation({
    mutationFn: (id: number) => agentClosingsApi.deleteAgentClosing(id),
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setSelectedClosingId(null);
      queryClient.invalidateQueries({ queryKey: ['agentClosings'] });
      enqueueSnackbar('Cierre eliminado correctamente', { variant: 'success' });
    },
    onError: (error: any) => {
      console.error('Error al eliminar cierre:', error);
      
      // Extraer mensaje de error detallado
      let errorMessage = 'Error desconocido al eliminar el cierre';
      
      if (error.response) {
        // Error de la API
        errorMessage = error.response.data?.message || 
                     error.response.data?.error || 
                     `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });
  
  // Manejador para finalizar turno
  const handleFinalizarTurno = async () => {
    if (!turnoActual) {
      console.log('[AGENT_CLOSINGS] No hay turno actual para finalizar');
      return;
    }
    
    console.log('[AGENT_CLOSINGS] Iniciando finalización de turno:', turnoActual);
    
    try {
      // Usar el método específico para agentes que actualiza tablas de operación de agentes
      await turnosApi.finalizarTurnoAgente(turnoActual.id);
      console.log('[AGENT_CLOSINGS] Turno finalizado exitosamente');
      
      setFinalizarTurnoDialogOpen(false);
      
      // Limpiar localStorage inmediatamente para evitar inconsistencias
      localStorage.removeItem('turnoActual');
      localStorage.removeItem('operacionActiva');
      
      // Refrescar datos del servidor inmediatamente
      await refetchTurno();
      refetch();
      
      enqueueSnackbar('Turno finalizado correctamente', { variant: 'success' });
      
      // Redireccionar a Mis turnos después de finalizar
      navigate('/turnos/vendedor');
    } catch (error: any) {
      console.error('[AGENT_CLOSINGS] Error al finalizar turno:', error);
      
      // Extraer mensaje de error detallado
      let errorMessage = 'Error desconocido al finalizar el turno';
      
      if (error.response) {
        // Error de la API
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('[AGENT_CLOSINGS] Mensaje de error:', errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Manejador para abrir el diálogo de ajuste
  const handleAdjustClick = (closing: AgentClosing) => {
    setSelectedClosing(closing);
    setAdjustmentDialogOpen(true);
  };

  // Manejador para abrir el diálogo de historial de ajustes
  const handleHistoryClick = (closing: AgentClosing) => {
    setSelectedClosing(closing);
    setHistoryDialogOpen(true);
  };

  // Manejador para cuando se completa un ajuste
  const handleAdjustmentComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['agentClosings'] });
    enqueueSnackbar('Ajuste realizado correctamente', { variant: 'success' });
  };

  // Manejadores de eventos
  const handleAddClick = () => {
    // Permitir crear cierre sin restricción de turno
    navigate('/agent-closings/new');
  };

  const handleEditClick = (id: number) => {
    navigate(`/agent-closings/edit/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedClosingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedClosingId) {
      deleteMutation.mutate(selectedClosingId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedClosingId(null);
  };

  // Manejadores para finalizar turno
  const handleFinalizarTurnoClick = () => {
    setFinalizarTurnoDialogOpen(true);
  };

  const handleFinalizarTurnoCancel = () => {
    setFinalizarTurnoDialogOpen(false);
  };

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return `L ${new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  };
  
  // Función para exportar a PDF
  const handleExportToPdf = () => {
    try {
      if (!tableRef.current || !closings || closings.length === 0) {
        enqueueSnackbar('No hay datos para exportar', { variant: 'warning' });
        return;
      }
      
      // Crear un elemento temporal para el PDF
      const element = document.createElement('div');
      element.style.padding = '20px';
      
      // Agregar título y fecha al PDF
      const title = document.createElement('h2');
      title.textContent = 'Reporte de Cierres Finales de Agentes';
      title.style.textAlign = 'center';
      title.style.marginBottom = '10px';
      element.appendChild(title);
      
      // Agregar información de fecha de generación
      const dateInfo = document.createElement('p');
      dateInfo.textContent = `Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`;
      dateInfo.style.textAlign = 'center';
      dateInfo.style.marginBottom = '10px';
      element.appendChild(dateInfo);
      
      // Agregar información de usuario y turno
      const userInfo = document.createElement('div');
      userInfo.style.marginBottom = '20px';
      userInfo.style.textAlign = 'center';
      
      // Obtener nombre completo del usuario actual
      const nombreUsuario = authState.user ? 
        `${authState.user.nombre || ''} ${authState.user.apellido || ''}`.trim() : 
        'Usuario no identificado';
      
      // Crear elemento para el usuario
      const userElement = document.createElement('p');
      userElement.textContent = `Usuario: ${nombreUsuario}`;
      userElement.style.margin = '5px';
      userInfo.appendChild(userElement);
      
      // Crear elemento para el turno
      const turnoElement = document.createElement('p');
      turnoElement.textContent = `Turno: ${turnoActual?.nombre || 'No hay turno activo'}`;
      turnoElement.style.margin = '5px';
      userInfo.appendChild(turnoElement);
      
      element.appendChild(userInfo);
      
      // Agregar filtros aplicados si existen
      if (startDate || endDate) {
        const filterInfo = document.createElement('p');
        filterInfo.textContent = `Filtros: ${startDate ? 'Desde ' + format(startDate, 'dd/MM/yyyy', { locale: es }) : ''} ${endDate ? 'Hasta ' + format(endDate, 'dd/MM/yyyy', { locale: es }) : ''}`;
        filterInfo.style.marginBottom = '20px';
        element.appendChild(filterInfo);
      }
      
      // Crear tabla para el PDF
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      // Crear encabezado de la tabla
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      // Definir encabezados
      const headers = ['ID', 'Fecha', 'Agente', 'Saldo Inicial', 'Resultado Final', 'Diferencia'];
      
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Crear cuerpo de la tabla
      const tbody = document.createElement('tbody');
      
      // Filtrar solo cierres activos para el PDF
      const activeClosings = closings.filter(closing => closing.estado === true);
      
      activeClosings.forEach(closing => {
        const row = document.createElement('tr');
        
        // Crear celdas con los datos
        const createCell = (text: string) => {
          const cell = document.createElement('td');
          cell.textContent = text;
          cell.style.border = '1px solid #ddd';
          cell.style.padding = '8px';
          return cell;
        };
        
        // Agregar datos a las celdas
        row.appendChild(createCell(closing.id.toString()));
        row.appendChild(createCell(formatDate(closing.fechaCierre)));
        row.appendChild(createCell(closing.proveedor?.nombre || ''));
        row.appendChild(createCell(formatCurrency(Number(closing.saldoInicial) || 0)));
        row.appendChild(createCell(formatCurrency(Number(closing.resultadoFinal) || 0)));
        row.appendChild(createCell(formatCurrency(Number(closing.diferencia) || 0)));
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      element.appendChild(table);
      
      // Configurar opciones para el PDF
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Reporte_Cierres_Agentes_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      // Generar el PDF
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          enqueueSnackbar('PDF generado correctamente', { variant: 'success' });
        })
        .catch((err: any) => {
          console.error('Error al generar el PDF:', err);
          enqueueSnackbar('Error al generar el PDF', { variant: 'error' });
        });
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      enqueueSnackbar('Error al generar el PDF', { variant: 'error' });
    }
  };

  const formatDate = (date: string) => {
    // Si la fecha está en formato YYYY-MM-DD, formatearla manualmente para evitar problemas de zona horaria
    if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    // Si no está en ese formato, usar date-fns (aunque puede tener problemas de zona horaria)
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="closings-icon" style={{ fontSize: '1.2em' }}>📊</span>
          Cierres Finales de Agentes
        </Typography>
        <Box display="flex" gap={2}>
          {turnoActual && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFinalizarTurnoClick}
              disabled={!turnoActual}
              sx={{
                backgroundColor: '#2e86c1',
                '&:hover': {
                  backgroundColor: '#1a5276'
                },
              }}
            >
              Finalizar Turno Agente
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{
              backgroundColor: '#dc7633',
              '&:hover': {
                backgroundColor: '#b35c20'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Nuevo Cierre
          </Button>
        </Box>
      </Box>

      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha Inicio"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { width: 200 },
                },
              }}
            />

            <DatePicker
              label="Fecha Fin"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  sx: { width: 200 },
                },
              }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            onClick={() => refetch()}
            sx={{ 
              height: 40,
              backgroundColor: '#dc7633',
              '&:hover': {
                backgroundColor: '#b35c20'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginRight: 1
            }}
          >
            Filtrar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportToPdf}
            sx={{ 
              height: 40,
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Exportar PDF
          </Button>
        </Box>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Cargando...</Typography>
        </Box>
      ) : (
        <TableContainer ref={tableRef} component={Paper} sx={{ 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'auto',  // Cambiado de 'hidden' a 'auto' para permitir scroll
          maxWidth: '100%',  // Asegurar que no exceda el ancho del contenedor padre
          '&::-webkit-scrollbar': {
            height: '8px',  // Altura de la barra de desplazamiento horizontal
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#dc7633',  // Color del pulgar de la barra de desplazamiento
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f5f5f5',  // Color de la pista de la barra de desplazamiento
          }
        }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Agente</TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Fecha de Cierre</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Saldo Inicial</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Resultado Final</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Saldo Final</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Diferencia</TableCell>
                <TableCell sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', padding: '12px 16px', verticalAlign: 'middle' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {closings?.filter(closing => closing.estado === true)?.map((closing) => (
                <TableRow key={closing.id}>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle' }}>{closing.id}</TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle' }}>{closing.proveedor?.nombre || 'N/A'}</TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle' }}>{formatDate(closing.fechaCierre)}</TableCell>
                  <TableCell align="right" sx={{ padding: '12px 16px', verticalAlign: 'middle', fontFamily: 'monospace' }}>
                    {(closing.saldoInicial !== null && closing.saldoInicial !== undefined) ? Number(closing.saldoInicial).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell align="right" sx={{ padding: '12px 16px', verticalAlign: 'middle', fontFamily: 'monospace' }}>
                    {(closing.resultadoFinal !== null && closing.resultadoFinal !== undefined) ? Number(closing.resultadoFinal).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell align="right" sx={{ padding: '12px 16px', verticalAlign: 'middle', fontFamily: 'monospace' }}>
                    {(closing.saldoFinal !== null && closing.saldoFinal !== undefined) ? Number(closing.saldoFinal).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell align="right" sx={{ padding: '12px 16px', verticalAlign: 'middle', fontFamily: 'monospace' }}>
                    {(closing.diferencia !== null && closing.diferencia !== undefined) ? Number(closing.diferencia).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell sx={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                    <Chip 
                      label={closing.estado ? 'Activo' : 'Inactivo'} 
                      color={closing.estado === true ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/agent-closings/edit/${closing.id}`)}
                      disabled={closing.estado !== true}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteClick(closing.id)}
                      disabled={closing.estado !== true}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {closing.estado === false && (
                      <>
                        <Tooltip title="Realizar ajuste">
                          <IconButton 
                            size="small" 
                            onClick={() => handleAdjustClick(closing)}
                          >
                            <AdjustIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver historial de ajustes">
                          <IconButton 
                            size="small" 
                            onClick={() => handleHistoryClick(closing)}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este cierre? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para finalizar turno */}
      <Dialog
        open={finalizarTurnoDialogOpen}
        onClose={handleFinalizarTurnoCancel}
      >
        <DialogTitle>Confirmar finalización de turno</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Ya has creado los 6 cierres de Agentes y el cierre de Efectivo Agente y desea finalizar el turno actual? Esta acción no se puede deshacer.
          </DialogContentText>
          
          {turnoActual && (
            <Box mt={2}>
              <Typography variant="subtitle2">Detalles del turno:</Typography>
              <Typography variant="body2">ID: {turnoActual.id}</Typography>
              <Typography variant="body2">Nombre: {turnoActual.nombre}</Typography>
              <Typography variant="body2">Hora inicio: {turnoActual.horaInicio || 'No registrada'}</Typography>
              <Typography variant="body2">Hora fin programada: {turnoActual.horaFin || 'No definida'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFinalizarTurnoCancel}>Cancelar</Button>
          <Button 
            onClick={handleFinalizarTurno}
            color="primary"
          >
            Finalizar Turno
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulario de ajuste de cierre */}
      <ClosingAdjustmentForm
        open={adjustmentDialogOpen}
        onClose={() => setAdjustmentDialogOpen(false)}
        closing={selectedClosing}
        onAdjustmentComplete={handleAdjustmentComplete}
      />

      {/* Historial de ajustes */}
      <ClosingAdjustmentHistory
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        closingId={selectedClosing?.id || 0}
      />

      {/* Alerta de turno no activo */}
      <Snackbar 
        open={showNoTurnoAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowNoTurnoAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowNoTurnoAlert(false)} 
          severity="warning" 
          variant="filled"
        >
          No hay un turno activo. Debe activar un turno antes de crear cierres.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgentClosingsList;
