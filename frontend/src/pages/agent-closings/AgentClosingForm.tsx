import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTurno } from '../../contexts/TurnoContext';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format, parse } from 'date-fns';

import { agentClosingsApi, AgentClosing, CreateAgentClosingDto, UpdateAgentClosingDto } from '../../api/agent-closings/agentClosingsApi';
import providersApi from '../../api/providers/providersApi';
import transactionsApi from '../../api/transactions/transactionsApi';
import cashApi from '../../api/cash/cashApi';
import { isValidId, toValidId } from '../../utils/validationUtils';
import { useAuth } from '../../contexts/AuthContext';

// Interfaz para el formulario de cierre de agente
interface AgentClosingFormValues {
  id?: number; // ID del cierre final (solo para edición)
  proveedorId: number;
  fechaCierre: Date | string; // Permitir tanto Date como string para mayor flexibilidad
  saldoInicial: number;
  adicionalCta: number;
  resultadoFinal: number;
  saldoFinal: number;
  diferencia: number;
  observaciones?: string; // Opcional para permitir valores vacíos
  estado?: string; // Opcional para usar valores por defecto
  turnoId?: number; // ID del turno activo (opcional)
}

// Nota: Las funciones isValidId y toValidId se importan desde utils/validationUtils.ts

const AgentClosingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { turnoActual, loading: turnoLoading } = useTurno(); // Obtener el turno activo del contexto
  const { state: authState } = useAuth(); // Obtener el estado de autenticación para acceder al usuario actual
  
  // Estado para el Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // Función para mostrar mensajes en el Snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Función para cerrar el Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const [initialValues, setInitialValues] = useState<AgentClosingFormValues>({
    proveedorId: 0,
    fechaCierre: new Date(),
    saldoInicial: 0,
    adicionalCta: 0,
    resultadoFinal: 0,
    saldoFinal: 0,
    diferencia: 0,
    observaciones: '', // Cambiado de null a cadena vacía
    estado: 'activo',
    turnoId: turnoActual?.id, // Asignar el ID del turno activo si existe
  });
  
  // Estado para controlar el diálogo de confirmación
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [formValuesToSubmit, setFormValuesToSubmit] = useState<AgentClosingFormValues | null>(null);
  
  // El estado para el snackbar ya está declarado arriba
  
  // Efecto para actualizar el turnoId cuando el turno activo cambie
  useEffect(() => {
    if (turnoActual) {
      setInitialValues(prevValues => ({
        ...prevValues,
        turnoId: turnoActual.id
      }));
    }
  }, [turnoActual]);

  // Fetch agent-type providers
  const providersQuery = useQuery({
    queryKey: ['agentProviders'],
    queryFn: async () => {
      console.log('[AGENT_CLOSING_FORM] Obteniendo proveedores de tipo agente');
      // Obtener proveedores de tipo agente (tipo 1)
      const response = await providersApi.getByType(1);
      return response;
    },
  });
  // Filtrar solo proveedores activos
  const providers = providersQuery.data?.filter(provider => Boolean(provider.activo));

  // Nota: Usamos isValidId definido al principio del archivo para validar IDs

  // Fetch agent closing if editing
  const agentClosingQuery = useQuery({
    queryKey: ['agentClosing', id],
    queryFn: async () => {
      if (!id) return null;
      
      const validId = toValidId(id);
      if (!validId) {
        console.error(`[AGENT_CLOSING_FORM] ID de cierre final inválido: ${id}`);
        throw new Error(`ID de cierre final inválido: ${id}`);
      }
      
      console.log(`[AGENT_CLOSING_FORM] Obteniendo cierre final con ID: ${validId}`);
      return agentClosingsApi.getAgentClosingById(validId);
    },
    enabled: !!id && Number(id) > 0,
  });
  const agentClosing = agentClosingQuery.data;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: AgentClosingFormValues) => {
      console.log('[AGENT_CLOSING_FORM] Creando nuevo cierre final');
      console.log('[AGENT_CLOSING_FORM] Datos a enviar:', values);
      
      // Validar que proveedorId sea válido
      const proveedorId = toValidId(values.proveedorId);
      if (!proveedorId) {
        console.error(`[AGENT_CLOSING_FORM] ID de proveedor inválido: ${values.proveedorId}`);
        throw new Error('Debe seleccionar un agente válido');
      }
      
      // Convertir la fecha a formato string para la API y validar todos los campos numéricos
      const formattedValues = {
        ...values,
        proveedorId: proveedorId, // Usar el ID validado
        fechaCierre: values.fechaCierre instanceof Date ? format(values.fechaCierre, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        saldoInicial: Number(values.saldoInicial) || 0,
        adicionalCta: Number(values.adicionalCta) || 0,
        resultadoFinal: Number(values.resultadoFinal) || 0,
        saldoFinal: Number(values.saldoFinal) || 0,
        diferencia: Number(values.diferencia) || 0,
        observaciones: values.observaciones || '',
        estado: values.estado || 'activo',
      };
      
      // Validar turnoId si existe
      let turnoIdValidado = undefined;
      if (values.turnoId !== undefined) {
        turnoIdValidado = toValidId(values.turnoId);
        if (!turnoIdValidado) {
          console.warn(`[AGENT_CLOSING_FORM] ID de turno inválido: ${values.turnoId}, se omitirá`);
        }
      }
      
      // Crear objeto final para enviar a la API con tipos correctos
      const dataToSend = {
        ...formattedValues,
        turnoId: turnoIdValidado || (turnoActual ? Number(turnoActual.id) : undefined),
        usuarioId: Number(authState.user?.id), // Agregar el ID del usuario actual como número
      };
      
      // Validar que usuarioId sea un número válido
      if (!dataToSend.usuarioId || isNaN(dataToSend.usuarioId)) {
        console.error('[AGENT_CLOSING_FORM] ID de usuario no disponible o inválido:', authState.user);
        throw new Error('No se pudo obtener un ID de usuario válido');
      }
      
      console.log('[AGENT_CLOSING_FORM] ID de usuario a enviar:', dataToSend.usuarioId, typeof dataToSend.usuarioId);
      
      console.log('[AGENT_CLOSING_FORM] Datos formateados para crear:', dataToSend);
      
      // Asegurarse de que proveedorId sea un número válido para satisfacer el tipo CreateAgentClosingDto
      if (!dataToSend.proveedorId) {
        throw new Error('El ID del proveedor es requerido');
      }
      
      return agentClosingsApi.createAgentClosing(dataToSend as any);
    },
    onSuccess: (data) => {
      console.log('[AGENT_CLOSING_FORM] Cierre final creado exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['agentClosings'] });
      navigate('/agent-closings');
    },
    onError: (error: any) => {
      console.error('[AGENT_CLOSING_FORM] Error al crear cierre final:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al crear cierre final: ${errorMessage}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateAgentClosingDto }) => {
      console.log('[AGENT_CLOSING_FORM] Actualizando cierre final con ID:', id);
      console.log('[AGENT_CLOSING_FORM] Datos a enviar:', data);
      
      // Validar el ID
      const validId = toValidId(id);
      if (!validId) {
        console.error(`[AGENT_CLOSING_FORM] ID de cierre final inválido: ${id}`);
        throw new Error(`ID de cierre final inválido: ${id}`);
      }
      
      // Validar explícitamente proveedorId y resultadoFinal
      const proveedorIdValue = toValidId(data.proveedorId);
      if (!proveedorIdValue) {
        console.error(`[AGENT_CLOSING_FORM] ID de proveedor inválido en mutación: ${data.proveedorId}`);
        throw new Error(`ID de proveedor inválido: ${data.proveedorId}`);
      }
      
      const resultadoFinalValue = Number(data.resultadoFinal);
      if (isNaN(resultadoFinalValue)) {
        console.error(`[AGENT_CLOSING_FORM] Resultado final inválido en mutación: ${data.resultadoFinal}`);
        throw new Error(`Resultado final inválido: ${data.resultadoFinal}`);
      }
      
      // Asegurar que todos los campos numéricos sean números válidos
      const formattedValues = {
        proveedorId: proveedorIdValue,
        fechaCierre: data.fechaCierre && typeof data.fechaCierre === 'object' && 'getMonth' in data.fechaCierre ? format(data.fechaCierre as Date, 'yyyy-MM-dd') : data.fechaCierre,
        saldoInicial: Number(data.saldoInicial) || 0,
        adicionalCta: Number(data.adicionalCta) || 0,
        resultadoFinal: resultadoFinalValue,
        saldoFinal: Number(data.saldoFinal) || 0,
        diferencia: Number(data.diferencia) || 0,
        observaciones: data.observaciones || undefined,
        estado: data.estado || 'ACTIVO',
        // Mantener el turnoId si existe y es válido
        turnoId: data.turnoId ? toValidId(data.turnoId) : undefined,
      };
      
      // Log detallado de los valores críticos
      console.log('[AGENT_CLOSING_FORM] Valores críticos validados:');
      console.log('- proveedorId:', proveedorIdValue, typeof proveedorIdValue);
      console.log('- resultadoFinal:', resultadoFinalValue, typeof resultadoFinalValue);
      
      // Validar que proveedorId sea válido
      if (!formattedValues.proveedorId) {
        console.error(`[AGENT_CLOSING_FORM] ID de proveedor inválido: ${data.proveedorId}`);
        throw new Error('Debe seleccionar un agente válido');
      }
      
      console.log('[AGENT_CLOSING_FORM] Datos formateados para actualizar:', formattedValues);
      return agentClosingsApi.updateAgentClosing(validId, formattedValues);
    },
    onSuccess: (data) => {
      console.log('[AGENT_CLOSING_FORM] Cierre final actualizado exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['agentClosing', id] });
      queryClient.invalidateQueries({ queryKey: ['agentClosings'] });
      navigate('/agent-closings');
    },
    onError: (error: any) => {
      console.error('[AGENT_CLOSING_FORM] Error al actualizar cierre final:', error);
      
      // Extraer mensaje de error detallado de la respuesta
      let errorMessage = 'Error desconocido';
      if (error.response) {
        console.error('[AGENT_CLOSING_FORM] Detalles de la respuesta de error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Intentar obtener mensaje detallado del backend
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error al actualizar cierre final: ${errorMessage}`);
    },
  });

  // Efecto para actualizar los valores iniciales cuando se carga un cierre existente
  useEffect(() => {
    if (agentClosing && !agentClosingQuery.isLoading) {
      console.log('[AGENT_CLOSING_FORM] Cargando datos de cierre final existente:', agentClosing);
      
      try {
        // Convertir la fecha de string a objeto Date
        let fechaCierre = new Date();
        if (agentClosing.fechaCierre) {
          try {
            fechaCierre = parse(agentClosing.fechaCierre, 'yyyy-MM-dd', new Date());
          } catch (error) {
            console.error('[AGENT_CLOSING_FORM] Error al parsear la fecha:', error);
            // Si hay error al parsear, usar la fecha actual
            fechaCierre = new Date();
          }
        }
        
        // Validar el ID del proveedor
        const proveedorId = toValidId(agentClosing.proveedorId);
        if (!proveedorId) {
          console.warn('[AGENT_CLOSING_FORM] ID de proveedor inválido en cierre existente:', agentClosing.proveedorId);
        }
        
        // Validar el ID del turno si existe
        let turnoId = agentClosing.turnoId;
        if (turnoId !== undefined && turnoId !== null) {
          turnoId = toValidId(turnoId);
          if (!turnoId) {
            console.warn('[AGENT_CLOSING_FORM] ID de turno inválido en cierre existente:', agentClosing.turnoId);
            // Si el turno es inválido, intentar usar el turno actual si es válido
            turnoId = turnoActual && isValidId(turnoActual.id) ? Number(turnoActual.id) : undefined;
          }
        } else {
          // Si no hay turnoId, usar el turno actual si es válido
          turnoId = turnoActual && isValidId(turnoActual.id) ? Number(turnoActual.id) : undefined;
        }
        
        // Asegurar que proveedorId sea siempre un número válido (no undefined)
        const validProveedorId = proveedorId || 0;
        
        setInitialValues({
          proveedorId: validProveedorId,
          fechaCierre,
          // Asegurar que los valores numéricos sean números
          saldoInicial: Number(agentClosing.saldoInicial) || 0,
          adicionalCta: Number(agentClosing.adicionalCta) || 0,
          resultadoFinal: Number(agentClosing.resultadoFinal) || 0,
          saldoFinal: Number(agentClosing.saldoFinal) || 0,
          diferencia: Number(agentClosing.diferencia) || 0,
          // Asegurar que observaciones nunca sea null
          observaciones: agentClosing.observaciones || '',
          estado: agentClosing.estado || 'activo',
          // Mantener el turnoId existente o usar el turno activo
          turnoId,
        });
        
        console.log('[AGENT_CLOSING_FORM] Valores iniciales actualizados para edición:', {
          proveedorId,
          fechaCierre: format(fechaCierre, 'yyyy-MM-dd'),
          turnoId
        });
      } catch (error) {
        console.error('[AGENT_CLOSING_FORM] Error al procesar datos del cierre final:', error);
      }
    }
  }, [agentClosing, agentClosingQuery.isLoading, turnoActual]);

  const validationSchema = yup.object({
    proveedorId: yup.number().min(1, 'El agente es requerido').required('El agente es requerido'),
    fechaCierre: yup.date().required('La fecha de cierre es requerida'),
    saldoInicial: yup.number().typeError('El saldo inicial debe ser un número válido').required('El saldo inicial es requerido'),
    adicionalCta: yup.number().required('El adicional CTA es requerido'),
    resultadoFinal: yup.number().required('El resultado final es requerido'),
    saldoFinal: yup.number().required('El saldo final es requerido'),
    diferencia: yup.number().required('La diferencia es requerida'),
    observaciones: yup.string().default(''),
    estado: yup.string().required('El estado es requerido'),
  });

  // Función para abrir el diálogo de confirmación
  const openConfirmationDialog = (values: AgentClosingFormValues) => {
    setFormValuesToSubmit(values);
    setOpenConfirmDialog(true);
  };

  // Función para cerrar el diálogo de confirmación
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = (values: AgentClosingFormValues, { setSubmitting }: FormikHelpers<AgentClosingFormValues>) => {
    console.log('[AGENT_CLOSING_FORM] Valores del formulario:', values);
    
    // Asegurar que todos los valores numéricos estén correctamente formateados
    const formattedValues = {
      ...values,
      proveedorId: Number(values.proveedorId) || 0,
      saldoInicial: Number(values.saldoInicial) || 0,
      adicionalCta: Number(values.adicionalCta) || 0,
      resultadoFinal: Number(values.resultadoFinal) || 0,
      saldoFinal: Number(values.saldoFinal) || 0,
      diferencia: Number(values.diferencia) || 0
    };
    
    console.log('[AGENT_CLOSING_FORM] Valores formateados para el diálogo:', formattedValues);
    setFormValuesToSubmit(formattedValues);
    setOpenConfirmDialog(true);
    setSubmitting(false);
  };

  // Función para validar un ID numérico
  const isValidId = (id: any): boolean => {
    const numId = Number(id);
    return !isNaN(numId) && numId > 0;
  };

  // Función para convertir a ID válido o undefined
  const toValidId = (id: any): number | undefined => {
    const numId = Number(id);
    return !isNaN(numId) && numId > 0 ? numId : undefined;
  };

  // Función para procesar el envío después de la confirmación
  const handleConfirmedSubmit = async () => {
    if (!formValuesToSubmit) {
      console.error('[AGENT_CLOSING_FORM] No hay valores para enviar');
      setOpenConfirmDialog(false);
      return;
    }

    try {
      console.log('[AGENT_CLOSING_FORM] Procesando envío del formulario:', formValuesToSubmit);
      
      // Validar que el ID del proveedor sea válido
      const proveedorId = toValidId(formValuesToSubmit.proveedorId);
      if (!proveedorId) {
        console.error(`[AGENT_CLOSING_FORM] ID de proveedor inválido: ${formValuesToSubmit.proveedorId}`);
        alert('Debe seleccionar un agente válido');
        setOpenConfirmDialog(false);
        return;
      }
      
      // Validar que la fecha sea válida
      if (!formValuesToSubmit.fechaCierre) {
        console.error('[AGENT_CLOSING_FORM] Fecha de cierre inválida');
        alert('Debe seleccionar una fecha de cierre válida');
        setOpenConfirmDialog(false);
        return;
      }

      // Crear una copia de los valores del formulario para procesarlos
      const dataToSend: any = { ...formValuesToSubmit };
      
      // Eliminar campos auxiliares que no deben enviarse al backend
      if ('saldoInicialFromPreviousClosing' in dataToSend) {
        console.log('[AGENT_CLOSING_FORM] Eliminando campo auxiliar saldoInicialFromPreviousClosing antes de enviar al backend');
        delete dataToSend.saldoInicialFromPreviousClosing;
      }
      
      // Formatear la fecha a string con formato yyyy-MM-dd
      if (dataToSend.fechaCierre instanceof Date) {
        dataToSend.fechaCierre = format(dataToSend.fechaCierre, 'yyyy-MM-dd');
      } else {
        // Si no es una instancia de Date, intentar convertirla
        try {
          const parsedDate = parse(String(dataToSend.fechaCierre), 'yyyy-MM-dd', new Date());
          dataToSend.fechaCierre = format(parsedDate, 'yyyy-MM-dd');
        } catch (error) {
          console.error('[AGENT_CLOSING_FORM] Error al formatear la fecha:', error);
          dataToSend.fechaCierre = format(new Date(), 'yyyy-MM-dd');
        }
      }
      
      // Asegurar que los valores numéricos sean correctos
      dataToSend.proveedorId = proveedorId;
      dataToSend.resultadoFinal = Number(dataToSend.resultadoFinal) || 0;
      dataToSend.diferencia = Number(dataToSend.diferencia) || 0;
      dataToSend.saldoInicial = Number(dataToSend.saldoInicial) || 0;
      dataToSend.adicionalCta = Number(dataToSend.adicionalCta) || 0;
      dataToSend.saldoFinal = Number(dataToSend.saldoFinal) || 0;
      dataToSend.observaciones = dataToSend.observaciones || '';
      dataToSend.estado = dataToSend.estado || 'activo';
      
      // Validar turnoId si existe
      let turnoIdValidado = undefined;
      if (dataToSend.turnoId !== undefined) {
        turnoIdValidado = toValidId(dataToSend.turnoId);
        if (!turnoIdValidado) {
          console.warn(`[AGENT_CLOSING_FORM] ID de turno inválido: ${dataToSend.turnoId}, se usará el turno activo si está disponible`);
          delete dataToSend.turnoId;
        } else {
          dataToSend.turnoId = turnoIdValidado;
        }
      }
      
      // Asegurar que se incluya el turnoId del turno activo si no se proporcionó uno válido
      if (!dataToSend.turnoId && turnoActual && isValidId(turnoActual.id)) {
        dataToSend.turnoId = Number(turnoActual.id);
        console.log('[AGENT_CLOSING_FORM] Asignando turno activo al cierre:', turnoActual.id);
      }
      
      console.log('[AGENT_CLOSING_FORM] Datos finales a enviar:', dataToSend);
      
      try {
        // Si estamos editando, usar updateMutation
        if (id) {
          const validId = toValidId(id);
          if (!validId) {
            throw new Error(`ID de cierre final inválido: ${id}`);
          }
          console.log(`[AGENT_CLOSING_FORM] Actualizando cierre final con ID: ${validId}`);
          
          // Validar explícitamente proveedorId y resultadoFinal
          const proveedorIdValue = toValidId(dataToSend.proveedorId);
          if (!proveedorIdValue) {
            console.error(`[AGENT_CLOSING_FORM] ID de proveedor inválido en handleConfirmedSubmit: ${dataToSend.proveedorId}`);
            throw new Error(`ID de proveedor inválido: ${dataToSend.proveedorId}`);
          }
          
          // IMPORTANTE: Asegurarse de que resultadoFinal sea el valor más actualizado
          // Si se cambió el proveedor, es posible que el resultadoFinal en el formulario
          // sea el valor calculado más reciente, que es el que debemos usar
          const resultadoFinalValue = Number(dataToSend.resultadoFinal);
          if (isNaN(resultadoFinalValue)) {
            console.error(`[AGENT_CLOSING_FORM] Resultado final inválido en handleConfirmedSubmit: ${dataToSend.resultadoFinal}`);
            throw new Error(`Resultado final inválido: ${dataToSend.resultadoFinal}`);
          }
          
          // Log adicional para verificar el valor de resultadoFinal antes de la actualización
          console.log(`[AGENT_CLOSING_FORM] Valor de resultadoFinal antes de actualizar: ${resultadoFinalValue}`);
          console.log(`[AGENT_CLOSING_FORM] Tipo de resultadoFinal antes de actualizar: ${typeof resultadoFinalValue}`);
          console.log(`[AGENT_CLOSING_FORM] Valor original en dataToSend: ${dataToSend.resultadoFinal}`);
          console.log(`[AGENT_CLOSING_FORM] Tipo original en dataToSend: ${typeof dataToSend.resultadoFinal}`);
          
          
          // Crear objeto final para actualizar, asegurando que todos los campos numéricos sean números válidos
          // IMPORTANTE: NO incluir la propiedad 'id' en el objeto que se envía al backend
          const updateData = {
            // IMPORTANTE: Asegurar que proveedorId y resultadoFinal se envíen como números válidos
            // El backend recalcula resultadoFinal si cambia proveedorId o fechaCierre
            proveedorId: proveedorIdValue,
            fechaCierre: dataToSend.fechaCierre,
            saldoInicial: Number(dataToSend.saldoInicial) || 0,
            adicionalCta: Number(dataToSend.adicionalCta) || 0,
            // CLAVE: Asegurar que resultadoFinal se envíe como número válido
            resultadoFinal: resultadoFinalValue,
            saldoFinal: Number(dataToSend.saldoFinal) || 0,
            diferencia: Number(dataToSend.diferencia) || 0,
            observaciones: dataToSend.observaciones,
            // Incluir el estado del cierre
            estado: dataToSend.estado || 'ACTIVO',
            // Solo incluir turnoId si es válido
            turnoId: dataToSend.turnoId ? Number(dataToSend.turnoId) : undefined
          };
          
          // Eliminar campos auxiliares que no deben enviarse al backend
          if ('saldoInicialFromPreviousClosing' in updateData) {
            console.log('[AGENT_CLOSING_FORM] Eliminando campo auxiliar saldoInicialFromPreviousClosing del objeto updateData');
            delete updateData.saldoInicialFromPreviousClosing;
          }
          
          // Log detallado de los valores críticos
          console.log('[AGENT_CLOSING_FORM] Valores críticos validados en handleConfirmedSubmit:');
          console.log('- proveedorId:', proveedorIdValue, typeof proveedorIdValue);
          console.log('- resultadoFinal:', resultadoFinalValue, typeof resultadoFinalValue);
          
          console.log('[AGENT_CLOSING_FORM] Datos finales para actualizar (después de conversión de tipos):', updateData);
          
          // Validación final para asegurar que los valores críticos estén presentes
          if (!updateData.proveedorId || updateData.proveedorId <= 0) {
            console.error('[AGENT_CLOSING_FORM] proveedorId inválido antes de enviar:', updateData.proveedorId);
            throw new Error(`ID de proveedor inválido antes de enviar: ${updateData.proveedorId}`);
          }
          
          if (isNaN(updateData.resultadoFinal)) {
            console.error('[AGENT_CLOSING_FORM] resultadoFinal inválido antes de enviar:', updateData.resultadoFinal);
            throw new Error(`Resultado final inválido antes de enviar: ${updateData.resultadoFinal}`);
          }
          
          // Asegurarse de que la mutación reciba el ID y los datos correctamente
          await updateMutation.mutateAsync({
            id: validId,
            data: updateData
          });
          
          // Log adicional para confirmar que se envió correctamente
          console.log('[AGENT_CLOSING_FORM] Datos enviados correctamente al backend:', {
            id: validId,
            proveedorId: updateData.proveedorId,
            resultadoFinal: updateData.resultadoFinal
          });
          
          // Mostrar mensaje de éxito
          alert(`Cierre final actualizado correctamente`);
          
          // Invalidar consultas para actualizar la lista
          queryClient.invalidateQueries({queryKey: ['agentClosings']});
          queryClient.invalidateQueries({queryKey: ['agentClosing', validId]});
          
          // Navegar a la lista de cierres finales
          navigate('/agent-closings');
        } else {
          // Si estamos creando, usar createMutation
          console.log('[AGENT_CLOSING_FORM] Creando nuevo cierre final');
          await createMutation.mutateAsync(dataToSend as any);
          
          // Mostrar mensaje de éxito
          alert('Cierre final creado correctamente');
          
          // Invalidar consultas para actualizar la lista
          queryClient.invalidateQueries({queryKey: ['agentClosings']});
          
          // Navegar a la lista de cierres finales
          navigate('/agent-closings');
        }
      } catch (mutationError: any) {
        // Reducimos los logs de consola para evitar sobrecarga
        // Solo registramos información esencial para depuración
        
        // Extraer mensaje de error detallado de la respuesta
        let errorMessage = 'Error desconocido';
        let errorDetails = '';
        
        if (mutationError.response) {
          // Solo registramos el código de estado y el mensaje principal
          console.error(`[AGENT_CLOSING_FORM] Error API ${mutationError.response.status}: ${mutationError.response.data?.message || mutationError.response.statusText}`);
          
          // Intentar obtener mensaje detallado del backend
          errorMessage = mutationError.response.data?.message || 
                        mutationError.response.data?.error || 
                        `Error ${mutationError.response.status}: ${mutationError.response.statusText}`;
          
          // Verificar si es un error de cierre duplicado
          if (errorMessage.includes('Ya existe un cierre para este agente') || 
              errorMessage.includes('mismo día') || 
              errorMessage.includes('mismo turno')) {
            
            // Mensaje más amigable para el usuario
            errorDetails = 'Ya existe un cierre para este agente en esta fecha y turno. ' + 
                          'Por favor, seleccione otro turno o modifique la fecha.';
            
            // Mostrar mensaje específico en Snackbar
            showSnackbar(errorDetails, 'warning');
          } else {
            // Otros errores
            showSnackbar(`Error al guardar el cierre final: ${errorMessage}`, 'error');
          }
        } else if (mutationError.message) {
          errorMessage = mutationError.message;
          showSnackbar(`Error al guardar el cierre final: ${errorMessage}`, 'error');
        } else {
          showSnackbar('Error desconocido al guardar el cierre final', 'error');
        }
      }

      // Cerrar el diálogo de confirmación
      setOpenConfirmDialog(false);
    } catch (error: any) {
      console.error('[AGENT_CLOSING_FORM] Error al procesar el formulario:', error);
      
      // Mostrar más detalles del error
      if (error.response) {
        console.error('[AGENT_CLOSING_FORM] Error de respuesta:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Error en la respuesta del servidor'}`);
      } else if (error.request) {
        console.error('[AGENT_CLOSING_FORM] Error de solicitud:', error.request);
        alert('Error: No se pudo conectar con el servidor');
      } else {
        console.error('[AGENT_CLOSING_FORM] Error al configurar la solicitud:', error.message);
        alert(`Error: ${error.message || 'Error desconocido'}`);
      }
      
      // Cerrar el diálogo en caso de error
      setOpenConfirmDialog(false);
    }
  };
  
  // Función para obtener el saldo inicial del agente seleccionado (transacción tipo Saldo Inicial)
  const getSaldoInicial = async (
    proveedorId: number,
    setFieldValue: any
  ) => {
    // Validar que el ID del proveedor sea válido
    if (!isValidId(proveedorId)) {
      console.warn('[AGENT_CLOSING_FORM] ID de proveedor inválido para obtener saldo inicial:', proveedorId);
      return { fromPreviousClosing: false };
    }
    
    // Verificar si el agente es EFECTIVO AGENTE
    const selectedProvider = providers?.find(provider => provider.id === proveedorId);
    const isEfectivoAgente = selectedProvider?.nombre === 'EFECTIVO AGENTE';
    
    console.log(`[AGENT_CLOSING_FORM] Agente seleccionado: ${selectedProvider?.nombre}, Es EFECTIVO AGENTE: ${isEfectivoAgente ? 'Sí' : 'No'}`);

    try {
      console.log(`[AGENT_CLOSING_FORM] Obteniendo saldo inicial para proveedor ID: ${proveedorId}`);
      
      // 1. Primero verificar si hay un cierre anterior del mismo agente en el mismo día
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      
      // Obtener todos los cierres de hoy
      console.log(`[AGENT_CLOSING_FORM] Buscando cierres previos para la fecha: ${formattedDate}`);
      const closings = await agentClosingsApi.getAllAgentClosings(formattedDate, formattedDate);
      
      // Filtrar por el mismo agente y ordenar por ID (asumiendo que IDs mayores son más recientes)
      const agentClosings = closings
        .filter(closing => closing.proveedorId === proveedorId)
        .sort((a, b) => b.id - a.id); // Ordenar de más reciente a más antiguo
      
      // Si hay cierres previos del mismo agente hoy, usar el resultado final o saldo final según corresponda
      if (agentClosings.length > 0) {
        const previousClosing = agentClosings[0]; // El más reciente
        
        // Si es EFECTIVO AGENTE, usar el saldo final; de lo contrario, usar el resultado final
        let valorInicial;
        if (isEfectivoAgente) {
          valorInicial = Number(previousClosing.saldoFinal) || 0;
          console.log(`[AGENT_CLOSING_FORM] Agente EFECTIVO AGENTE: usando Saldo Final (${valorInicial}) del cierre previo ID: ${previousClosing.id}`);
        } else {
          valorInicial = Number(previousClosing.resultadoFinal) || 0;
          console.log(`[AGENT_CLOSING_FORM] Agente regular: usando Resultado Final (${valorInicial}) del cierre previo ID: ${previousClosing.id}`);
        }
        
        setFieldValue('saldoInicial', valorInicial);
        
        // Indicar que el saldo inicial proviene de un cierre previo
        setFieldValue('saldoInicialFromPreviousClosing', true, false);
        console.log('[AGENT_CLOSING_FORM] Saldo inicial proviene de un cierre previo');
        
        return { fromPreviousClosing: true, value: valorInicial };
      }
      
      // 2. Si no hay cierres previos hoy, seguir con la lógica original
      console.log('[AGENT_CLOSING_FORM] No se encontraron cierres previos hoy, buscando transacción de Saldo Inicial');
      
      // Indicar que el saldo inicial NO proviene de un cierre previo
      setFieldValue('saldoInicialFromPreviousClosing', false, false);
      
      // Obtener todas las transacciones del agente
      const transactions = await transactionsApi.getByAgent(proveedorId);
      
      // Filtrar transacciones activas (estado = 1)
      const activeTrans = transactions.filter(transaction => transaction.estado === 1);
      
      // Buscar la transacción de tipo Saldo Inicial por el nombre del tipo de transacción
      const saldoInicialTransaction = activeTrans.find(transaction => 
        transaction.tipoTransaccion && 
        transaction.tipoTransaccion.nombre && 
        transaction.tipoTransaccion.nombre.toLowerCase().includes('saldo inicial')
      );
      
      // Si no se encuentra por nombre, intentar buscar por ID (asumiendo que el ID 1 podría ser Saldo Inicial)
      if (!saldoInicialTransaction) {
        const saldoInicialByIdTransaction = activeTrans.find(
          transaction => isValidId(transaction.tipoTransaccionId) && transaction.tipoTransaccionId === 1
        );
        
        if (saldoInicialByIdTransaction) {
          const saldoValue = Number(saldoInicialByIdTransaction.valor) || 0;
          setFieldValue('saldoInicial', saldoValue);
          console.log('[AGENT_CLOSING_FORM] Saldo Inicial encontrado por ID:', saldoValue);
          return { fromPreviousClosing: false, value: saldoValue };
        }
      } else {
        // Si se encuentra por nombre, actualizar el campo saldoInicial
        const saldoValue = Number(saldoInicialTransaction.valor) || 0;
        setFieldValue('saldoInicial', saldoValue);
        console.log('[AGENT_CLOSING_FORM] Saldo Inicial encontrado por nombre:', saldoValue);
        return { fromPreviousClosing: false, value: saldoValue };
      }
      
      // Si llegamos aquí, no se encontró ninguna transacción de Saldo Inicial
      console.log('[AGENT_CLOSING_FORM] No se encontró transacción de Saldo Inicial para este agente');
      setFieldValue('saldoInicial', 0);
      return { fromPreviousClosing: false, value: 0 };
      
    } catch (error) {
      console.error('[AGENT_CLOSING_FORM] Error al obtener el saldo inicial:', error);
      setFieldValue('saldoInicial', 0);
      return { fromPreviousClosing: false, value: 0 };
    }
  };

  // Función para obtener el conteo de efectivo de la fecha seleccionada, turno actual y usuario actual
  const getCashCountForCurrentUser = async (
    fechaCierre: Date | string,
    setFieldValue: any
  ) => {
    try {
      // Verificar que tenemos un usuario autenticado y un turno activo
      if (!authState?.user?.id || !isValidId(authState.user.id)) {
        console.warn('[AGENT_CLOSING_FORM] No hay usuario autenticado para buscar conteo de efectivo');
        return null;
      }

      if (!turnoActual?.id || !isValidId(turnoActual.id)) {
        console.warn('[AGENT_CLOSING_FORM] No hay turno activo para buscar conteo de efectivo');
        return null;
      }

      const usuarioId = authState.user.id;
      const turnoId = turnoActual.id;
      
      // Obtener la fecha de cierre seleccionada en formato YYYY-MM-DD
      let fechaSeleccionada = '';
      if (typeof fechaCierre === 'string') {
        // Si es string, extraer la parte de la fecha (antes de la T)
        const partes = fechaCierre.split('T');
        fechaSeleccionada = partes.length > 0 ? partes[0] : '';
      } else if (fechaCierre instanceof Date) {
        // Si es Date, formatear a yyyy-MM-dd
        fechaSeleccionada = format(fechaCierre, 'yyyy-MM-dd');
      } else {
        // Si no es un formato válido, usar la fecha actual
        fechaSeleccionada = format(new Date(), 'yyyy-MM-dd');
      }
      
      console.log(`[AGENT_CLOSING_FORM] Buscando conteo de efectivo para fecha ${fechaSeleccionada}, usuario ${usuarioId}, turno ${turnoId}`);

      // Obtener todos los conteos de efectivo (sin filtrar por turno inicialmente)
      const todosLosBilletes = await cashApi.getAllBilletes();
      
      if (!todosLosBilletes || todosLosBilletes.length === 0) {
        console.log('[AGENT_CLOSING_FORM] No se encontraron conteos de efectivo');
        return null;
      }
      
      console.log(`[AGENT_CLOSING_FORM] Se encontraron ${todosLosBilletes.length} conteos en total`);
      
      // Filtrar por usuario actual, fecha seleccionada (ignorando la hora) y estado activo
      const billetesFiltrados = todosLosBilletes.filter(billete => {
        // Verificar que el conteo pertenece al usuario actual
        const esDelUsuario = billete.usuarioId === usuarioId;
        
        // Verificar que el conteo está activo (si el campo existe)
        // Si el campo estado no existe, asumimos que está activo por defecto
        const estaActivo = billete.estado === undefined ? true : billete.estado === true;
        
        // Verificar que la fecha coincide con la fecha seleccionada (solo la parte de fecha, no la hora)
        let fechaBillete = '';
        
        // Función segura para extraer la fecha de un string o Date, considerando la zona horaria local
        const extraerFecha = (valor: any): string => {
          if (!valor) return '';
          
          try {
            let fecha;
            
            if (typeof valor === 'string') {
              // Crear un objeto Date a partir del string
              fecha = new Date(valor);
            } else if (valor instanceof Date) {
              fecha = valor;
            } else {
              // Intentar convertir a Date si es otro tipo
              fecha = new Date(valor);
            }
            
            // Verificar si la fecha es válida
            if (isNaN(fecha.getTime())) {
              console.error('[AGENT_CLOSING_FORM] Fecha inválida:', valor);
              return '';
            }
            
            // Obtener la fecha en la zona horaria local (sin ajustar por UTC)
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            
            // Formatear como YYYY-MM-DD
            return `${year}-${month}-${day}`;
          } catch (error) {
            console.error('[AGENT_CLOSING_FORM] Error al formatear fecha:', error, valor);
            return '';
          }
        };
        
        // Intentar obtener la fecha del registro, primero de fechaRegistro y luego de fecha
        if (billete.fechaRegistro) {
          fechaBillete = extraerFecha(billete.fechaRegistro);
        } else if (billete.fecha) {
          fechaBillete = extraerFecha(billete.fecha);
        }
        
        // Verificar si la fecha del billete coincide con la fecha seleccionada
        const coincideFecha = fechaBillete === fechaSeleccionada;
        
        // Verificar si el conteo pertenece al turno actual
        // Puede ser que el turnoId esté directamente en el billete o que no esté
        const coincideTurno = billete.turnoId === turnoId || !billete.turnoId; // Si no tiene turnoId, lo incluimos para revisar
        
        // Mostrar información detallada para depuración
        if (esDelUsuario) {
          console.log(`[AGENT_CLOSING_FORM] Conteo ID ${billete.id}: Usuario ${esDelUsuario ? 'coincide' : 'no coincide'}, ` +
                    `Fecha billete ${fechaBillete}, fecha seleccionada ${fechaSeleccionada}, coincide fecha: ${coincideFecha}, ` +
                    `Turno billete: ${billete.turnoId || 'no definido'}, turno actual: ${turnoId}, coincide turno: ${coincideTurno}, ` +
                    `Estado: ${billete.estado === undefined ? 'no definido (asumido activo)' : billete.estado ? 'activo' : 'inactivo'}, ` +
                    `Está activo: ${estaActivo ? 'sí' : 'no'}`);
        }
        
        return esDelUsuario && coincideFecha && estaActivo;
      });
      
      console.log(`[AGENT_CLOSING_FORM] Se encontraron ${billetesFiltrados.length} conteos activos para este usuario en la fecha seleccionada`);
      
      // Si no hay conteos para la fecha seleccionada, intentar buscar el más reciente sin importar la fecha
      if (billetesFiltrados.length === 0) {
        console.log('[AGENT_CLOSING_FORM] No se encontró conteo de efectivo para la fecha seleccionada. Buscando el más reciente...');
        
        // Filtrar por usuario y estado activo
        const billetesPorUsuario = todosLosBilletes.filter(billete => {
          const esDelUsuario = billete.usuarioId === usuarioId;
          const estaActivo = billete.estado === undefined ? true : billete.estado === true;
          return esDelUsuario && estaActivo;
        });
        
        if (billetesPorUsuario.length === 0) {
          console.log('[AGENT_CLOSING_FORM] No se encontraron conteos de efectivo para este usuario');
          return null;
        }
        
        // Ordenar por fecha de registro (más reciente primero)
        billetesPorUsuario.sort((a, b) => {
          const fechaA = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 
                      a.fecha ? new Date(a.fecha).getTime() : 0;
          const fechaB = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 
                      b.fecha ? new Date(b.fecha).getTime() : 0;
          return fechaB - fechaA; // Orden descendente (más reciente primero)
        });
        
        // Tomar el conteo más reciente
        const conteoMasReciente = billetesPorUsuario[0];
        
        if (conteoMasReciente && isValidId(conteoMasReciente.id)) {
          console.log(`[AGENT_CLOSING_FORM] Se encontró el conteo más reciente: ID ${conteoMasReciente.id}, ` +
                    `Total General: ${conteoMasReciente.totalGeneral}, ` +
                    `Fecha: ${conteoMasReciente.fechaRegistro || conteoMasReciente.fecha}, ` +
                    `Usuario: ${conteoMasReciente.usuarioId}, ` +
                    `Turno: ${conteoMasReciente.turnoId || 'no definido'}`);
          return conteoMasReciente;
        } else {
          console.log('[AGENT_CLOSING_FORM] No se encontró un conteo de efectivo válido');
          return null;
        }
      }
      
      // Si hay varios conteos para la fecha seleccionada, ordenar por fecha de registro (más reciente primero)
      billetesFiltrados.sort((a, b) => {
        const fechaA = a.fechaRegistro ? new Date(a.fechaRegistro).getTime() : 
                     a.fecha ? new Date(a.fecha).getTime() : 0;
        const fechaB = b.fechaRegistro ? new Date(b.fechaRegistro).getTime() : 
                     b.fecha ? new Date(b.fecha).getTime() : 0;
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });
      
      // Tomar el conteo más reciente
      const conteoMasReciente = billetesFiltrados[0];
      
      if (conteoMasReciente && isValidId(conteoMasReciente.id)) {
        console.log(`[AGENT_CLOSING_FORM] Conteo de efectivo encontrado: ID ${conteoMasReciente.id}, ` +
                  `Total General: ${conteoMasReciente.totalGeneral}, ` +
                  `Fecha: ${conteoMasReciente.fechaRegistro || conteoMasReciente.fecha}, ` +
                  `Usuario: ${conteoMasReciente.usuarioId}, ` +
                  `Turno: ${conteoMasReciente.turnoId || 'no definido'}`);
        return conteoMasReciente;
      } else {
        console.log('[AGENT_CLOSING_FORM] No se encontró un conteo de efectivo válido');
        return null;
      }
    } catch (error) {
      console.error('[AGENT_CLOSING_FORM] Error al buscar conteo de efectivo:', error);
      return null;
    }
  };

  // Función para calcular el resultado final cuando se selecciona un agente
  const calculateResultadoFinal = async (
    proveedorId: number,
    fechaCierre: Date | string,
    setFieldValue: any,
    currentValues?: any // Añadimos un parámetro para recibir los valores actuales del formulario
  ) => {
    // Validar que el ID del proveedor sea válido
    if (!isValidId(proveedorId)) {
      console.warn('[AGENT_CLOSING_FORM] ID de proveedor inválido para calcular resultado final:', proveedorId);
      setFieldValue('resultadoFinal', 0);
      return;
    }

    // Convertir la fecha a objeto Date si es una cadena
    let fechaCierreDate: Date;
    if (typeof fechaCierre === 'string') {
      try {
        fechaCierreDate = parse(fechaCierre, 'yyyy-MM-dd', new Date());
      } catch (error) {
        console.warn('[AGENT_CLOSING_FORM] Error al convertir fecha de string a Date:', error);
        setFieldValue('resultadoFinal', 0);
        return;
      }
    } else {
      fechaCierreDate = fechaCierre;
    }
    
    // Validar que la fecha sea válida
    if (!fechaCierreDate || isNaN(fechaCierreDate.getTime())) {
      console.warn('[AGENT_CLOSING_FORM] Fecha inválida para calcular resultado final:', fechaCierre);
      setFieldValue('resultadoFinal', 0);
      return;
    }

    try {
      // Crear fechas usando el constructor explícito para evitar problemas de zona horaria
      // Primer día del mes
      const primerDiaMes = new Date(fechaCierreDate.getFullYear(), fechaCierreDate.getMonth(), 1);
      const startDate = format(primerDiaMes, 'yyyy-MM-dd');
      // Fecha de cierre
      const endDate = format(fechaCierreDate, 'yyyy-MM-dd');
      
      console.log(`[AGENT_CLOSING_FORM] Calculando resultado final para agente ${proveedorId} desde ${startDate} hasta ${endDate}`);

      // Primero, obtener el saldo inicial y verificar si proviene de un cierre previo
      const saldoInicialResult = await getSaldoInicial(proveedorId, setFieldValue);
      const saldoInicial = saldoInicialResult.value || 0;
      const fromPreviousClosing = saldoInicialResult.fromPreviousClosing || false;
      
      console.log(`[AGENT_CLOSING_FORM] Saldo inicial: ${saldoInicial}, Proviene de cierre previo: ${fromPreviousClosing}`);

      // Obtener el resultado final calculado para el turno actual
      const resultadoFinalResponse = await agentClosingsApi.calculateResultadoFinal(proveedorId, startDate, endDate);
      
      // Asegurar que el resultado sea un número válido
      let resultadoFinal = Number(resultadoFinalResponse) || 0;
      console.log(`[AGENT_CLOSING_FORM] Resultado final calculado para el turno actual: ${resultadoFinal}`);
      
      // Si el saldo inicial proviene de un cierre previo, sumarlo al resultado final
      if (fromPreviousClosing) {
        resultadoFinal += saldoInicial;
        console.log(`[AGENT_CLOSING_FORM] Sumando saldo inicial (${saldoInicial}) al resultado final. Nuevo resultado final: ${resultadoFinal}`);
      }

      // Actualizar el campo resultadoFinal y luego la diferencia
      console.log(`[AGENT_CLOSING_FORM] Actualizando resultadoFinal a ${resultadoFinal}`);
      
      // Obtener el valor actual de saldoFinal de los valores pasados
      const currentSaldoFinal = currentValues && typeof currentValues.saldoFinal !== 'undefined' 
        ? Number(currentValues.saldoFinal) 
        : 0;
      
      console.log(`[AGENT_CLOSING_FORM] Valor actual de saldoFinal: ${currentSaldoFinal}`);
      
      // Primero actualizamos resultadoFinal
      setFieldValue('resultadoFinal', resultadoFinal, false);
      
      // Luego calculamos y actualizamos la diferencia
      const diferencia = currentSaldoFinal - resultadoFinal;
      console.log(`[AGENT_CLOSING_FORM] Calculando diferencia: ${currentSaldoFinal} - ${resultadoFinal} = ${diferencia}`);
      
      // Actualizar el campo diferencia
      setFieldValue('diferencia', diferencia);
    } catch (error) {
      console.error('[AGENT_CLOSING_FORM] Error al calcular el resultado final:', error);
      setFieldValue('resultadoFinal', 0);
      // Recalcular la diferencia con el valor por defecto
      const currentValues = setFieldValue.values || {};
      calculateDifference({
        ...currentValues,
        resultadoFinal: 0,
      }, setFieldValue);
    }
  };

  // Calcular diferencia automáticamente cuando cambian los valores
  const calculateDifference = (values: AgentClosingFormValues, setFieldValue: any) => {
    try {
      // Convertir y validar que los valores sean números válidos
      const resultadoFinal = Number(values.resultadoFinal);
      const saldoFinal = Number(values.saldoFinal);
      const adicionalCta = Number(values.adicionalCta);
      
      // Verificar que no sean NaN
      if (isNaN(resultadoFinal) || isNaN(saldoFinal) || isNaN(adicionalCta)) {
        console.warn('[AGENT_CLOSING_FORM] Valores inválidos para calcular diferencia:', {
          resultadoFinal: values.resultadoFinal,
          saldoFinal: values.saldoFinal,
          adicionalCta: values.adicionalCta
        });
        // Si hay valores inválidos, establecer diferencia en 0
        setFieldValue('diferencia', 0);
        return;
      }
      
      // Calcular la diferencia: Saldo Final - Resultado Final
      const diferencia = saldoFinal - resultadoFinal;
      console.log(`[AGENT_CLOSING_FORM] Diferencia calculada: ${diferencia} = ${saldoFinal} - ${resultadoFinal}`);
      
      // Actualizar el campo diferencia con el valor calculado
      setFieldValue('diferencia', diferencia);
    } catch (error) {
      console.error('[AGENT_CLOSING_FORM] Error al calcular diferencia:', error);
      setFieldValue('diferencia', 0);
    }
  };

  // Verificar si se están cargando datos
  if (providersQuery.isLoading || (id && agentClosingQuery.isLoading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card elevation={2} sx={{ 
        borderRadius: '8px', 
        overflow: 'hidden',
        '& .MuiOutlinedInput-root:focus-within': {
          '& > fieldset': {
            borderColor: '#dc7633'
          }
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#dc7633'
        },
        '& .MuiFormLabel-root.Mui-focused': {
          color: '#dc7633'
        }
      }}>
        <CardHeader
          title={id ? 'Editar Cierre Final' : 'Agregar Cierre Final'}
          sx={{ bgcolor: '#dc7633', color: 'white' }}
        />
        <CardContent>
          {/* Panel informativo del turno activo */}
          <Box 
            sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: turnoActual ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
              borderRadius: 1,
              border: turnoActual ? '1px solid rgba(76, 175, 80, 0.5)' : '1px solid rgba(244, 67, 54, 0.5)'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {turnoActual ? 'Turno Activo:' : 'No hay turno activo'}
            </Typography>
            {turnoLoading ? (
              <CircularProgress size={20} sx={{ ml: 1 }} />
            ) : turnoActual ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {turnoActual.nombre}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Hora inicio:</strong> {turnoActual.horaInicio}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Hora fin:</strong> {turnoActual.horaFin}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="primary">
                    Este cierre final se asociará automáticamente con el turno activo.
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="error">
                No hay un turno activo en este momento. Se recomienda activar un turno antes de crear un cierre final.
              </Typography>
            )}
          </Box>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, resetForm }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Agente</Typography>
                    <FormControl fullWidth error={touched.proveedorId && Boolean(errors.proveedorId)}>
                      <InputLabel id="proveedorId-label">Agente</InputLabel>
                      <Field
                        as={Select}
                        labelId="proveedor-label"
                        id="proveedorId"
                        name="proveedorId"
                        label="Agente"
                        onChange={async (e: React.ChangeEvent<{ value: unknown }>) => {
                          const newProveedorId = e.target.value as number;
                          
                          // Si estamos en modo edición (id existe) y el usuario intenta cambiar el agente
                          if (id && agentClosing && agentClosing.proveedorId !== newProveedorId) {
                            // Mostrar notificación y mantener el agente original
                            alert('No se permite cambiar el agente en un cierre existente. Si necesita cambiar el agente, debe crear un nuevo cierre.');
                            
                            console.log('[AGENT_CLOSING_FORM] Intento de cambio de agente bloqueado. Refrescando formulario...');
                            
                            // Refrescar el formulario completo invalidando la consulta y recargando los datos
                            queryClient.invalidateQueries({ queryKey: ['agentClosing', id] });
                            
                            // Esperar un momento y luego recargar los datos del cierre
                            setTimeout(() => {
                              agentClosingQuery.refetch();
                            }, 100);
                            
                            return;
                          }
                          
                          // Si estamos en modo creación o el agente es el mismo, proceder normalmente
                          console.log('[AGENT_CLOSING_FORM] Refrescando formulario al cambiar de agente...');
                          
                          // Resetear completamente el formulario, manteniendo solo fechaCierre y el nuevo proveedorId
                          const fechaCierre = values.fechaCierre;
                          resetForm();
                          
                          // Restaurar la fecha de cierre y establecer el nuevo proveedorId
                          setFieldValue('fechaCierre', fechaCierre);
                          setFieldValue('proveedorId', newProveedorId);
                          
                          // Establecer valores por defecto para los demás campos
                          setFieldValue('saldoInicial', 0);
                          setFieldValue('adicionalCta', 0);
                          setFieldValue('resultadoFinal', 0);
                          setFieldValue('saldoFinal', 0);
                          setFieldValue('diferencia', 0);
                          setFieldValue('observaciones', '');
                          
                          // Mostrar notificación de refresco
                          setSnackbarMessage('Formulario refrescado al cambiar de agente');
                          setSnackbarOpen(true);
                          
                          // Solo si se selecciona un agente válido, calcular el resultado final
                          if (newProveedorId > 0) {
                            // Buscar el proveedor seleccionado para verificar si es "EFECTIVO AGENTE"
                            const selectedProvider = providers?.find(provider => provider.id === newProveedorId);
                            
                            // Variable para almacenar el conteo de efectivo si se encuentra
                            let conteoEfectivoEncontrado = null;
                            
                            if (selectedProvider && selectedProvider.nombre === 'EFECTIVO AGENTE') {
                              console.log('[AGENT_CLOSING_FORM] Agente EFECTIVO AGENTE seleccionado. Buscando conteo de efectivo...');
                              
                              // Buscar conteo de efectivo del mismo día, turno y usuario
                              const conteoEfectivo = await getCashCountForCurrentUser(values.fechaCierre, setFieldValue);
                              
                              if (conteoEfectivo && isValidId(conteoEfectivo.id)) {
                                console.log(`[AGENT_CLOSING_FORM] Conteo de efectivo encontrado. Asignando Total General ${conteoEfectivo.totalGeneral} al Saldo Final`);
                                
                                // Asignar el Total General del conteo de efectivo al campo Saldo Final
                                setFieldValue('saldoFinal', conteoEfectivo.totalGeneral);
                                
                                // Guardar referencia al conteo encontrado
                                conteoEfectivoEncontrado = conteoEfectivo;
                                
                                // Mostrar mensaje informativo con más detalles
                                const fechaFormateada = conteoEfectivo.fechaRegistro 
                                  ? format(new Date(conteoEfectivo.fechaRegistro), 'dd/MM/yyyy HH:mm')
                                  : conteoEfectivo.fecha
                                    ? format(new Date(conteoEfectivo.fecha), 'dd/MM/yyyy HH:mm')
                                    : 'fecha no disponible';
                                
                                alert(`Se ha cargado automáticamente el Total General del conteo de efectivo (${conteoEfectivo.totalGeneral}) en el campo Saldo Final.\n\nDetalles del conteo:\n- Fecha: ${fechaFormateada}\n- ID: ${conteoEfectivo.id}`);
                              } else {
                                console.log('[AGENT_CLOSING_FORM] No se encontró conteo de efectivo para el día, turno y usuario actual.');
                              }
                            }
                            
                            // Calcular el resultado final basado en el proveedor seleccionado y pasar los valores actuales
                            await calculateResultadoFinal(
                              newProveedorId, 
                              values.fechaCierre, 
                              setFieldValue, 
                              {
                                ...values,
                                saldoFinal: conteoEfectivoEncontrado?.totalGeneral || values.saldoFinal
                              }
                            );
                            
                            // Ya no necesitamos llamar a calculateDifference aquí porque se llama dentro de calculateResultadoFinal
                          }
                        }}
                      >
                        <MenuItem value={0}>Seleccione un agente</MenuItem>
                        {providers?.map((provider) => (
                          <MenuItem key={provider.id} value={provider.id}>
                            {provider.nombre}
                          </MenuItem>
                        ))}
                      </Field>
                      <ErrorMessage name="proveedorId" component={FormHelperText} />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Saldo Inicial (L)</Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      id="saldoInicial"
                      name="saldoInicial"
                      type="number"
                      InputProps={{
                        inputProps: { step: 0.01 },
                        // Añadir un indicador visual para mostrar que el valor se obtiene automáticamente
                        startAdornment: values.proveedorId > 0 ? (
                          <InputAdornment position="start">
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>Auto</span>
                          </InputAdornment>
                        ) : null,
                      }}
                      error={touched.saldoInicial && Boolean(errors.saldoInicial)}
                      helperText={touched.saldoInicial && errors.saldoInicial}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('saldoInicial', parseFloat(e.target.value) || 0);
                        calculateDifference(
                          { ...values, saldoInicial: parseFloat(e.target.value) || 0 },
                          setFieldValue
                        );
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} style={{ display: 'none' }}>
                    <Typography variant="subtitle1" gutterBottom>Adicional CTA (L)</Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      id="adicionalCta"
                      name="adicionalCta"
                      type="number"
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 },
                      }}
                      error={touched.adicionalCta && Boolean(errors.adicionalCta)}
                      helperText={touched.adicionalCta && errors.adicionalCta}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('adicionalCta', parseFloat(e.target.value) || 0);
                        calculateDifference(
                          { ...values, adicionalCta: parseFloat(e.target.value) || 0 },
                          setFieldValue
                        );
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Resultado Final (L)</Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      id="resultadoFinal"
                      name="resultadoFinal"
                      type="number"
                      InputProps={{
                        readOnly: true,
                        inputProps: { min: 0, step: 0.01 },
                      }}
                      error={touched.resultadoFinal && Boolean(errors.resultadoFinal)}
                      helperText={touched.resultadoFinal && errors.resultadoFinal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('resultadoFinal', parseFloat(e.target.value) || 0);
                        calculateDifference(
                          { ...values, resultadoFinal: parseFloat(e.target.value) || 0 },
                          setFieldValue
                        );
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Saldo Final (L)</Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      id="saldoFinal"
                      name="saldoFinal"
                      type="number"
                      InputProps={{
                        inputProps: { min: 0, step: 0.01 },
                      }}
                      error={touched.saldoFinal && Boolean(errors.saldoFinal)}
                      helperText={touched.saldoFinal && errors.saldoFinal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('saldoFinal', parseFloat(e.target.value) || 0);
                        calculateDifference(
                          { ...values, saldoFinal: parseFloat(e.target.value) || 0 },
                          setFieldValue
                        );
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Diferencia (L)</Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      id="diferencia"
                      name="diferencia"
                      type="number"
                      InputProps={{
                        readOnly: true,
                        inputProps: { step: 0.01 },
                      }}
                      error={touched.diferencia && Boolean(errors.diferencia)}
                      helperText={touched.diferencia && errors.diferencia}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'none' }}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="observaciones"
                      name="observaciones"
                      label="Observaciones"
                      multiline
                      rows={4}
                      value={values.observaciones || ''}
                      error={touched.observaciones && Boolean(errors.observaciones)}
                      helperText={touched.observaciones && errors.observaciones}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'none' }}>
                    <FormControl fullWidth error={touched.estado && Boolean(errors.estado)}>
                      <InputLabel id="estado-label">Estado</InputLabel>
                      <Field as={Select} labelId="estado-label" id="estado" name="estado" label="Estado">
                        <MenuItem value="activo">Activo</MenuItem>
                        <MenuItem value="inactivo">Inactivo</MenuItem>
                      </Field>
                      <ErrorMessage name="estado" component={FormHelperText} />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => navigate('/agent-closings')}
                        sx={{
                          borderColor: 'rgba(220, 118, 51, 0.5)',
                          color: '#dc7633',
                          '&:hover': {
                            borderColor: '#dc7633',
                            backgroundColor: 'rgba(220, 118, 51, 0.04)'
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                        sx={{
                          backgroundColor: '#dc7633',
                          '&:hover': {
                            backgroundColor: '#b35c20'
                          },
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {(createMutation.isLoading || updateMutation.isLoading) ? 'Guardando...' : 'Guardar Cierre Final'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para guardar el cierre final */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {id ? "¿Confirmar actualización de cierre final?" : "¿Confirmar creación de cierre final?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {id
              ? "¿Está seguro que desea actualizar este cierre final? Esta acción modificará los datos existentes."
              : "¿Está seguro que desea crear este cierre final? Esta acción no se puede deshacer."}
            <br /><br />
            {formValuesToSubmit && (
              <>
                <strong>Fecha de cierre:</strong> {formValuesToSubmit.fechaCierre instanceof Date ? format(formValuesToSubmit.fechaCierre, 'dd/MM/yyyy') : (typeof formValuesToSubmit.fechaCierre === 'string' ? formValuesToSubmit.fechaCierre : 'Fecha no disponible')}<br />
                <strong>Agente:</strong> {providers?.find(p => Number(p.id) === Number(formValuesToSubmit?.proveedorId))?.nombre || 'No seleccionado'}<br />
                <strong>Saldo inicial:</strong> L. {typeof formValuesToSubmit.saldoInicial === 'number' ? formValuesToSubmit.saldoInicial.toFixed(2) : '0.00'}<br />
                <strong>Resultado final:</strong> L. {typeof formValuesToSubmit.resultadoFinal === 'number' ? formValuesToSubmit.resultadoFinal.toFixed(2) : '0.00'}<br />
                <strong>Saldo final:</strong> L. {typeof formValuesToSubmit.saldoFinal === 'number' ? formValuesToSubmit.saldoFinal.toFixed(2) : '0.00'}<br />
                <strong>Diferencia:</strong> L. {typeof formValuesToSubmit.diferencia === 'number' ? formValuesToSubmit.diferencia.toFixed(2) : '0.00'}<br />
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmedSubmit} color="primary" autoFocus variant="contained">
            {id ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para mostrar mensajes al usuario */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgentClosingForm;
