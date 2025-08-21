import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { usePackages } from '../../api/packages/packagesApi';
import { PackageFormData } from '../../api/packages/types';
import { usePhoneLines } from '../../api/phone-lines/phoneLinesApi';
import { PhoneLine } from '../../api/phone-lines/types';

const PackageForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const { loading, error, fetchPackageById, createPackage, updatePackage } = usePackages();
  const { loading: loadingPhoneLines, error: phoneLineError, fetchPhoneLines } = usePhoneLines();

  // Determinar si estamos en modo edición o creación
  const isEditMode = id !== 'new' && id !== undefined;

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<PackageFormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    activo: true,
    telefonicaId: 0,
  });

  // Estado para las líneas telefónicas
  const [phoneLines, setPhoneLines] = useState<PhoneLine[]>([]);

  // Estado para los errores de validación
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({
    nombre: '',
    descripcion: '',
    precio: '',
    telefonicaId: '',
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar líneas telefónicas
        const phoneLineData = await fetchPhoneLines();
        setPhoneLines(phoneLineData);

        // Si estamos en modo edición, cargar los datos del paquete
        if (isEditMode && id) {
          const packageData = await fetchPackageById(parseInt(id));
          if (packageData) {
            setFormData({
              nombre: packageData.nombre,
              descripcion: packageData.descripcion,
              precio: packageData.precio,
              activo: packageData.activo,
              telefonicaId: packageData.telefonicaId,
            });
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        enqueueSnackbar('Error al cargar los datos necesarios', { variant: 'error' });
      }
    };

    loadData();
  }, [isEditMode, id, fetchPackageById, fetchPhoneLines, enqueueSnackbar]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' ? parseFloat(value) : value,
    }));

    // Limpiar error de validación cuando el usuario corrige
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Manejar cambios en el switch de activo
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      activo: e.target.checked,
    }));
  };

  // Manejar cambios en el select de línea telefónica
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const value = e.target.value as number;
    setFormData(prev => ({
      ...prev,
      telefonicaId: value,
    }));

    // Limpiar error de validación
    if (validationErrors.telefonicaId) {
      setValidationErrors(prev => ({
        ...prev,
        telefonicaId: '',
      }));
    }
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }

    if (formData.precio <= 0) {
      errors.precio = 'El precio debe ser mayor que cero';
    }

    if (formData.telefonicaId <= 0) {
      errors.telefonicaId = 'Debe seleccionar una línea telefónica';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar('Por favor corrija los errores en el formulario', { variant: 'error' });
      return;
    }

    try {
      if (isEditMode && id) {
        // Actualizar paquete existente
        const updatedPackage = await updatePackage(parseInt(id), formData);
        if (updatedPackage) {
          enqueueSnackbar('Paquete actualizado correctamente', { variant: 'success' });
          navigate('/packages');
        }
      } else {
        // Crear nuevo paquete
        const newPackage = await createPackage(formData);
        if (newPackage) {
          enqueueSnackbar('Paquete creado correctamente', { variant: 'success' });
          navigate('/packages');
        }
      }
    } catch (err) {
      console.error('Error al guardar paquete:', err);
      enqueueSnackbar(
        `Error al ${isEditMode ? 'actualizar' : 'crear'} el paquete`, 
        { variant: 'error' }
      );
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/packages');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Editar Paquete' : 'Nuevo Paquete'}
      </Typography>

      {(loading || loadingPhoneLines) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error || phoneLineError ? (
        <Typography color="error">
          Error: {error || phoneLineError}
        </Typography>
      ) : (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    error={!!validationErrors.nombre}
                    helperText={validationErrors.nombre}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Precio"
                    name="precio"
                    type="number"
                    value={formData.precio}
                    onChange={handleChange}
                    error={!!validationErrors.precio}
                    helperText={validationErrors.precio}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₡</InputAdornment>,
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    error={!!validationErrors.descripcion}
                    helperText={validationErrors.descripcion}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!validationErrors.telefonicaId}>
                    <InputLabel id="telefonica-label">Línea Telefónica</InputLabel>
                    <Select
                      labelId="telefonica-label"
                      value={formData.telefonicaId}
                      onChange={handleSelectChange as any}
                      label="Línea Telefónica"
                      required
                    >
                      <MenuItem value={0} disabled>
                        <em>Seleccione una línea telefónica</em>
                      </MenuItem>
                      {phoneLines.map((line) => (
                        <MenuItem key={line.id} value={line.id}>
                          {line.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors.telefonicaId && (
                      <FormHelperText>{validationErrors.telefonicaId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.activo}
                        onChange={handleSwitchChange}
                        name="activo"
                        color="primary"
                      />
                    }
                    label="Activo"
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleCancel}
                    sx={{ mr: 2 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    {isEditMode ? 'Actualizar' : 'Crear'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PackageForm;
