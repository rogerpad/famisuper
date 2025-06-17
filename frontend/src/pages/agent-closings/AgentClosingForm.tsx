import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format, parse } from 'date-fns';

import { agentClosingsApi } from '../../api/agent-closings/agentClosingsApi';
import providersApi from '../../api/providers/providersApi';
import transactionsApi from '../../api/transactions/transactionsApi';

interface AgentClosingFormValues {
  proveedorId: number;
  fechaCierre: Date;
  saldoInicial: number;
  adicionalCta: number;
  resultadoFinal: number;
  saldoFinal: number;
  diferencia: number;
  observaciones: string;
  estado: string;
}

const AgentClosingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [initialValues, setInitialValues] = useState<AgentClosingFormValues>({
    proveedorId: 0,
    fechaCierre: new Date(),
    saldoInicial: 0,
    adicionalCta: 0,
    resultadoFinal: 0,
    saldoFinal: 0,
    diferencia: 0,
    observaciones: '',
    estado: 'activo',
  });

  // Fetch agent-type providers
  const { data: providers, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['agentProviders'],
    queryFn: async () => {
      // Obtener proveedores de tipo agente (tipo 1)
      const response = await providersApi.getByType(1);
      return response;
    },
  });

  // Fetch agent closing if editing
  const { data: agentClosing, isLoading: isLoadingAgentClosing } = useQuery({
    queryKey: ['agentClosing', id],
    queryFn: () => agentClosingsApi.getAgentClosingById(Number(id)),
    enabled: !!id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: AgentClosingFormValues) => {
      // Convertir la fecha a formato string para la API y asegurar que todos los campos numéricos sean números
      const formattedValues = {
        ...values,
        proveedorId: Number(values.proveedorId), // Asegurar que proveedorId sea un número
        fechaCierre: format(values.fechaCierre, 'yyyy-MM-dd'),
        saldoInicial: Number(values.saldoInicial) || 0,
        adicionalCta: Number(values.adicionalCta) || 0,
        resultadoFinal: Number(values.resultadoFinal) || 0,
        saldoFinal: Number(values.saldoFinal) || 0,
        diferencia: Number(values.diferencia) || 0,
      };
      console.log('Enviando datos al backend:', JSON.stringify(formattedValues));
      return agentClosingsApi.createAgentClosing(formattedValues);
    },
    onSuccess: (data) => {
      console.log('Cierre creado exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['agentClosings'] });
      navigate('/agent-closings');
    },
    onError: (error: any) => {
      console.error('Error al crear el cierre:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: AgentClosingFormValues) => {
      // Convertir la fecha a formato string para la API y asegurar que todos los campos numéricos sean números
      const formattedValues = {
        ...values,
        proveedorId: Number(values.proveedorId), // Asegurar que proveedorId sea un número
        fechaCierre: format(values.fechaCierre, 'yyyy-MM-dd'),
        saldoInicial: Number(values.saldoInicial) || 0,
        adicionalCta: Number(values.adicionalCta) || 0,
        resultadoFinal: Number(values.resultadoFinal) || 0,
        saldoFinal: Number(values.saldoFinal) || 0,
        diferencia: Number(values.diferencia) || 0,
      };
      console.log('Actualizando cierre con datos:', JSON.stringify(formattedValues));
      return agentClosingsApi.updateAgentClosing(Number(id), formattedValues);
    },
    onSuccess: (data) => {
      console.log('Cierre actualizado exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['agentClosings'] });
      navigate('/agent-closings');
    },
    onError: (error: any) => {
      console.error('Error al actualizar el cierre:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
    },
  });

  useEffect(() => {
    if (agentClosing) {
      setInitialValues({
        proveedorId: agentClosing.proveedorId,
        fechaCierre: parse(agentClosing.fechaCierre, 'yyyy-MM-dd', new Date()),
        saldoInicial: agentClosing.saldoInicial || 0,
        adicionalCta: agentClosing.adicionalCta || 0,
        resultadoFinal: agentClosing.resultadoFinal || 0,
        saldoFinal: agentClosing.saldoFinal || 0,
        diferencia: agentClosing.diferencia || 0,
        observaciones: agentClosing.observaciones || '',
        estado: agentClosing.estado,
      });
    }
  }, [agentClosing]);

  const validationSchema = yup.object({
    proveedorId: yup.number().min(1, 'El agente es requerido').required('El agente es requerido'),
    fechaCierre: yup.date().required('La fecha de cierre es requerida'),
    saldoInicial: yup.number().required('El saldo inicial es requerido'),
    adicionalCta: yup.number().required('El adicional CTA es requerido'),
    resultadoFinal: yup.number().required('El resultado final es requerido'),
    saldoFinal: yup.number().required('El saldo final es requerido'),
    diferencia: yup.number().required('La diferencia es requerida'),
    observaciones: yup.string().nullable(),
    estado: yup.string().required('El estado es requerido'),
  });

  const handleSubmit = async (values: AgentClosingFormValues) => {
    try {
      // Añadir logs detallados para depuración
      console.log('Valores del formulario a enviar:', values);
      
      if (id) {
        // Actualizar cierre existente
        console.log('Actualizando cierre existente con ID:', id);
        await updateMutation.mutateAsync(values);
        alert('Cierre final actualizado con éxito');
      } else {
        // Crear nuevo cierre
        console.log('Creando nuevo cierre con valores:', JSON.stringify(values));
        const result = await createMutation.mutateAsync(values);
        console.log('Respuesta del servidor al crear:', result);
        alert('Cierre final creado con éxito');
      }
      navigate('/agent-closings');
    } catch (error: any) {
      console.error('Error al guardar el cierre final:', error);
      // Mostrar más detalles del error
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
        alert(`Error al guardar: ${error.response?.data?.message || 'Error desconocido'}`);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
        alert('No se pudo conectar con el servidor');
      } else {
        console.error('Error al configurar la solicitud:', error.message);
        alert(`Error: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  // Función para obtener el saldo inicial del agente seleccionado (transacción tipo Saldo Inicial)
  const getSaldoInicial = async (
    proveedorId: number,
    setFieldValue: any
  ) => {
    if (proveedorId <= 0) return;

    try {
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
          transaction => transaction.tipoTransaccionId === 1
        );
        
        if (saldoInicialByIdTransaction) {
          setFieldValue('saldoInicial', saldoInicialByIdTransaction.valor);
          console.log('Saldo Inicial encontrado por ID:', saldoInicialByIdTransaction.valor);
          return;
        }
      } else {
        // Si se encuentra por nombre, actualizar el campo saldoInicial
        setFieldValue('saldoInicial', saldoInicialTransaction.valor);
        console.log('Saldo Inicial encontrado por nombre:', saldoInicialTransaction.valor);
        return;
      }
      
      // Si llegamos aquí, no se encontró ninguna transacción de Saldo Inicial
      console.log('No se encontró transacción de Saldo Inicial para este agente');
      
    } catch (error) {
      console.error('Error al obtener el saldo inicial:', error);
    }
  };

  // Función para calcular el resultado final cuando se selecciona un agente
  const calculateResultadoFinal = async (
    proveedorId: number,
    fechaCierre: Date,
    setFieldValue: any
  ) => {
    if (proveedorId <= 0) return;

    try {
      // Calcular el primer día del mes y la fecha de cierre
      const startDate = format(new Date(fechaCierre.getFullYear(), fechaCierre.getMonth(), 1), 'yyyy-MM-dd');
      const endDate = format(fechaCierre, 'yyyy-MM-dd');

      // Obtener el resultado final calculado
      const resultadoFinal = await agentClosingsApi.calculateResultadoFinal(proveedorId, startDate, endDate);

      // Actualizar el campo resultadoFinal
      setFieldValue('resultadoFinal', resultadoFinal);

      // Recalcular la diferencia
      const currentValues = setFieldValue.values || {};
      calculateDifference({
        ...currentValues,
        resultadoFinal: resultadoFinal,
      }, setFieldValue);

      // Obtener y actualizar el saldo inicial
      await getSaldoInicial(proveedorId, setFieldValue);
    } catch (error) {
      console.error('Error al calcular el resultado final:', error);
    }
  };

  // Calcular diferencia automáticamente cuando cambian los valores
  const calculateDifference = (values: AgentClosingFormValues, setFieldValue: any) => {
    // Asegurar que los valores son números
    const resultadoFinal = values.resultadoFinal || 0;
    const saldoFinal = values.saldoFinal || 0;
    const adicionalCta = values.adicionalCta || 0;
    
    // Calcular la diferencia: Saldo Final - (Resultado Final + Adicional CTA)
    const diferencia = saldoFinal - (resultadoFinal + adicionalCta);
    //const diferencia = saldoFinal - resultadoFinal;
    
    // Actualizar el campo diferencia con el valor calculado
    setFieldValue('diferencia', diferencia);
  };

  if (isLoadingProviders || (id && isLoadingAgentClosing)) {
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
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched }) => (
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
                        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                          const proveedorId = e.target.value as number;
                          
                          // Limpiar los campos del formulario excepto la fecha de cierre y el ID del proveedor
                          setFieldValue('proveedorId', proveedorId);
                          setFieldValue('saldoInicial', 0);
                          setFieldValue('adicionalCta', 0);
                          setFieldValue('resultadoFinal', 0);
                          setFieldValue('saldoFinal', 0);
                          setFieldValue('diferencia', 0);
                          setFieldValue('observaciones', '');
                          
                          // Solo si se selecciona un agente válido, calcular el resultado final
                          if (proveedorId > 0) {
                            calculateResultadoFinal(proveedorId, values.fechaCierre, setFieldValue);
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
                        inputProps: { min: 0, step: 0.01 },
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

                  <Grid item xs={12} md={6}>
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
    </Box>
  );
};

export default AgentClosingForm;
