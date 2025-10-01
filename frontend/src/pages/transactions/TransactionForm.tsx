import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transactionsApi, { Transaction, CreateTransactionDto } from '../../api/transactions/transactionsApi';
import providerTypesApi from '../../api/provider-types/providerTypesApi';
import providersApi from '../../api/providers/providersApi';
import transactionTypesApi from '../../api/transaction-types/transactionTypesApi';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

const validationSchema = yup.object({
  fecha: yup.string().required('La fecha es requerida'),
  hora: yup.string().required('La hora es requerida'),
  agenteId: yup.number().required('El agente es requerido'),
  tipoTransaccionId: yup.number().required('El tipo de transacción es requerido'),
  valor: yup
    .number()
    .required('El valor es requerido')
    .positive('El valor debe ser positivo')
    .min(0.01, 'El valor mínimo es 0.01'),
  observacion: yup.string(),
  estado: yup.boolean().required('El estado es requerido'),
});

const TransactionForm: React.FC<TransactionFormProps> = ({ open, onClose, transaction }) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const isEditing = !!transaction;

  // Obtener el ID del usuario actual desde el contexto de autenticación
  const { state: authState } = useAuth();
  const currentUserId = authState.user?.id || 1;

  // Consulta para obtener los tipos de proveedores (para filtrar agentes)
  const { data: providerTypes = [] } = useQuery({
    queryKey: ['providerTypes'],
    queryFn: providerTypesApi.getAll,
  });

  // Encontrar el tipo de proveedor "Agente"
  const agentTypeId = providerTypes.find(type => 
    type.nombre.toLowerCase().includes('agente'))?.id;

  // Consulta para obtener los proveedores tipo agente
  const { data: allProviders = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ['providers', agentTypeId],
    queryFn: () => providersApi.getByType(agentTypeId || 0),
    enabled: !!agentTypeId,
  });

  // Filtrar solo proveedores activos
  const providers = allProviders.filter(provider => Boolean(provider.activo));

  // Consulta para obtener los tipos de transacción activos
  const { data: transactionTypes = [], isLoading: isLoadingTransactionTypes } = useQuery({
    queryKey: ['transactionTypes'],
    queryFn: transactionTypesApi.getActive,
  });

  // Mutación para crear una nueva transacción
  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear la transacción');
    },
  });

  // Mutación para actualizar una transacción existente
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; transaction: any }) => 
      transactionsApi.update(data.id, data.transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar la transacción');
    },
  });

  // Configurar Formik para el formulario
  // Definir la interfaz para los valores del formulario
  interface FormValues {
    fecha: string;
    hora: string;
    usuarioId: number;
    agenteId: string | number; // Puede ser string en el formulario pero number en la API
    tipoTransaccionId: string | number; // Puede ser string en el formulario pero number en la API
    estado: boolean;
    valor: string | number; // Puede ser string en el formulario pero number en la API
    observacion: string;
  }
  
  // Obtener la fecha y hora actuales formateadas
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  const currentTime = format(new Date(), 'HH:mm');

  const formik = useFormik<FormValues>({
    initialValues: {
      fecha: currentDate,
      hora: currentTime,
      usuarioId: currentUserId,
      agenteId: '',
      tipoTransaccionId: '',
      valor: '',
      observacion: '',
      estado: true, // Por defecto activa
    },
    validationSchema,
    onSubmit: (values) => {
      // Evitar múltiples envíos
      if (createMutation.isLoading || updateMutation.isLoading) {
        console.log('Operación en progreso, evitando doble envío');
        return;
      }
      
      console.log('Iniciando envío de formulario de transacción');
      
      // Preparar los datos para enviar
      const transactionData: CreateTransactionDto = {
        ...values,
        usuarioId: Number(values.usuarioId),
        agenteId: Number(values.agenteId),
        tipoTransaccionId: Number(values.tipoTransaccionId),
        valor: Number(values.valor),
        estado: values.estado,
      };

      // Registrar los datos que se van a enviar
      console.log('Datos a enviar:', transactionData);

      if (isEditing && transaction) {
        // Actualizar transacción existente
        console.log(`Actualizando transacción con ID: ${transaction.id}`);
        updateMutation.mutate({
          id: transaction.id,
          transaction: transactionData,
        });
      } else {
        // Crear nueva transacción
        console.log('Creando nueva transacción');
        createMutation.mutate(transactionData);
      }
    },
  });

  // Actualizar los valores del formulario cuando cambia la transacción seleccionada
  useEffect(() => {
    if (transaction) {
      console.log('Estado de la transacción:', transaction.estado);
      
      // Asegurarse de que el estado sea un boolean
      const estadoValue = typeof transaction.estado === 'boolean' ? transaction.estado : true;
      
      // Corregir el problema de zona horaria al procesar la fecha
      // Usar directamente el string de fecha sin convertirlo a Date para evitar el desfase
      console.log('Fecha original de la transacción:', transaction.fecha);
      
      formik.setValues({
        // Usar la fecha tal como viene de la API, sin convertirla a Date
        fecha: transaction.fecha,
        hora: transaction.hora,
        usuarioId: transaction.usuarioId,
        // Mantener los tipos como string para el formulario
        agenteId: String(transaction.agenteId),
        tipoTransaccionId: String(transaction.tipoTransaccionId),
        valor: String(transaction.valor),
        observacion: transaction.observacion || '',
        estado: estadoValue,
      });
      
      console.log('Fecha establecida en el formulario:', transaction.fecha);
      
      // Verificar el valor establecido
      console.log('Valor establecido en formik:', formik.values.estado);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction]);

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="fecha"
                name="fecha"
                label="Fecha"
                type="date"
                value={formik.values.fecha}
                onChange={formik.handleChange}
                error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                helperText={formik.touched.fecha && formik.errors.fecha}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                InputProps={{
                  readOnly: !isEditing,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="hora"
                name="hora"
                label="Hora"
                type="time"
                value={formik.values.hora}
                onChange={formik.handleChange}
                error={formik.touched.hora && Boolean(formik.errors.hora)}
                helperText={formik.touched.hora && formik.errors.hora}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                InputProps={{
                  readOnly: !isEditing,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.agenteId && Boolean(formik.errors.agenteId)}
              >
                <InputLabel id="agente-label">Agente</InputLabel>
                <Select
                  labelId="agente-label"
                  id="agenteId"
                  name="agenteId"
                  value={formik.values.agenteId}
                  onChange={formik.handleChange}
                  label="Agente"
                  disabled={isLoadingProviders}
                >
                  {isLoadingProviders ? (
                    <MenuItem value="">
                      <CircularProgress size={20} /> Cargando...
                    </MenuItem>
                  ) : (
                    providers.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        {provider.nombre}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formik.touched.agenteId && formik.errors.agenteId && (
                  <FormHelperText>{formik.errors.agenteId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.tipoTransaccionId && Boolean(formik.errors.tipoTransaccionId)}
              >
                <InputLabel id="tipo-transaccion-label">Tipo de Transacción</InputLabel>
                <Select
                  labelId="tipo-transaccion-label"
                  id="tipoTransaccionId"
                  name="tipoTransaccionId"
                  value={formik.values.tipoTransaccionId}
                  onChange={formik.handleChange}
                  label="Tipo de Transacción"
                  disabled={isLoadingTransactionTypes}
                >
                  {isLoadingTransactionTypes ? (
                    <MenuItem value="">
                      <CircularProgress size={20} /> Cargando...
                    </MenuItem>
                  ) : (
                    transactionTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.nombre}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formik.touched.tipoTransaccionId && formik.errors.tipoTransaccionId && (
                  <FormHelperText>{formik.errors.tipoTransaccionId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="valor"
                name="valor"
                label="Valor"
                type="number"
                value={formik.values.valor}
                onChange={(e) => {
                  // Solo permitir números, punto decimal y eliminar caracteres no numéricos
                  const value = e.target.value;
                  const numericValue = value.replace(/[^0-9.]/g, '');
                  
                  // Evitar múltiples puntos decimales
                  const parts = numericValue.split('.');
                  const cleanValue = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('') 
                    : numericValue;
                  
                  // Actualizar el valor en formik
                  formik.setFieldValue('valor', cleanValue);
                }}
                onKeyPress={(e) => {
                  // Prevenir caracteres no numéricos excepto punto decimal
                  const char = e.key;
                  if (!/[0-9.]/.test(char)) {
                    e.preventDefault();
                  }
                  
                  // Prevenir múltiples puntos decimales
                  if (char === '.' && formik.values.valor.toString().includes('.')) {
                    e.preventDefault();
                  }
                }}
                error={formik.touched.valor && Boolean(formik.errors.valor)}
                helperText={formik.touched.valor && formik.errors.valor}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">L</InputAdornment>,
                  inputProps: {
                    min: 0,
                    step: 0.01,
                    pattern: "[0-9]+(\\.[0-9]+)?"
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="observacion"
                name="observacion"
                label="Observación"
                multiline
                rows={3}
                value={formik.values.observacion}
                onChange={formik.handleChange}
                error={formik.touched.observacion && Boolean(formik.errors.observacion)}
                helperText={formik.touched.observacion && formik.errors.observacion}
                margin="normal"
              />
            </Grid>
            
            {isEditing && (
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={formik.touched.estado && Boolean(formik.errors.estado)}
                >
                  <InputLabel id="estado-label">Estado</InputLabel>
                  <Select
                    labelId="estado-label"
                    id="estado"
                    name="estado"
                    value={formik.values.estado ? "true" : "false"}
                    onChange={(e) => formik.setFieldValue('estado', e.target.value === "true")}
                    label="Estado"
                  >
                    <MenuItem value="true">Activa</MenuItem>
                    <MenuItem value="false">Inactiva</MenuItem>
                  </Select>
                  {formik.touched.estado && formik.errors.estado && (
                    <FormHelperText>{formik.errors.estado}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {isEditing ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              isEditing ? 'Actualizar' : 'Guardar'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionForm;
