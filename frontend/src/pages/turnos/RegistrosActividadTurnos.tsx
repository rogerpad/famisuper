import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import turnosApi, { RegistroActividad } from '../../api/turnos/turnosApi';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { isValidId, toValidId, isValidDate } from '../../utils/validationUtils';

// Componente para mostrar los registros de actividad de turnos
const RegistrosActividadTurnos: React.FC = () => {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtroTurnoId, setFiltroTurnoId] = useState<string>('');
  const [filtroUsuarioId, setFiltroUsuarioId] = useState<string>('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState<Date | null>(null);
  const [filtroFechaFin, setFiltroFechaFin] = useState<Date | null>(null);

  // Verificar si el usuario tiene permiso para ver los registros
  const tienePermiso = hasPermission('ver_registro_actividad_turnos');
  
  // Estado para controlar la carga de verificación de registros
  const [verificandoRegistros, setVerificandoRegistros] = useState(false);
  const [mensajeVerificacion, setMensajeVerificacion] = useState<string | null>(null);

  // Efecto para mostrar todos los registros al montar el componente
  useEffect(() => {
    if (tienePermiso) {
      console.log('[RegistrosActividadTurnos] Componente montado, mostrando todos los registros sin filtros');
      // No es necesario limpiar filtros aquí ya que los estados iniciales ya están vacíos
      // Solo aseguramos que se muestren todos los registros
    }
  }, [tienePermiso]);
  
  // Función para verificar y crear registros de actividad de prueba
  const verificarRegistrosActividad = async () => {
    try {
      setVerificandoRegistros(true);
      setMensajeVerificacion(null);
      
      console.log('[RegistrosActividadTurnos] Verificando registros de actividad...');
      const resultado = await turnosApi.verificarRegistrosActividad();
      
      console.log('[RegistrosActividadTurnos] Resultado de verificación:', resultado);
      setMensajeVerificacion(resultado.message);
      
      // Refrescar los datos para mostrar los nuevos registros si se crearon
      if (resultado.success) {
        setTimeout(() => refetch(), 500);
      }
    } catch (error: any) {
      console.error('[RegistrosActividadTurnos] Error al verificar registros:', error);
      setMensajeVerificacion(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setVerificandoRegistros(false);
    }
  };

  // Función para validar y convertir IDs usando las utilidades
  const validarId = (idStr: string | undefined): number | undefined => {
    // Si es una cadena vacía, devolver undefined explícitamente
    if (idStr === undefined || idStr === null || idStr.trim() === '') {
      return undefined;
    }
    
    const id = toValidId(idStr);
    
    if (id === undefined) {
      console.warn(`ID inválido detectado en filtros: ${idStr}`);
      return undefined;
    }
    
    console.log(`ID validado correctamente: ${idStr} -> ${id}`);
    return id;
  };

  // Consulta para obtener los registros de actividad
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['registrosActividad', page, rowsPerPage, filtroTurnoId, filtroUsuarioId, filtroFechaInicio, filtroFechaFin],
    () => {
      // Construir opciones con valores validados
      const options: {
        turnoId?: number;
        usuarioId?: number;
        fechaInicio?: Date;
        fechaFin?: Date;
        limit: number;
        offset: number;
      } = {
        limit: rowsPerPage,
        offset: page * rowsPerPage
      };
      
      // Validar IDs antes de enviarlos al backend
      // Solo añadir al objeto options si son válidos
      const turnoId = validarId(filtroTurnoId);
      if (turnoId !== undefined) {
        options.turnoId = turnoId;
      }
      
      const usuarioId = validarId(filtroUsuarioId);
      if (usuarioId !== undefined) {
        options.usuarioId = usuarioId;
      }
      
      // Validar fechas y añadirlas solo si son válidas
      if (isValidDate(filtroFechaInicio)) {
        try {
          // Asegurarse de que la fecha es válida para serialización
          const fechaInicioValid = new Date(filtroFechaInicio as Date);
          if (!isNaN(fechaInicioValid.getTime())) {
            options.fechaInicio = fechaInicioValid;
            console.log(`[RegistrosActividadTurnos] Fecha inicio validada: ${fechaInicioValid.toISOString()}`);
          } else {
            console.error(`[RegistrosActividadTurnos] Fecha inicio inválida:`, filtroFechaInicio);
          }
        } catch (error) {
          console.error(`[RegistrosActividadTurnos] Error al procesar fecha inicio:`, error);
        }
      }
      
      if (isValidDate(filtroFechaFin)) {
        try {
          // Asegurarse de que la fecha es válida para serialización
          const fechaFinValid = new Date(filtroFechaFin as Date);
          if (!isNaN(fechaFinValid.getTime())) {
            options.fechaFin = fechaFinValid;
            console.log(`[RegistrosActividadTurnos] Fecha fin validada: ${fechaFinValid.toISOString()}`);
          } else {
            console.error(`[RegistrosActividadTurnos] Fecha fin inválida:`, filtroFechaFin);
          }
        } catch (error) {
          console.error(`[RegistrosActividadTurnos] Error al procesar fecha fin:`, error);
        }
      }
      
      // Verificar si estamos mostrando todos los registros (sin filtros)
      const sinFiltros = !options.turnoId && !options.usuarioId && !options.fechaInicio && !options.fechaFin;
      
      if (sinFiltros) {
        console.log(`[RegistrosActividadTurnos] Mostrando TODOS los registros de actividad sin filtros`);
      } else {
        console.log(`[RegistrosActividadTurnos] Consultando con filtros aplicados:`, options);
      }
      
      return turnosApi.getRegistrosActividad(options);
    },
    {
      enabled: tienePermiso,
      keepPreviousData: true
    }
  );

  // Obtener lista de turnos para el filtro
  const { data: turnos } = useQuery(
    ['turnos'],
    () => turnosApi.getAll(),
    {
      enabled: tienePermiso
    }
  );

  // Manejar cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    setPage(0);
    refetch();
  };

  // Limpiar filtros y mostrar todos los registros sin filtros
  const limpiarFiltros = () => {
    console.log('[RegistrosActividadTurnos] Limpiando todos los filtros para mostrar todos los registros');
    setFiltroTurnoId('');
    setFiltroUsuarioId('');
    setFiltroFechaInicio(null);
    setFiltroFechaFin(null);
    setPage(0);
    // Añadir un retraso para asegurar que los estados se actualicen correctamente
    setTimeout(() => {
      console.log('[RegistrosActividadTurnos] Refrescando datos para mostrar todos los registros sin filtros');
      refetch();
    }, 100);
  };

  // Obtener color para el chip según la acción
  const getChipColor = (accion: string) => {
    switch (accion.toLowerCase()) {
      case 'iniciar':
        return 'success';
      case 'finalizar':
        return 'error';
      case 'reiniciar':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Si el usuario no tiene permiso, mostrar mensaje
  if (!tienePermiso) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No tienes permiso para ver los registros de actividad de turnos.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Registros de Actividad de Turnos
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Filtros
          </Typography>
          {!filtroTurnoId && !filtroUsuarioId && !filtroFechaInicio && !filtroFechaFin && (
            <Chip 
              label="Mostrando todos los registros" 
              color="info" 
              size="small" 
              sx={{ fontWeight: 'medium' }}
            />
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={verificarRegistrosActividad}
            disabled={verificandoRegistros}
            size="small"
            startIcon={verificandoRegistros ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ ml: 2 }}
          >
            {verificandoRegistros ? 'Verificando...' : 'Verificar Registros'}
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="turno-select-label">Turno</InputLabel>
              <Select
                labelId="turno-select-label"
                value={filtroTurnoId}
                label="Turno"
                onChange={(e: SelectChangeEvent) => {
                  // Asegurar que el valor es una cadena vacía o un ID válido
                  const newValue = e.target.value;
                  setFiltroTurnoId(newValue === '' ? '' : newValue);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {turnos?.map((turno) => (
                  <MenuItem key={turno.id} value={turno.id.toString()}>
                    {turno.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="ID de Usuario"
              variant="outlined"
              fullWidth
              margin="normal"
              value={filtroUsuarioId}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue === '' || /^\d+$/.test(newValue)) {
                  setFiltroUsuarioId(newValue);
                }
              }}
              onBlur={() => {
                if (filtroUsuarioId !== '' && !/^\d+$/.test(filtroUsuarioId)) {
                  console.warn(`Limpiando ID de usuario inválido: ${filtroUsuarioId}`);
                  setFiltroUsuarioId('');
                }
              }}
              placeholder="Ej: 1234"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              helperText={
                filtroUsuarioId !== '' && !/^\d+$/.test(filtroUsuarioId)
                  ? "Solo se permiten números enteros positivos"
                  : "Ingrese el ID del usuario"
              }
              error={filtroUsuarioId !== '' && !/^\d+$/.test(filtroUsuarioId)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Inicio"
                value={filtroFechaInicio}
                onChange={(newValue) => setFiltroFechaInicio(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Fin"
                value={filtroFechaFin}
                onChange={(newValue) => setFiltroFechaFin(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={aplicarFiltros}
              fullWidth
            >
              Aplicar Filtros
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={limpiarFiltros}
              fullWidth
            >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Mensaje de verificación de registros */}
      {mensajeVerificacion && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          onClose={() => setMensajeVerificacion(null)}
        >
          {mensajeVerificacion}
        </Alert>
      )}
      
      {/* Botón para verificar registros */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={verificarRegistrosActividad}
          disabled={verificandoRegistros || isLoading}
          startIcon={verificandoRegistros ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {verificandoRegistros ? 'Verificando...' : 'Verificar Registros de Actividad'}
        </Button>
      </Box>

      {/* Tabla de registros */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">
              Error al cargar los registros: {(error as Error)?.message || 'Error desconocido'}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => {
                limpiarFiltros();
                // Esperar un momento antes de recargar para asegurar que los filtros se hayan limpiado
                setTimeout(() => refetch(), 100);
              }}
            >
              Limpiar filtros y reintentar
            </Button>
          </Box>
        ) : !data?.registros.length ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No se encontraron registros de actividad
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Prueba a verificar si existen registros en la base de datos usando el botón "Verificar Registros de Actividad"
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Si hay registros pero no se muestran, intenta quitar los filtros o verificar los logs del servidor
            </Typography>
            {(filtroTurnoId || filtroUsuarioId || filtroFechaInicio || filtroFechaFin) && (
              <Button 
                variant="text" 
                color="primary" 
                onClick={limpiarFiltros}
                sx={{ mt: 1 }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Fecha y Hora</TableCell>
                    <TableCell>Turno</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Acción</TableCell>
                    <TableCell>Descripción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.registros.map((registro: RegistroActividad) => (
                    <TableRow hover key={registro.id}>
                      <TableCell>{registro.id}</TableCell>
                      <TableCell>
                        {format(new Date(registro.fechaHora), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>{registro.turno.nombre}</TableCell>
                      <TableCell>
                        {registro.usuario.nombre} {registro.usuario.apellido || ''}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={registro.accion.toUpperCase()} 
                          color={getChipColor(registro.accion) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{registro.descripcion || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {data?.registros.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay registros de actividad
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={data?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default RegistrosActividadTurnos;
