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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import providersApi, { Provider, CreateProviderDto, UpdateProviderDto } from '../../api/providers/providersApi';
import providerTypesApi from '../../api/provider-types/providerTypesApi';

interface ProviderFormProps {
  open: boolean;
  onClose: () => void;
  provider: Provider | null;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ open, onClose, provider }) => {
  const queryClient = useQueryClient();
  const isEditing = Boolean(provider);

  // Obtener la lista de tipos de proveedor
  const { data: providerTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['providerTypes'],
    queryFn: providerTypesApi.getAll,
  });

  // Mutación para crear o actualizar un proveedor
  const mutation = useMutation({
    mutationFn: (values: CreateProviderDto | UpdateProviderDto) => {
      if (isEditing && provider) {
        return providersApi.update(provider.id, values as UpdateProviderDto);
      } else {
        return providersApi.create(values as CreateProviderDto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      onClose();
    },
  });

  // Configuración del formulario con Formik
  const formik = useFormik({
    initialValues: {
      tipoProveedorId: provider?.tipoProveedorId || '',
      nombre: provider?.nombre || '',
      rtn: provider?.rtn || '',
      telefono: provider?.telefono || '',
      contacto: provider?.contacto || '',
      notas: provider?.notas || '',
      activo: provider?.activo !== undefined ? provider.activo : true,
    },
    validationSchema: Yup.object({
      tipoProveedorId: Yup.number()
        .required('El tipo de proveedor es requerido')
        .positive('Seleccione un tipo de proveedor válido'),
      nombre: Yup.string()
        .required('El nombre es requerido')
        .max(100, 'El nombre no puede exceder los 100 caracteres'),
      rtn: Yup.string()
        .max(20, 'El RTN no puede exceder los 20 caracteres'),
      telefono: Yup.string()
        .max(20, 'El teléfono no puede exceder los 20 caracteres'),
      contacto: Yup.string()
        .max(100, 'El contacto no puede exceder los 100 caracteres'),
    }),
    onSubmit: (values) => {
      const submitValues = {
        ...values,
        tipoProveedorId: Number(values.tipoProveedorId),
      };
      mutation.mutate(submitValues);
    },
    enableReinitialize: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mutation.error instanceof Error ? mutation.error.message : 'Error al guardar el proveedor'}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.tipoProveedorId && Boolean(formik.errors.tipoProveedorId)}
                disabled={mutation.isLoading || isLoadingTypes}
              >
                <InputLabel id="tipo-proveedor-label">Tipo de Proveedor</InputLabel>
                <Select
                  labelId="tipo-proveedor-label"
                  id="tipoProveedorId"
                  name="tipoProveedorId"
                  value={formik.values.tipoProveedorId.toString()}
                  label="Tipo de Proveedor"
                  onChange={(e) => formik.setFieldValue('tipoProveedorId', e.target.value)}
                  onBlur={formik.handleBlur}
                >
                  {isLoadingTypes ? (
                    <MenuItem value="">Cargando...</MenuItem>
                  ) : (
                    providerTypes?.map((type) => (
                      <MenuItem key={type.id} value={type.id.toString()}>
                        {type.nombre}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formik.touched.tipoProveedorId && formik.errors.tipoProveedorId && (
                  <FormHelperText>{formik.errors.tipoProveedorId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="rtn"
                name="rtn"
                label="RTN"
                value={formik.values.rtn}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.rtn && Boolean(formik.errors.rtn)}
                helperText={formik.touched.rtn && formik.errors.rtn}
                disabled={mutation.isLoading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="telefono"
                name="telefono"
                label="Teléfono"
                value={formik.values.telefono}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                helperText={formik.touched.telefono && formik.errors.telefono}
                disabled={mutation.isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="contacto"
                name="contacto"
                label="Contacto"
                value={formik.values.contacto}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contacto && Boolean(formik.errors.contacto)}
                helperText={formik.touched.contacto && formik.errors.contacto}
                disabled={mutation.isLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notas"
                name="notas"
                label="Notas"
                value={formik.values.notas}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notas && Boolean(formik.errors.notas)}
                helperText={formik.touched.notas && formik.errors.notas}
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

export default ProviderForm;
