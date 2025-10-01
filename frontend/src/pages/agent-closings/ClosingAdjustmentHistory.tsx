import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { agentClosingsApi, ClosingAdjustment, AgentClosing } from '../../api/agent-closings/agentClosingsApi';

interface ClosingAdjustmentHistoryProps {
  open: boolean;
  onClose: () => void;
  closingId: number;
}

const ClosingAdjustmentHistory: React.FC<ClosingAdjustmentHistoryProps> = ({
  open,
  onClose,
  closingId
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<ClosingAdjustment[]>([]);

  useEffect(() => {
    if (open && closingId > 0) {
      loadAdjustments();
    }
  }, [open, closingId]);

  const loadAdjustments = async () => {
    if (!closingId || closingId <= 0) return;
    
    setLoading(true);
    try {
      console.log(`[CLOSING_ADJUSTMENT_HISTORY] Cargando ajustes para cierre ${closingId}`);
      const data = await agentClosingsApi.getClosingAdjustments(closingId);
      setAdjustments(data);
    } catch (error) {
      console.error('[CLOSING_ADJUSTMENT_HISTORY] Error al cargar ajustes:', error);
      enqueueSnackbar('Error al cargar el historial de ajustes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (closingId <= 0) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Historial de Ajustes</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Cierre ID: {closingId}
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : adjustments.length === 0 ? (
            <Typography variant="body1" sx={{ my: 4, textAlign: 'center' }}>
              No hay ajustes registrados para este cierre.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Monto Ajuste</TableCell>
                    <TableCell>Resultado Anterior</TableCell>
                    <TableCell>Resultado Nuevo</TableCell>
                    <TableCell>Diferencia Anterior</TableCell>
                    <TableCell>Diferencia Nueva</TableCell>
                    <TableCell>Justificación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      <TableCell>
                        {new Date(adjustment.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {adjustment.user ? 
                          `${adjustment.user.nombre} ${adjustment.user.apellido}` : 
                          `Usuario ID: ${adjustment.userId}`
                        }
                      </TableCell>
                      <TableCell sx={{ 
                        color: Number(adjustment.adjustmentAmount) > 0 ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {Number(adjustment.adjustmentAmount) > 0 ? '+' : ''}
                        {Number(adjustment.adjustmentAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>{Number(adjustment.previousFinalResult).toFixed(2)}</TableCell>
                      <TableCell>{Number(adjustment.newFinalResult).toFixed(2)}</TableCell>
                      <TableCell>{adjustment.previousDifference !== undefined && adjustment.previousDifference !== null ? Number(adjustment.previousDifference).toFixed(2) : 'N/A'}</TableCell>
                      <TableCell>{adjustment.newDifference !== undefined && adjustment.newDifference !== null ? Number(adjustment.newDifference).toFixed(2) : 'N/A'}</TableCell>
                      <TableCell>{adjustment.justification}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClosingAdjustmentHistory;
