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

interface TurnoFormProps {
  open: boolean;
  onClose: () => void;
  turno: Turno | null;
  usuario_id?: number;
}

// Esquema de validación para el formulario
const turnoSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre del turno es requerido'),
  usuario_id: Yup.number().required('El usuario es requerido'),
  estado: Yup.string(),
  descripcion: Yup.string(),
  activo: Yup.boolean(),
});

const TurnoForm: React.FC<TurnoFormProps> = ({ open, onClose, turno, usuario_id }) => {
  const queryClient = useQueryClient();
  const isNewTurno = !turno;

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
    mutationFn: ({ id, turnoData }: { id: number; turnoData: UpdateTurnoDto }) => 
      turnosApi.update(id, turnoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      onClose();
    },
  });

  // Valores iniciales para el formulario
  const initialValues = {
    nombre: turno?.nombre || '',
    usuario_id: turno?.usuario_id || usuario_id || '',
    estado: turno?.estado || 'Disponible',
    descripcion: turno?.descripcion || '',
    activo: turno?.activo ?? true,
  };

  // Manejar el envío del formulario
  const handleSubmit = (values: any) => {
    try {
      const turnoData = {
        nombre: values.nombre,
        usuario_id: Number(values.usuario_id),
        estado: values.estado || undefined,
        descripcion: values.descripcion || undefined,
        activo: values.activo,
      };

      if (isNewTurno) {
        // Para crear un nuevo turno
        createMutation.mutate(turnoData as CreateTurnoDto);
      } else if (turno) {
        // Para actualizar un turno existente
        updateMutation.mutate({ id: turno.id, turnoData });
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isNewTurno ? 'Crear Nuevo Turno' : 'Editar Turno'}</DialogTitle>
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
                  <Field name="usuario_id">
                    {({ field }: FieldProps) => (
                      <FormControl 
                        fullWidth 
                        margin="normal"
                        error={touched.usuario_id && Boolean(errors.usuario_id)}
                      >
                        <InputLabel>Usuario</InputLabel>
                        <Select
                          {...field}
                          label="Usuario"
                          disabled={Boolean(usuario_id)}
                        >
                          {isLoadingUsers ? (
                            <MenuItem value="" disabled>
                              Cargando usuarios...
                            </MenuItem>
                          ) : (
                            users?.map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.nombre} {user.apellido} ({user.username})
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {touched.usuario_id && errors.usuario_id && (
                          <FormHelperText>{errors.usuario_id}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="estado">
                    {({ field }: FieldProps) => (
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Estado</InputLabel>
                        <Select
                          {...field}
                          label="Estado"
                        >
                          <MenuItem value="Disponible">Disponible</MenuItem>
                          <MenuItem value="En uso">En uso</MenuItem>
                          <MenuItem value="Finalizado">Finalizado</MenuItem>
                          <MenuItem value="Pausado">Pausado</MenuItem>
                        </Select>
                      </FormControl>
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
              <Button onClick={onClose} color="secondary">
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
