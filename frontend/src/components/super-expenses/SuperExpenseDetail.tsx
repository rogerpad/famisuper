import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Paper
} from '@mui/material';
import { SuperExpense } from '../../api/super-expenses/types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

interface SuperExpenseDetailProps {
  open: boolean;
  onClose: () => void;
  superExpense: SuperExpense;
}

const SuperExpenseDetail: React.FC<SuperExpenseDetailProps> = ({ open, onClose, superExpense }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">Detalle de Egreso de Super</Typography>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Fecha
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(superExpense.fechaEgreso)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Estado
              </Typography>
              <Typography variant="body1" gutterBottom>
                {superExpense.activo ? 'Activo' : 'Inactivo'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Tipo de Egreso
              </Typography>
              <Typography variant="body1" gutterBottom>
                {superExpense.tipoEgreso?.nombre || 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Total
              </Typography>
              <Typography variant="body1" gutterBottom fontWeight="bold">
                {formatCurrency(superExpense.total)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Descripción
              </Typography>
              <Typography variant="body1" gutterBottom>
                {superExpense.descripcionEgreso || 'Sin descripción'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información de Pago
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Forma de Pago
              </Typography>
              <Typography variant="body1" gutterBottom>
                {superExpense.formaPago?.nombre || 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Documento de Pago
              </Typography>
              <Typography variant="body1" gutterBottom>
                {superExpense.documentoPago?.nombre || 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Número de Factura
              </Typography>
              <Typography variant="body1" gutterBottom>
                {superExpense.nroFactura || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={0} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Desglose de Montos
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Exento
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatCurrency(superExpense.excento)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Gravado
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatCurrency(superExpense.gravado)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Impuesto
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatCurrency(superExpense.impuesto)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={0} sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información Adicional
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Creado por
              </Typography>
              <Typography variant="body1" gutterBottom>
                {superExpense.usuario?.nombre || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuperExpenseDetail;
