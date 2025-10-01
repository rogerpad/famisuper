import React from 'react';
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
  Switch,
  FormControlLabel,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import turnosApi, { Turno, CreateTurnoDto, UpdateTurnoDto } from '../../api/turnos/turnosApi';
import usersApi from '../../api/users/usersApi';
import { toValidId, isValidId } from '../../utils/validationUtils';

interface TurnoFormProps {
  open: boolean;
  onClose: () => void;
  turno: Turno | null;
  usuariosIds?: number[];
}

// Esquema de validación para el formulario
const turnoSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre del turno es requerido'),
  horaInicio: Yup.string().required('La hora de inicio es requerida'),
  horaFin: Yup.string().required('La hora de fin es requerida'),
  descripcion: Yup.string(),
  activo: Yup.boolean(),
  usuariosIds: Yup.array().of(Yup.number()),
});

const TurnoForm: React.FC<TurnoFormProps> = ({ open, onClose, turno, usuariosIds = [] }) => {
  const queryClient = useQueryClient();
  const isNewTurno = !turno;
  const [error, setError] = React.useState<string | null>(null);

  // Consulta para obtener los usuarios
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  // Mutación para crear un turno
  const createMutation = useMutation({
    mutationFn: (turnoData: CreateTurnoDto) => turnosApi.create(turnoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      onClose();
    },
  });

  // Mutación para actualizar un turno
  const updateMutation = useMutation({
    mutationFn: ({ id, turnoData }: { id: number | string; turnoData: UpdateTurnoDto }) => {
      const validId = toValidId(id);
      if (validId === undefined) {
        console.error(`[TURNO FORM] ID de turno inválido para actualizar: ${id}`);
        throw new Error(`ID de turno inválido: ${id}`);
      }
      
      // Validar ID de usuario si existe
      if (turnoData.usuariosIds) {
        turnoData.usuariosIds = turnoData.usuariosIds
          .map(id => toValidId(id))
          .filter((id): id is number => id !== undefined);
      }
      
      console.log(`[TURNO FORM] Actualizando turno ${validId} con datos:`, turnoData);
      return turnosApi.update(validId, turnoData);
    },
    onSuccess: () => {
      console.log('[TURNO FORM] Turno actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('[TURNO FORM] Error en la mutación de actualización:', error.message || error);
      // El error se maneja en el componente
    }
  });

  // Valores iniciales para el formulario
  const initialValues = {
    nombre: turno?.nombre || '',
    horaInicio: turno?.horaInicio || '08:00',
    horaFin: turno?.horaFin || '16:00',
    descripcion: turno?.descripcion || '',
    activo: turno?.activo ?? true,
    usuariosIds: turno?.usuarios
      ? turno.usuarios
          .map(u => toValidId(u.id))
          .filter((id): id is number => id !== undefined)
      : usuariosIds.filter(id => isValidId(id)) || [],
  };

  // Limpiar el error al cerrar el diálogo
  const handleClose = () => {
    setError(null);
    onClose();
  };

  // Manejar el envío del formulario
  const handleSubmit = async (values: any) => {
    try {
      // Limpiar cualquier error previo
      setError(null);
      
      // Validar que la hora de inicio sea anterior a la hora de fin
      if (values.horaInicio >= values.horaFin) {
        setError('La hora de inicio debe ser anterior a la hora de fin');
        return;
      }
      
      // Asegurarse de que las horas estén en formato HH:MM (máximo 5 caracteres)
      const formatearHora = (hora: string): string => {
        if (!hora) return hora;
        // Si la hora incluye segundos (HH:MM:SS), eliminarlos
        if (hora.length > 5) {
          return hora.substring(0, 5);
        }
        return hora;
      };
      
      const turnoData = {
        nombre: values.nombre,
        horaInicio: formatearHora(values.horaInicio),
        horaFin: formatearHora(values.horaFin),
        descripcion: values.descripcion || undefined,
        activo: values.activo,
        usuariosIds: values.usuariosIds || [],
      };

      console.log('Datos a enviar:', turnoData);

      if (isNewTurno) {
        // Para crear un nuevo turno
        try {
          console.log('[TURNO FORM] Creando nuevo turno con datos:', turnoData);
          await createMutation.mutateAsync(turnoData as CreateTurnoDto);
        } catch (error: any) {
          console.error('[TURNO FORM] Error al crear turno:', error.message || error);
          setError(error.message || 'Error al crear el turno');
        }
      } else if (turno && isValidId(turno.id)) {
        // Para actualizar un turno existente
        try {
          console.log(`[TURNO FORM] Actualizando turno ${turno.id} con datos:`, turnoData);
          await updateMutation.mutateAsync({
            id: turno.id,
            turnoData: turnoData as UpdateTurnoDto
          });
        } catch (error: any) {
          console.error('[TURNO FORM] Error al actualizar turno:', error.message || error);
          setError(error.message || 'Error al actualizar el turno');
        }
      } else if (turno) {
        console.error(`[TURNO FORM] Intento de actualizar turno con ID inválido: ${turno.id}`);
        setError(`ID de turno inválido: ${turno.id}`);
      }
      return;
    } catch (error: any) {
      console.error('Error al procesar el formulario:', error);
      setError(error.message || 'Error al procesar el formulario');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isNewTurno ? 'Crear Nuevo Turno' : 'Editar Turno'}</DialogTitle>
      
      {/* Mostrar alerta de error si existe */}
      {error && (
        <Box sx={{ mx: 3, mt: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={turnoSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field name="nombre">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Nombre del Turno"
                        fullWidth
                        margin="normal"
                        error={touched.nombre && Boolean(errors.nombre)}
                        helperText={touched.nombre && errors.nombre}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  {/* El campo de selección de usuario ha sido eliminado ya que usuarioId no existe más en el backend */}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="horaInicio">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Hora de Inicio"
                        type="time"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        error={touched.horaInicio && Boolean(errors.horaInicio)}
                        helperText={touched.horaInicio && errors.horaInicio as string}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="horaFin">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Hora de Fin"
                        type="time"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        error={touched.horaFin && Boolean(errors.horaFin)}
                        helperText={touched.horaFin && errors.horaFin as string}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="descripcion">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Descripción"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field name="activo">
                    {({ field }: FieldProps) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            name={field.name}
                          />
                        }
                        label="Turno activo"
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>

              {(createMutation.isError || updateMutation.isError) && (
                <Box mt={2}>
                  <Alert severity="error">
                    Error al {isNewTurno ? 'crear' : 'actualizar'} el turno. 
                    {createMutation.error instanceof Error && createMutation.error.message}
                    {updateMutation.error instanceof Error && updateMutation.error.message}
                  </Alert>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancelar
              </Button>
              <Button
                type="submit"
                sx={{ bgcolor: '#dc7633', '&:hover': { bgcolor: '#c56a2d' }, color: 'white' }}
                disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
              >
                {(isSubmitting || createMutation.isLoading || updateMutation.isLoading) ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    {isNewTurno ? 'Creando...' : 'Actualizando...'}
                  </>
                ) : (
                  isNewTurno ? 'Crear' : 'Actualizar'
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TurnoForm;
