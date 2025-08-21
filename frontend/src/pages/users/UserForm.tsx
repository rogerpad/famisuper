import React, { useEffect } from 'react';
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
import usersApi, { User, CreateUserDto, UpdateUserDto } from '../../api/users/usersApi';
import rolesApi from '../../api/roles/rolesApi';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

// Esquema de validación para el formulario
const userSchema = Yup.object().shape({
  username: Yup.string()
    .required('El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: Yup.string()
    .when('isNewUser', {
      is: true,
      then: (schema) => schema.required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
      otherwise: (schema) => schema.min(6, 'La contraseña debe tener al menos 6 caracteres'),
    }),
  nombre: Yup.string().required('El nombre es requerido'),
  apellido: Yup.string().required('El apellido es requerido'),
  email: Yup.string().email('Correo electrónico inválido'),
  rol_id: Yup.number().required('El rol es requerido'),
  activo: Yup.boolean(),
});

const UserForm: React.FC<UserFormProps> = ({ open, onClose, user }) => {
  const queryClient = useQueryClient();
  const isNewUser = !user;

  // Consulta para obtener los roles
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
  });

  // Mutación para crear un usuario
  const createMutation = useMutation({
    mutationFn: (userData: CreateUserDto) => usersApi.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  // Mutación para actualizar un usuario
  const updateMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UpdateUserDto }) => 
      usersApi.update(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  // Valores iniciales para el formulario
  const initialValues = {
    username: user?.username || '',
    password: '',
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    rol_id: user?.rol_id || (roles && roles.length > 0 ? roles[0].id : ''),
    activo: user?.activo ?? true,
    isNewUser,
  };

  // Manejar el envío del formulario
  const handleSubmit = (values: any) => {
    try {
      const userData = {
        username: values.username,
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email || undefined,
        rol_id: Number(values.rol_id),
        activo: values.activo,
      };

      if (isNewUser) {
        // Para crear un nuevo usuario, la contraseña es requerida
        createMutation.mutate({
          ...userData,
          password: values.password,
        } as CreateUserDto);
      } else if (user) {
        // Para actualizar un usuario, la contraseña es opcional
        const updateData: UpdateUserDto = { ...userData };
        if (values.password) {
          updateData.password = values.password;
        }
        
        // Asegurarse de que rol_id sea un número
        if (updateData.rol_id) {
          updateData.rol_id = Number(updateData.rol_id);
        }
        
        console.log('Enviando datos de actualización:', { id: user.id, userData: updateData });
        updateMutation.mutate({ id: user.id, userData: updateData });
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isNewUser ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={userSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting, values }) => (
          <Form>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field name="username">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Nombre de usuario"
                        fullWidth
                        margin="normal"
                        error={touched.username && Boolean(errors.username)}
                        helperText={touched.username && errors.username ? errors.username : undefined}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="password">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        type="password"
                        label={isNewUser ? "Contraseña" : "Contraseña (dejar en blanco para no cambiar)"}
                        fullWidth
                        margin="normal"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password ? errors.password : undefined}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="nombre">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Nombre"
                        fullWidth
                        margin="normal"
                        error={touched.nombre && Boolean(errors.nombre)}
                        helperText={touched.nombre && errors.nombre ? errors.nombre : undefined}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="apellido">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Apellido"
                        fullWidth
                        margin="normal"
                        error={touched.apellido && Boolean(errors.apellido)}
                        helperText={touched.apellido && errors.apellido ? errors.apellido : undefined}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="email">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Correo electrónico"
                        fullWidth
                        margin="normal"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email ? errors.email : undefined}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field name="rol_id">
                    {({ field }: FieldProps) => (
                      <FormControl 
                        fullWidth 
                        margin="normal"
                        error={touched.rol_id && Boolean(errors.rol_id)}
                      >
                        <InputLabel>Rol</InputLabel>
                        <Select
                          {...field}
                          label="Rol"
                          disabled={isLoadingRoles}
                        >
                          {isLoadingRoles ? (
                            <MenuItem value="">
                              <CircularProgress size={20} />
                            </MenuItem>
                          ) : (
                            roles?.map((rol) => (
                              <MenuItem key={rol.id} value={rol.id}>
                                {rol.nombre}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {touched.rol_id && errors.rol_id && (
                          <FormHelperText>{typeof errors.rol_id === 'string' ? errors.rol_id : ''}</FormHelperText>
                        )}
                      </FormControl>
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
                        label="Usuario activo"
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>

              {(createMutation.isError || updateMutation.isError) && (
                <Box mt={2}>
                  <Alert severity="error">
                    Error al {isNewUser ? 'crear' : 'actualizar'} el usuario. 
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
                color="primary"
                disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
              >
                {(isSubmitting || createMutation.isLoading || updateMutation.isLoading) ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    {isNewUser ? 'Creando...' : 'Actualizando...'}
                  </>
                ) : (
                  isNewUser ? 'Crear' : 'Actualizar'
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserForm;
