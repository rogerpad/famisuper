import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { usePhoneLines } from '../../api/phoneLines/phoneLinesApi';
import { PhoneLine, CreatePhoneLineDto } from '../../api/phoneLines/types';

interface PhoneLinesFormProps {
  phoneLine: PhoneLine | null;
  onClose: () => void;
}

const PhoneLinesForm: React.FC<PhoneLinesFormProps> = ({ phoneLine, onClose }) => {
  const { createPhoneLine, updatePhoneLine, loading, error } = usePhoneLines();
  
  const [formData, setFormData] = useState<CreatePhoneLineDto>({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    descripcion: '',
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (phoneLine) {
      setFormData({
        nombre: phoneLine.nombre,
        descripcion: phoneLine.descripcion,
        activo: phoneLine.activo,
      });
    }
  }, [phoneLine]);

  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      nombre: '',
      descripcion: '',
    };

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (phoneLine) {
        // Actualizar línea existente
        await updatePhoneLine(phoneLine.id, formData);
      } else {
        // Crear nueva línea
        await createPhoneLine(formData);
      }
      onClose();
    } catch (err) {
      console.error('Error al guardar línea telefónica:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre"
            name="nombre"
            autoFocus
            value={formData.nombre}
            onChange={handleChange}
            error={!!formErrors.nombre}
            helperText={formErrors.nombre}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="descripcion"
            label="Descripción"
            name="descripcion"
            multiline
            rows={3}
            value={formData.descripcion}
            onChange={handleChange}
            error={!!formErrors.descripcion}
            helperText={formErrors.descripcion}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.activo}
                onChange={handleChange}
                name="activo"
                color="primary"
              />
            }
            label="Activo"
          />
        </Grid>
      </Grid>

      {error && (
        <Box mt={2} color="error.main">
          Error: {error}
        </Box>
      )}

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          onClick={onClose}
          color="inherit"
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : phoneLine ? (
            'Actualizar'
          ) : (
            'Crear'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default PhoneLinesForm;
