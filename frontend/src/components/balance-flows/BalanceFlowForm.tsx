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
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  Box,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import { useBalanceFlows } from '../../api/balance-flows/balanceFlowsApi';
import { BalanceFlow, BalanceFlowFormData } from '../../api/balance-flows/types';
import { format } from 'date-fns';
import { usePhoneLines } from '../../api/phoneLines/phoneLinesApi';

interface BalanceFlowFormProps {
  open: boolean;
  balanceFlow: BalanceFlow | null;
  onClose: (refreshData?: boolean) => void;
}

const initialFormData: BalanceFlowFormData = {
  telefonicaId: 0,
  nombre: '',
  saldoInicial: 0,
  saldoComprado: 0,
  saldoVendido: 0,
  saldoFinal: 0,
  fecha: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
  activo: true
};

const BalanceFlowForm: React.FC<BalanceFlowFormProps> = ({ open, balanceFlow, onClose }) => {
  const [formData, setFormData] = useState<BalanceFlowFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { createBalanceFlow, updateBalanceFlow } = useBalanceFlows();
  const { phoneLines, loading: loadingPhoneLines, fetchPhoneLines } = usePhoneLines();

  // Cargar líneas telefónicas al abrir el formulario
  useEffect(() => {
    if (open) {
      fetchPhoneLines();
    }
  }, [open, fetchPhoneLines]);

  // Inicializar formulario con datos del flujo de saldo seleccionado
  useEffect(() => {
    if (balanceFlow) {
      setFormData({
        id: balanceFlow.id,
        telefonicaId: balanceFlow.telefonicaId,
        nombre: balanceFlow.nombre,
        saldoInicial: balanceFlow.saldoInicial,
        saldoComprado: balanceFlow.saldoComprado,
        saldoVendido: balanceFlow.saldoVendido,
        saldoFinal: balanceFlow.saldoFinal,
        fecha: format(new Date(balanceFlow.fecha), 'yyyy-MM-dd\'T\'HH:mm'),
        activo: balanceFlow.activo
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [balanceFlow, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  // Calcular saldo final automáticamente
  useEffect(() => {
    const saldoFinal = formData.saldoInicial + formData.saldoComprado - formData.saldoVendido;
    setFormData(prev => ({
      ...prev,
      saldoFinal
    }));
  }, [formData.saldoInicial, formData.saldoComprado, formData.saldoVendido]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.telefonicaId === 0) {
      newErrors.telefonicaId = 'Debe seleccionar una línea telefónica';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (formData.saldoInicial < 0) {
      newErrors.saldoInicial = 'El saldo inicial no puede ser negativo';
    }

    if (formData.saldoComprado < 0) {
      newErrors.saldoComprado = 'El saldo comprado no puede ser negativo';
    }

    if (formData.saldoVendido < 0) {
      newErrors.saldoVendido = 'El saldo vendido no puede ser negativo';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Crear una copia del formData para manipular la fecha
      const dataToSend = {...formData};
      
      // Asegurar que la fecha sea una cadena ISO
      if (dataToSend.fecha) {
        // Convertir a objeto Date y luego a cadena ISO
        const dateObj = new Date(dataToSend.fecha);
        dataToSend.fecha = dateObj.toISOString();
        console.log('Fecha enviada al backend:', dataToSend.fecha);
      }
      
      if (balanceFlow) {
        // Actualizar flujo de saldo existente
        await updateBalanceFlow(balanceFlow.id, dataToSend);
      } else {
        // Crear nuevo flujo de saldo
        await createBalanceFlow(dataToSend);
      }
      onClose(true); // Cerrar y refrescar datos
    } catch (error) {
      console.error('Error al guardar flujo de saldo:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>
        {balanceFlow ? 'Editar Flujo de Saldo' : 'Nuevo Flujo de Saldo'}
      </DialogTitle>
      <DialogContent>
        {loadingPhoneLines ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.telefonicaId}>
                <InputLabel id="telefonica-label">Línea Telefónica</InputLabel>
                <Select
                  labelId="telefonica-label"
                  name="telefonicaId"
                  value={formData.telefonicaId}
                  onChange={handleChange}
                  label="Línea Telefónica"
                >
                  <MenuItem value={0}>Seleccione una línea telefónica</MenuItem>
                  {phoneLines.map(phoneLine => (
                    <MenuItem key={phoneLine.id} value={phoneLine.id}>
                      {phoneLine.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.telefonicaId && (
                  <Typography variant="caption" color="error">
                    {errors.telefonicaId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Saldo Inicial"
                name="saldoInicial"
                type="number"
                value={formData.saldoInicial}
                onChange={handleNumberChange}
                error={!!errors.saldoInicial}
                helperText={errors.saldoInicial}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Saldo Comprado"
                name="saldoComprado"
                type="number"
                value={formData.saldoComprado}
                onChange={handleNumberChange}
                error={!!errors.saldoComprado}
                helperText={errors.saldoComprado}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Saldo Vendido"
                name="saldoVendido"
                type="number"
                value={formData.saldoVendido}
                onChange={handleNumberChange}
                error={!!errors.saldoVendido}
                helperText={errors.saldoVendido}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Saldo Final"
                name="saldoFinal"
                type="number"
                value={formData.saldoFinal}
                disabled
                InputProps={{
                  inputProps: { step: 0.01 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha"
                name="fecha"
                type="datetime-local"
                value={formData.fecha}
                onChange={handleChange}
                error={!!errors.fecha}
                helperText={errors.fecha}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
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
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} disabled={submitting}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained" 
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BalanceFlowForm;
