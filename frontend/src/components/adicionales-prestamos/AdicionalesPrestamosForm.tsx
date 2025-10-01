import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useUsers } from '../../hooks/useUsers';
import {
  AdicionalesPrestamosFormData,
  createAdicionalesPrestamos,
  getAdicionalesPrestamosById,
  updateAdicionalesPrestamos,
  safeParseFloat
} from '../../api/adicionales-prestamos/adicionalesPrestamosApi';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';

const AdicionalesPrestamosForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, loading: loadingUsers } = useUsers();
  const { hasPermission } = usePermissions();
  const { state: authState } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<AdicionalesPrestamosFormData>({
    usuarioId: authState.user?.id || 0,
    acuerdo: '',
    origen: '',
    monto: 0,
    descripcion: '',
    activo: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const data = await getAdicionalesPrestamosById(parseInt(id, 10));
          setFormData({
            usuarioId: data.usuarioId,
            acuerdo: data.acuerdo,
            origen: data.origen,
            monto: safeParseFloat(data.monto),
            descripcion: data.descripcion,
            activo: data.activo
          });
        } catch (error) {
          console.error('[ADICIONALES_PRESTAMOS_FORM] Error al cargar datos:', error);
          setSnackbar({
            open: true,
            message: 'Error al cargar los datos del adicional/préstamo',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    if (!name) return;

    let processedValue = value;
    
    // Procesar valores numéricos
    if (name === 'monto') {
      processedValue = safeParseFloat(value);
    } else if (name === 'usuarioId') {
      processedValue = parseInt(value as string, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Limpiar error si el campo ha sido modificado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambio en el switch de activo
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      activo: e.target.checked
    }));
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.usuarioId) {
      newErrors.usuarioId = 'Debe seleccionar un usuario';
    }

    if (!formData.acuerdo.trim()) {
      newErrors.acuerdo = 'El acuerdo es requerido';
    }

    if (!formData.origen.trim()) {
      newErrors.origen = 'El origen es requerido';
    }

    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor que cero';
    }

    // La descripción ya no es obligatoria

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      if (isEditMode && id) {
        await updateAdicionalesPrestamos(parseInt(id, 10), formData);
        setSnackbar({
          open: true,
          message: 'Adicional/Préstamo actualizado correctamente',
          severity: 'success'
        });
      } else {
        await createAdicionalesPrestamos(formData);
        setSnackbar({
          open: true,
          message: 'Adicional/Préstamo creado correctamente',
          severity: 'success'
        });
      }
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/adicionales-prestamos');
      }, 1500);
    } catch (error) {
      console.error('[ADICIONALES_PRESTAMOS_FORM] Error al guardar:', error);
      setSnackbar({
        open: true,
        message: `Error al ${isEditMode ? 'actualizar' : 'crear'} el adicional/préstamo`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar permisos
  const canCreateEdit = hasPermission('crear_editar_adic_prest');

  if (!canCreateEdit) {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" color="error">
          No tiene permisos para {isEditMode ? 'editar' : 'crear'} adicionales/préstamos
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Editar' : 'Nuevo'} Adicional/Préstamo
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Usuario */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.usuarioId}>
              <InputLabel id="usuario-label">Usuario</InputLabel>
              <Select
                labelId="usuario-label"
                id="usuarioId"
                name="usuarioId"
                value={formData.usuarioId || ''}
                label="Usuario"
                onChange={handleChange}
                disabled={loading || loadingUsers || !isEditMode}
              >
                <MenuItem value="">
                  <em>Seleccione un usuario</em>
                </MenuItem>
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.nombre} {user.apellido} ({user.username})
                  </MenuItem>
                ))}
              </Select>
              {errors.usuarioId && <FormHelperText>{errors.usuarioId}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Acuerdo */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.acuerdo}>
              <InputLabel id="acuerdo-label">Acuerdo</InputLabel>
              <Select
                labelId="acuerdo-label"
                id="acuerdo"
                name="acuerdo"
                value={formData.acuerdo}
                label="Acuerdo"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Seleccione un tipo de acuerdo</em>
                </MenuItem>
                <MenuItem value="Adicional">Adicional</MenuItem>
                <MenuItem value="Préstamo">Préstamo</MenuItem>
              </Select>
              {errors.acuerdo && <FormHelperText>{errors.acuerdo}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Origen */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.origen}>
              <InputLabel id="origen-label">Origen</InputLabel>
              <Select
                labelId="origen-label"
                id="origen"
                name="origen"
                value={formData.origen}
                label="Origen"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>Seleccione un origen</em>
                </MenuItem>
                <MenuItem value="Casa">Casa</MenuItem>
                <MenuItem value="Agente">Agente</MenuItem>
              </Select>
              {errors.origen && <FormHelperText>{errors.origen}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Monto */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="monto"
              name="monto"
              label="Monto"
              type="number"
              value={formData.monto}
              onChange={handleChange}
              error={!!errors.monto}
              helperText={errors.monto}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start">L.</InputAdornment>,
              }}
            />
          </Grid>

          {/* Descripción */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="descripcion"
              name="descripcion"
              label="Descripción (Opcional)"
              value={formData.descripcion}
              onChange={handleChange}
              error={!!errors.descripcion}
              helperText={errors.descripcion}
              disabled={loading}
              multiline
              rows={4}
            />
          </Grid>

          {/* Activo (solo en modo edición) */}
          {isEditMode && (
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={handleSwitchChange}
                    name="activo"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Activo"
              />
            </Grid>
          )}

          {/* Botones */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/adicionales-prestamos')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdicionalesPrestamosForm;
