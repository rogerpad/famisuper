import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import providerTypesApi, { ProviderType, CreateProviderTypeDto, UpdateProviderTypeDto } from '../../api/provider-types/providerTypesApi';

interface ProviderTypeFormProps {
  open: boolean;
  onClose: () => void;
  providerType: ProviderType | null;
}

const ProviderTypeForm: React.FC<ProviderTypeFormProps> = ({ open, onClose, providerType }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(providerType);

  // Mutación para crear o actualizar un tipo de proveedor
  const mutation = useMutation({
    mutationFn: (values: CreateProviderTypeDto | UpdateProviderTypeDto) => {
      if (isEditing && providerType) {
        return providerTypesApi.update(providerType.id, values as UpdateProviderTypeDto);
      } else {
        return providerTypesApi.create(values as CreateProviderTypeDto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerTypes'] });
      onClose();
    },
  });

  // Configuración del formulario con Formik
  const formik = useFormik({
    initialValues: {
      nombre: providerType?.nombre || '',
      descripcion: providerType?.descripcion || '',
      activo: providerType?.activo !== undefined ? providerType.activo : true,
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .required('El nombre es requerido')
        .max(100, 'El nombre no puede exceder los 100 caracteres'),
      descripcion: Yup.string()
        .max(100, 'La descripción no puede exceder los 100 caracteres'),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
    enableReinitialize: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {isEditing ? 'Editar Tipo de Proveedor' : 'Nuevo Tipo de Proveedor'}
        </DialogTitle>
        <DialogContent>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mutation.error instanceof Error ? mutation.error.message : 'Error al guardar el tipo de proveedor'}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="nombre"
                name="nombre"
                label="Nombre"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                helperText={formik.touched.nombre && formik.errors.nombre}
                disabled={mutation.isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="descripcion"
                name="descripcion"
                label="Descripción"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                helperText={formik.touched.descripcion && formik.errors.descripcion}
                disabled={mutation.isLoading}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    id="activo"
                    name="activo"
                    checked={formik.values.activo}
                    onChange={formik.handleChange}
                    disabled={mutation.isLoading}
                    color="primary"
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={mutation.isLoading}
            startIcon={mutation.isLoading ? <CircularProgress size={20} /> : null}
          >
            {mutation.isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProviderTypeForm;
