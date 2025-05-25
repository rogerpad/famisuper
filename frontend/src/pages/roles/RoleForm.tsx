import React from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import rolesApi, { Role, CreateRoleDto, UpdateRoleDto } from '../../api/roles/rolesApi';

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

// Esquema de validación con Yup
const roleSchema = Yup.object().shape({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  descripcion: Yup.string().nullable(),
  activo: Yup.boolean(),
});

const RoleForm: React.FC<RoleFormProps> = ({ open, onClose, role, onSuccess }) => {
  const isEditing = !!role;

  // Valores iniciales para el formulario
  const initialValues = {
    nombre: role?.nombre || '',
    descripcion: role?.descripcion || '',
    activo: role?.activo ?? true,
  };

  // Mutación para crear un nuevo rol
  const createMutation = useMutation({
    mutationFn: (newRole: CreateRoleDto) => rolesApi.create(newRole),
    onSuccess: () => {
      onSuccess();
    },
  });

  // Mutación para actualizar un rol existente
  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UpdateRoleDto }) => rolesApi.update(id, role),
    onSuccess: () => {
      onSuccess();
    },
  });

  // Manejar el envío del formulario
  const handleSubmit = (
    values: typeof initialValues,
    { setSubmitting, setErrors }: FormikHelpers<typeof initialValues>
  ) => {
    const roleData = {
      nombre: values.nombre,
      descripcion: values.descripcion || undefined, // Usar undefined en lugar de null para compatibilidad con los tipos
      activo: values.activo,
    };

    if (isEditing && role) {
      updateMutation.mutate(
        { id: role.id, role: roleData },
        {
          onError: (error: any) => {
            if (error.response?.data?.message) {
              setErrors({ nombre: error.response.data.message });
            }
            setSubmitting(false);
          },
        }
      );
    } else {
      createMutation.mutate(roleData, {
        onError: (error: any) => {
          if (error.response?.data?.message) {
            setErrors({ nombre: error.response.data.message });
          }
          setSubmitting(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={roleSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting, values, handleChange }) => (
          <Form>
            <DialogContent>
              {(createMutation.isError || updateMutation.isError) && (
                <Box mb={2}>
                  <Alert severity="error">
                    Error al {isEditing ? 'actualizar' : 'crear'} el rol. Por favor, intente nuevamente.
                  </Alert>
                </Box>
              )}

              <Box mb={2}>
                <TextField
                  fullWidth
                  id="nombre"
                  name="nombre"
                  label="Nombre del rol"
                  value={values.nombre}
                  onChange={handleChange}
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre}
                  variant="outlined"
                  margin="normal"
                />
              </Box>

              <Box mb={2}>
                <TextField
                  fullWidth
                  id="descripcion"
                  name="descripcion"
                  label="Descripción"
                  value={values.descripcion}
                  onChange={handleChange}
                  error={touched.descripcion && Boolean(errors.descripcion)}
                  helperText={touched.descripcion && errors.descripcion}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Field
                      as={Switch}
                      name="activo"
                      color="primary"
                      checked={values.activo}
                    />
                  }
                  label="Activo"
                />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose} color="inherit">
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default RoleForm;
