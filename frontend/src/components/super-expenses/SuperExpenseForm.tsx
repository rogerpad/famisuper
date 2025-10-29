import React, { useState, useEffect, ReactNode } from 'react';
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
  Grid,
  FormHelperText,
  InputAdornment,
  Box,
  Typography,
  SelectChangeEvent,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { SuperExpense, CreateSuperExpenseDto } from '../../api/super-expenses/types';
import { useSuperExpenses } from '../../api/super-expenses/superExpensesApi';
import { useSuperExpenseTypes } from '../../api/super-expense-types/superExpenseTypesApi';
import { usePaymentDocuments } from '../../api/payment-documents/paymentDocumentsApi';
import { usePaymentMethods } from '../../api/payment-methods/paymentMethodsApi';
import { useSnackbar } from 'notistack';
import { SuperExpenseType } from '../../api/super-expense-types/types';
import { PaymentDocument } from '../../api/payment-documents/types';
import { PaymentMethod } from '../../api/payment-methods/types';

// Función helper para formatear fecha en zona horaria local (evita problemas de UTC)
const formatDateToLocal = (date: Date | string): string => {
  // Si es un string con formato YYYY-MM-DD, usarlo directamente
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.split('T')[0]; // Extraer solo la parte de fecha
  }
  
  // Si es Date, formatear usando métodos locales
  const dateObj = date instanceof Date ? date : new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface SuperExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  superExpense: SuperExpense | null;
}

