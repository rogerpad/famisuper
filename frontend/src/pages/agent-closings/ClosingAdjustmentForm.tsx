import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { agentClosingsApi, AdjustClosingDto, AgentClosing } from '../../api/agent-closings/agentClosingsApi';

interface ClosingAdjustmentFormProps {
  open: boolean;
  onClose: () => void;
  closing: AgentClosing | null;
  onAdjustmentComplete: () => void;
}

const ClosingAdjustmentForm: React.FC<ClosingAdjustmentFormProps> = ({
  open,
  onClose,
  closing,
  onAdjustmentComplete
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      adjustmentAmount: 0,
      justification: ''
    },
    validationSchema: Yup.object({
      adjustmentAmount: Yup.number()
        .required('El monto de ajuste es requerido')
        .test(
          'not-zero',
          'El monto de ajuste no puede ser cero',
          value => value !== 0
        ),
      justification: Yup.string()
        .required('La justificación es requerida')
        .min(10, 'La justificación debe tener al menos 10 caracteres')
    }),
    onSubmit: async (values) => {
      if (!closing) return;
      
      setLoading(true);
      try {
        console.log('[CLOSING_ADJUSTMENT_FORM] Enviando ajuste:', values);
        
        const adjustData: AdjustClosingDto = {
          adjustmentAmount: Number(values.adjustmentAmount),
          justification: values.justification
        };
        
        await agentClosingsApi.adjustClosing(closing.id, adjustData);
        
        enqueueSnackbar('Ajuste realizado correctamente', { variant: 'success' });
        onAdjustmentComplete();
        onClose();
      } catch (error: any) {
        console.error('[CLOSING_ADJUSTMENT_FORM] Error al realizar ajuste:', error);
        
        // Extraer mensaje de error detallado
        let errorMessage = 'Error desconocido al realizar el ajuste';
        
        if (error.response) {
          console.error('[CLOSING_ADJUSTMENT_FORM] Detalles de la respuesta de error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
          
          // Intentar obtener mensaje detallado del backend
          errorMessage = error.response.data?.message || 
                       error.response.data?.error || 
                       `Error ${error.response.status}: ${error.response.statusText}`;
                       
          // Verificar si es un error de cierre duplicado o conflicto
          if (errorMessage.includes('Ya existe un cierre') || 
              errorMessage.includes('mismo día') || 
              errorMessage.includes('mismo turno')) {
            errorMessage = 'Ya existe un cierre para este agente en esta fecha y turno. ' +
                         'Por favor, seleccione otro turno o modifique la fecha.';
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  });

  if (!closing) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajustar Cierre Final</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Cierre ID: {closing.id}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Proveedor: {closing.proveedor?.nombre || 'No disponible'}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Fecha: {new Date(closing.fechaCierre).toLocaleDateString()}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Resultado Final Actual: {(closing.resultadoFinal !== null && closing.resultadoFinal !== undefined) ? Number(closing.resultadoFinal).toFixed(2) : '0.00'}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              id="adjustmentAmount"
              name="adjustmentAmount"
              label="Monto de Ajuste"
              type="number"
              value={formik.values.adjustmentAmount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adjustmentAmount && Boolean(formik.errors.adjustmentAmount)}
              helperText={formik.touched.adjustmentAmount && formik.errors.adjustmentAmount}
              InputProps={{
                startAdornment: <InputAdornment position="start">C$</InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Nuevo Resultado Final: {(((closing.resultadoFinal !== null && closing.resultadoFinal !== undefined) ? Number(closing.resultadoFinal) : 0) + Number(formik.values.adjustmentAmount || 0)).toFixed(2)}
            </Typography>
            
            <TextField
              fullWidth
              id="justification"
              name="justification"
              label="Justificación"
              multiline
              rows={4}
              value={formik.values.justification}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.justification && Boolean(formik.errors.justification)}
              helperText={formik.touched.justification && formik.errors.justification}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={() => formik.handleSubmit()} 
          variant="contained" 
          color="primary"
          disabled={loading || !formik.isValid}
        >
          {loading ? 'Procesando...' : 'Guardar Ajuste'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClosingAdjustmentForm;
