import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import { usePaymentMethods } from '../../api/payment-methods/paymentMethodsApi';
import { PaymentMethod, CreatePaymentMethodDto } from '../../api/payment-methods/types';

interface PaymentMethodFormProps {
  open: boolean;
  onClose: (success?: boolean, isNew?: boolean) => void;
  paymentMethod: PaymentMethod | null;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  open,
  onClose,
  paymentMethod,
}) => {
  const { createPaymentMethod, updatePaymentMethod } = usePaymentMethods();
  const [formData, setFormData] = useState<CreatePaymentMethodDto>({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del método de pago si se está editando
  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        nombre: paymentMethod.nombre,
        descripcion: paymentMethod.descripcion || '',
        activo: paymentMethod.activo,
      });
    } else {
      // Resetear el formulario si es una nueva forma de pago
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true,
      });
    }
    setErrors({});
  }, [paymentMethod, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario comienza a escribir
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (paymentMethod) {
        // Actualizar forma de pago existente
        await updatePaymentMethod(paymentMethod.id, formData);
        // Comunicar éxito al componente padre (false para isNew porque es una actualización)
        onClose(true, false);
      } else {
        // Crear nueva forma de pago
        await createPaymentMethod(formData);
        // Comunicar éxito al componente padre (true para isNew porque es una creación)
        onClose(true, true);
      }
    } catch (error) {
      console.error('Error al guardar la forma de pago:', error);
      // Comunicar error al componente padre
      onClose(false);
    }
  };

  // Manejador para el cierre del diálogo por eventos del sistema (clic en backdrop o tecla Escape)
  const handleDialogClose = (_: {}, reason: "backdropClick" | "escapeKeyDown") => {
    // Solo cerramos el diálogo sin indicar éxito
    onClose(false);
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {paymentMethod ? 'Editar Forma de Pago' : 'Nueva Forma de Pago'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            name="nombre"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nombre}
            onChange={handleChange}
            error={!!errors.nombre}
            helperText={errors.nombre || ''}
            required
          />
          <TextField
            margin="dense"
            name="descripcion"
            label="Descripción"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.descripcion}
            onChange={handleChange}
            multiline
            rows={3}
          />
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
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => onClose(false)} 
          color="inherit"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          variant="contained"
        >
          {paymentMethod ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentMethodForm;
