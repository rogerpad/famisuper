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
      console.log('[BalanceFlowForm] Cargando datos para edición:', balanceFlow);
      console.log('[BalanceFlowForm] Tipo de telefonicaId recibido:', typeof balanceFlow.telefonicaId);
      
      // Funciones de utilidad para conversión segura de tipos
      const safeParseInt = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseInt(String(value).trim()) || 0;
      };
      
      const safeParseFloat = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseFloat(String(value).trim()) || 0;
      };
      
      // Asegurar que todos los campos numéricos sean del tipo correcto
      const formDataWithCorrectTypes = {
        id: balanceFlow.id,
        telefonicaId: safeParseInt(balanceFlow.telefonicaId),
        nombre: balanceFlow.nombre,
        saldoInicial: safeParseFloat(balanceFlow.saldoInicial),
        saldoComprado: safeParseFloat(balanceFlow.saldoComprado),
        saldoVendido: safeParseFloat(balanceFlow.saldoVendido),
        saldoFinal: safeParseFloat(balanceFlow.saldoFinal),
        fecha: format(new Date(balanceFlow.fecha), 'yyyy-MM-dd\'T\'HH:mm'),
        activo: Boolean(balanceFlow.activo)
      };
      
      console.log('[BalanceFlowForm] Datos convertidos para el formulario:', formDataWithCorrectTypes);
      setFormData(formDataWithCorrectTypes);
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [balanceFlow, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<number | string>) => {
    const { name, value } = e.target;
    if (name) {
      console.log(`[BalanceFlowForm] Campo cambiado: ${name}, valor: ${value}, tipo: ${typeof value}`);
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
    // Obtener la línea telefónica seleccionada
    const selectedPhoneLine = phoneLines.find(line => line.id === formData.telefonicaId);
    const isLineTigo = selectedPhoneLine?.nombre === 'Tigo';
    
    // Cálculo base del saldo final
    let saldoFinal = formData.saldoInicial + formData.saldoComprado - formData.saldoVendido;
    
    // Aplicar regla especial para Tigo: adicionar 5.5% al saldo comprado
    if (isLineTigo && formData.nombre === 'Flujo Tigo') {
      const bonificacion = formData.saldoComprado * 0.055;
      saldoFinal += bonificacion;
      console.log(`[BalanceFlowForm] Aplicando bonificación Tigo: ${bonificacion.toFixed(2)} (5.5% de ${formData.saldoComprado})`);
    }
    
    setFormData(prev => ({
      ...prev,
      saldoFinal
    }));
  }, [formData.saldoInicial, formData.saldoComprado, formData.saldoVendido, formData.telefonicaId, formData.nombre, phoneLines]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.telefonicaId === 0) {
      newErrors.telefonicaId = 'Debe seleccionar una línea telefónica';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre !== 'Flujo Tigo' && formData.nombre !== 'Flujo Claro') {
      newErrors.nombre = 'El nombre debe ser "Flujo Tigo" o "Flujo Claro"';
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
    console.log(`[BalanceFlowForm] Iniciando ${balanceFlow ? 'actualización' : 'creación'} de flujo de saldo`);
    console.log('[BalanceFlowForm] Estado del formulario antes de enviar:', formData);

    try {
      // Funciones de utilidad para conversión segura de tipos
      const safeParseInt = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseInt(String(value).trim()) || 0;
      };
      
      const safeParseFloat = (value: any): number => {
        if (typeof value === 'number') return value;
        return parseFloat(String(value).trim()) || 0;
      };
      
      // Crear una copia del formData con conversiones seguras de tipo
      const dataToSend = {
        ...formData,
        telefonicaId: safeParseInt(formData.telefonicaId),
        saldoInicial: safeParseFloat(formData.saldoInicial),
        saldoComprado: safeParseFloat(formData.saldoComprado),
        saldoVendido: safeParseFloat(formData.saldoVendido),
        saldoFinal: safeParseFloat(formData.saldoFinal),
        activo: Boolean(formData.activo)
      };
      
      // Asegurar que la fecha sea una cadena ISO
      if (dataToSend.fecha) {
        // Convertir a objeto Date y luego a cadena ISO
        const dateObj = new Date(dataToSend.fecha);
        dataToSend.fecha = dateObj.toISOString();
        console.log('[BalanceFlowForm] Fecha enviada al backend:', dataToSend.fecha);
      }
      
      console.log('[BalanceFlowForm] Datos convertidos a enviar:', dataToSend);
      
      if (balanceFlow) {
        // Actualizar flujo de saldo existente
        const result = await updateBalanceFlow(balanceFlow.id, dataToSend);
        console.log('[BalanceFlowForm] Resultado de la actualización:', result);
      } else {
        // Crear nuevo flujo de saldo
        const result = await createBalanceFlow(dataToSend);
        console.log('[BalanceFlowForm] Resultado de la creación:', result);
      }
      onClose(true); // Cerrar y refrescar datos
    } catch (error: any) {
      console.error('[BalanceFlowForm] Error al guardar flujo de saldo:', error);
      alert(`Error al ${balanceFlow ? 'actualizar' : 'crear'} el flujo de saldo: ${error.message || 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
      console.log(`[BalanceFlowForm] Finalizado ${balanceFlow ? 'actualización' : 'creación'} de flujo de saldo`);
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
                  value={formData.telefonicaId || 0}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    console.log('[BalanceFlowForm] Seleccionado telefonicaId:', value);
                    setFormData(prev => ({
                      ...prev,
                      telefonicaId: value
                    }));
                  }}
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
              <FormControl fullWidth error={!!errors.nombre}>
                <InputLabel id="nombre-label">Nombre</InputLabel>
                <Select
                  labelId="nombre-label"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  label="Nombre"
                >
                  <MenuItem value="Flujo Tigo">Flujo Tigo</MenuItem>
                  <MenuItem value="Flujo Claro">Flujo Claro</MenuItem>
                </Select>
                {errors.nombre && (
                  <Typography variant="caption" color="error">
                    {errors.nombre}
                  </Typography>
                )}
              </FormControl>
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
              {formData.telefonicaId > 0 && phoneLines.find(line => line.id === formData.telefonicaId)?.nombre === 'Tigo' && formData.nombre === 'Flujo Tigo' && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                  Incluye bonificación del 5.5% sobre el saldo comprado (L. {(formData.saldoComprado * 0.055).toFixed(2)})
                </Typography>
              )}
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