const SuperExpenseForm: React.FC<SuperExpenseFormProps> = ({
  open,
  onClose,
  onSubmit,
  superExpense,
}) => {
  const initialFormState: CreateSuperExpenseDto = {
    tipoEgresoId: 0,
    descripcionEgreso: '',
    documentoPagoId: undefined,
    nroFactura: '',
    excento: 0,
    gravado: 0,
    impuesto: 0,
    total: 0,
    formaPagoId: 0,
    fechaEgreso: formatDateToLocal(new Date()),
    hora: new Date().toTimeString().slice(0, 5), // Formato HH:MM
    activo: true,
  };

  const [formData, setFormData] = useState<CreateSuperExpenseDto>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createSuperExpense, updateSuperExpense } = useSuperExpenses();
  const { types: superExpenseTypes = [] } = useSuperExpenseTypes();
  const { paymentDocuments = [] } = usePaymentDocuments();
  const { paymentMethods = [] } = usePaymentMethods();
  const { enqueueSnackbar } = useSnackbar();

  // Función para calcular el total a partir de los valores actuales
  const calculateTotal = (excento: number | string, gravado: number | string, impuesto: number | string): number => {
    // Asegurar que todos los valores sean números antes de sumar
    const excentoNum = typeof excento === 'string' ? parseFloat(excento) || 0 : (excento || 0);
    const gravadoNum = typeof gravado === 'string' ? parseFloat(gravado) || 0 : (gravado || 0);
    const impuestoNum = typeof impuesto === 'string' ? parseFloat(impuesto) || 0 : (impuesto || 0);
    
    // Realizar la suma numérica
    return excentoNum + gravadoNum + impuestoNum;
  };

  // Función para recalcular el total basado en los valores actuales
  const recalculateTotal = (data: Partial<CreateSuperExpenseDto>): number => {
    return calculateTotal(
      data.excento || 0,
      data.gravado || 0,
      data.impuesto || 0
    );
  };

  useEffect(() => {
    if (superExpense) {
      console.log('[SUPER_EXPENSE_FORM] Inicializando formulario con datos:', superExpense);
      console.log('[SUPER_EXPENSE_FORM] Fecha recibida del backend:', superExpense.fechaEgreso, 'Tipo:', typeof superExpense.fechaEgreso);
      
      // Función para asegurar que los valores sean números
      const ensureNumber = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      };
      
      // Preparar los datos iniciales asegurando que los IDs sean números
      const initialData = {
        tipoEgresoId: ensureNumber(superExpense.tipoEgresoId),
        descripcionEgreso: superExpense.descripcionEgreso || '',
        documentoPagoId: superExpense.documentoPagoId !== null ? ensureNumber(superExpense.documentoPagoId) : undefined,
        nroFactura: superExpense.nroFactura || '',
        excento: ensureNumber(superExpense.excento),
        gravado: ensureNumber(superExpense.gravado),
        impuesto: ensureNumber(superExpense.impuesto),
        formaPagoId: ensureNumber(superExpense.formaPagoId),
        // Usar formatDateToLocal que ahora maneja strings directamente sin conversión UTC
        fechaEgreso: formatDateToLocal(superExpense.fechaEgreso),
        hora: superExpense.hora || new Date().toTimeString().slice(0, 5),
        activo: superExpense.activo,
      };
      
      console.log('[SUPER_EXPENSE_FORM] Fecha formateada para el formulario:', initialData.fechaEgreso);
      console.log('[SUPER_EXPENSE_FORM] Datos iniciales procesados:', initialData);
      
      // Calcular el total basado en los valores actuales para asegurar consistencia
      const calculatedTotal = recalculateTotal(initialData);
      
      // Si el total calculado difiere del almacenado, usar el calculado para mayor consistencia
      const finalTotal = Math.abs(calculatedTotal - ensureNumber(superExpense.total)) < 0.01 
        ? ensureNumber(superExpense.total) 
        : calculatedTotal;
      
      console.log(`Total almacenado: ${superExpense.total}, Total calculado: ${calculatedTotal}, Total final: ${finalTotal}`);
      
      // Establecer los datos del formulario con el total recalculado
      setFormData({
        ...initialData,
        total: finalTotal
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [superExpense, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipoEgresoId) {
      newErrors.tipoEgresoId = 'El tipo de egreso es obligatorio';
    }

    if (!formData.descripcionEgreso || formData.descripcionEgreso.trim() === '') {
      newErrors.descripcionEgreso = 'La descripción es obligatoria';
    }

    if (!formData.documentoPagoId) {
      newErrors.documentoPagoId = 'El documento de pago es obligatorio';
    }

    if (!formData.formaPagoId) {
      newErrors.formaPagoId = 'La forma de pago es obligatoria';
    }

    if (!formData.fechaEgreso) {
      newErrors.fechaEgreso = 'La fecha es obligatoria';
    }
    
    if (!formData.hora) {
      newErrors.hora = 'La hora es obligatoria';
    } else {
      // Validar formato de hora (HH:MM o HH:MM:SS)
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      if (!horaRegex.test(formData.hora)) {
        newErrors.hora = 'Formato de hora inválido. Use HH:MM';
      }
    }

    if (formData.total <= 0) {
      newErrors.total = 'El total debe ser mayor que cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<number | string | ''>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    // Convertir valores numéricos para los campos de ID
    let processedValue = value;
    if (['tipoEgresoId', 'formaPagoId'].includes(name)) {
      processedValue = value === '' ? 0 : Number(value);
      console.log(`Convirtiendo ${name} de ${value} a ${processedValue}`);
    } else if (name === 'documentoPagoId') {
      processedValue = value === '' ? undefined : Number(value);
      console.log(`Convirtiendo ${name} de ${value} a ${processedValue}`);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // useEffect para mantener sincronizado el total cuando cambien los valores que lo componen
  useEffect(() => {
    // Solo recalcular si al menos uno de los campos tiene valor
    if (formData.excento !== undefined || formData.gravado !== undefined || formData.impuesto !== undefined) {
      const newTotal = calculateTotal(
        formData.excento || 0,
        formData.gravado || 0,
        formData.impuesto || 0
      );
      
      // Actualizar el total solo si es diferente al actual (evitar bucles infinitos)
      // Usar una comparación con tolerancia para números flotantes
      const totalDiff = Math.abs(newTotal - (formData.total || 0));
      if (totalDiff > 0.001) {
        console.log(`Recalculando total: ${formData.excento} + ${formData.gravado} + ${formData.impuesto} = ${newTotal} (anterior: ${formData.total})`);
        setFormData(prev => ({
          ...prev,
          total: newTotal
        }));
      }
    }
  }, [formData.excento, formData.gravado, formData.impuesto]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    // Si el campo modificado es "gravado", calcular automáticamente el impuesto (15%)
    if (name === 'gravado') {
      const calculatedTax = numValue * 0.15;
      
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
        impuesto: Math.round(calculatedTax * 100) / 100 // Redondear a 2 decimales
      }));
      
      console.log(`Campo ${name} actualizado a ${numValue}, impuesto calculado: ${Math.round(calculatedTax * 100) / 100}`);
    } else {
      // Para otros campos, solo actualizar el campo modificado
      setFormData((prev) => ({
        ...prev,
        [name]: numValue
      }));
      
      console.log(`Campo ${name} actualizado a ${numValue}`);
    }
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Crear una copia limpia de los datos para enviar
      const cleanData = { ...formData };
      
      // IMPORTANTE: Asegurar que los campos de ID sean siempre números válidos
      // y que se incluyan siempre en la solicitud de actualización
      
      // Tipo de Egreso - campo obligatorio
      cleanData.tipoEgresoId = Number(cleanData.tipoEgresoId || 0);
      if (cleanData.tipoEgresoId === 0) {
        setErrors(prev => ({ ...prev, tipoEgresoId: 'Tipo de egreso es requerido' }));
        return;
      }
      
      // Forma de Pago - campo obligatorio
      cleanData.formaPagoId = Number(cleanData.formaPagoId || 0);
      if (cleanData.formaPagoId === 0) {
        setErrors(prev => ({ ...prev, formaPagoId: 'Forma de pago es requerida' }));
        return;
      }
      
      // Documento de Pago - puede ser opcional dependiendo del tipo de egreso
      if (cleanData.documentoPagoId !== undefined && cleanData.documentoPagoId !== null && String(cleanData.documentoPagoId) !== '') {
        cleanData.documentoPagoId = Number(cleanData.documentoPagoId);
      } else {
        // Si está vacío, eliminarlo del objeto para que el backend lo maneje como undefined
        delete cleanData.documentoPagoId;
      }
      
      // Manejar nroFactura - si está vacío, eliminarlo del objeto
      if (cleanData.nroFactura === '') {
        delete cleanData.nroFactura;
      }
      
      // Asegurar que los campos numéricos sean números válidos o 0
      cleanData.excento = Number(cleanData.excento || 0);
      cleanData.gravado = Number(cleanData.gravado || 0);
      cleanData.impuesto = Number(cleanData.impuesto || 0);
      cleanData.total = Number(cleanData.total || 0);
      
      // Asegurar que la hora tenga el formato correcto (HH:MM:SS)
      if (cleanData.hora && cleanData.hora.split(':').length === 2) {
        cleanData.hora = `${cleanData.hora}:00`;
      }
      
      console.log('Datos limpios a enviar:', JSON.stringify(cleanData, null, 2));
      
      if (superExpense) {
        try {
          await updateSuperExpense(superExpense.id, cleanData);
          enqueueSnackbar('Egreso actualizado correctamente', { variant: 'success' });
          onSubmit();
        } catch (updateError: any) {
          console.error('Error al actualizar el egreso:', updateError);
          
          // Mostrar mensaje de error más detallado si está disponible
          if (updateError.response && updateError.response.data && updateError.response.data.message) {
            enqueueSnackbar(`Error: ${updateError.response.data.message}`, { variant: 'error' });
          } else {
            enqueueSnackbar('Error al actualizar el egreso. Verifique los datos e intente nuevamente.', { variant: 'error' });
          }
        }
      } else {
        try {
          await createSuperExpense(cleanData);
          enqueueSnackbar('Egreso creado correctamente', { variant: 'success' });
          onSubmit();
        } catch (createError: any) {
          console.error('Error al crear el egreso:', createError);
          
          // Mostrar mensaje de error más detallado si está disponible
          if (createError.response && createError.response.data && createError.response.data.message) {
            enqueueSnackbar(`Error: ${createError.response.data.message}`, { variant: 'error' });
          } else {
            enqueueSnackbar('Error al crear el egreso. Verifique los datos e intente nuevamente.', { variant: 'error' });
          }
        }
      }
    } catch (error) {
      console.error('Error inesperado al guardar el egreso:', error);
      enqueueSnackbar('Error inesperado al procesar la solicitud', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {superExpense ? 'Editar Egreso de Super' : 'Nuevo Egreso de Super'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.tipoEgresoId}>
                <InputLabel id="tipo-egreso-label">Tipo de Egreso *</InputLabel>
                <Select
                  labelId="tipo-egreso-label"
                  id="tipoEgresoId"
                  name="tipoEgresoId"
                  value={Number(formData.tipoEgresoId) || 0}
                  onChange={handleChange}
                  label="Tipo de Egreso *"
                >
                  <MenuItem value={0} disabled>
                    Seleccione un tipo de egreso
                  </MenuItem>
                  {superExpenseTypes
                    .filter((type: SuperExpenseType) => type.activo)
                    .map((type: SuperExpenseType) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.nombre}
                      </MenuItem>
                    ))}
                </Select>
                {errors.tipoEgresoId && (
                  <FormHelperText>{errors.tipoEgresoId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha de Egreso *"
                type="date"
                name="fechaEgreso"
                value={formData.fechaEgreso}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fechaEgreso}
                helperText={errors.fechaEgreso}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Hora *"
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.hora}
                helperText={errors.hora}
                inputProps={{ step: 60 }} // Intervalo de minutos
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción *"
                name="descripcionEgreso"
                value={formData.descripcionEgreso}
                onChange={handleChange}
                multiline
                rows={2}
                error={!!errors.descripcionEgreso}
                helperText={errors.descripcionEgreso}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.documentoPagoId}>
                <InputLabel id="documento-pago-label">Documento de Pago *</InputLabel>
                <Select
                  labelId="documento-pago-label"
                  id="documentoPagoId"
                  name="documentoPagoId"
                  value={formData.documentoPagoId !== undefined ? Number(formData.documentoPagoId) : ''}
                  onChange={handleChange}
                  label="Documento de Pago *"
                >
                  <MenuItem value="" disabled>
                    Seleccione un documento de pago
                  </MenuItem>
                  {paymentDocuments
                    .filter((doc: PaymentDocument) => doc.activo)
                    .map((doc: PaymentDocument) => (
                      <MenuItem key={doc.id} value={doc.id}>
                        {doc.nombre}
                      </MenuItem>
                    ))}
                </Select>
                {errors.documentoPagoId && (
                  <FormHelperText>{errors.documentoPagoId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Factura"
                name="nroFactura"
                value={formData.nroFactura}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Exento"
                    name="excento"
                    type="number"
                    value={formData.excento}
                    onChange={handleNumberChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Gravado"
                    name="gravado"
                    type="number"
                    value={formData.gravado}
                    onChange={handleNumberChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Impuesto"
                    name="impuesto"
                    type="number"
                    value={formData.impuesto}
                    onChange={handleNumberChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
              
              <Grid container>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total *"
                    name="total"
                    type="number"
                    value={formData.total}
                    onChange={handleNumberChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                    }}
                    error={!!errors.total}
                    helperText={errors.total}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.formaPagoId}>
                <InputLabel id="forma-pago-label">Forma de Pago *</InputLabel>
                <Select
                  labelId="forma-pago-label"
                  id="formaPagoId"
                  name="formaPagoId"
                  value={Number(formData.formaPagoId) || 0}
                  onChange={handleChange}
                  label="Forma de Pago *"
                >
                  <MenuItem value={0} disabled>
                    Seleccione una forma de pago
                  </MenuItem>
                  {paymentMethods
                    .filter((method: PaymentMethod) => method.activo)
                    .map((method: PaymentMethod) => (
                      <MenuItem key={method.id} value={method.id}>
                        {method.nombre}
                      </MenuItem>
                    ))}
                </Select>
                {errors.formaPagoId && (
                  <FormHelperText>{errors.formaPagoId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              * Campos obligatorios
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {superExpense ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuperExpenseForm;
