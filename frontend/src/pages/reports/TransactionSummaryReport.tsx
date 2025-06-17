import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  CircularProgress,
  TextField,
  Alert
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import reportsApi, { TransactionReportData } from '../../api/reports/reportsApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import html2pdf from 'html2pdf.js';

const TransactionSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-01')); // Primer día del mes actual
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd')); // Día actual
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Consulta para obtener los datos del reporte
  const { data, isLoading, isError, refetch } = useQuery<TransactionReportData>({
    queryKey: ['transactionSummary', startDate, endDate],
    queryFn: () => reportsApi.getTransactionSummary(startDate, endDate),
  });

  // Función para exportar a Excel
  const handleExportToExcel = async () => {
    try {
      const blob = await reportsApi.exportToExcel(startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Transacciones_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    }
  };

  // Función para imprimir (descargar PDF)
  const handlePrint = async () => {
    try {
      if (!reportRef.current) {
        throw new Error('No se pudo encontrar el elemento del reporte');
      }

      // Crear una copia del elemento para no modificar el original
      const element = reportRef.current.cloneNode(true) as HTMLElement;
      
      // Configurar opciones para el PDF
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Reporte_Transacciones_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      
      // Generar el PDF
      console.log('Generando PDF...');
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          console.log('PDF generado correctamente');
        })
        .catch((err: any) => {
          console.error('Error al generar el PDF:', err);
          alert('Error al generar el PDF. Por favor, intente nuevamente.');
        });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  // Función para formatear valores monetarios
  const formatCurrency = (value: number) => {
    // Asegurarse de que el valor sea un número
    const numValue = Number(value);
    // Usar Intl.NumberFormat para formatear correctamente los números
    return `L${new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue)}`;
  };

  // Función para generar el reporte
  const handleGenerateReport = () => {
    refetch();
  };
  
  // Función para navegar al formulario de nuevo cierre
  const handleGenerarCierre = () => {
    navigate('/agent-closings/new');
  };

  // Función para calcular el total general de efectivo (suma de todos los tipos)
  const calcularTotalEfectivo = () => {
    let total = 0;
    reportData.transactionTypes.forEach(tipo => {
      total += calcularTotalPorTipo(tipo);
    });
    return total;
  };

  // Función para calcular el total por tipo de transacción (suma de agentes + efectivo)
  const calcularTotalPorTipo = (row: any) => {
    let total = row.efectivo || 0;
    // Sumar los valores de todos los agentes para este tipo de transacción
    Object.values(row.agentes).forEach((valor: any) => {
      total += Number(valor) || 0;
    });
    return total;
  };

  // Función para calcular el total por agente
  const calcularTotalPorAgente = (agenteId: number) => {
    let total = 0;
    reportData.transactionTypes.forEach(tipo => {
      total += Number(tipo.agentes[agenteId]) || 0;
    });
    return total;
  };

  // Datos de ejemplo para desarrollo y pruebas
  const mockData: TransactionReportData = {
    transactionTypes: [
      {
        tipoTransaccion: 'Adicional del Super',
        tipoTransaccionId: 1,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'AdicionalCasa',
        tipoTransaccionId: 2,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Comisión',
        tipoTransaccionId: 3,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Comisión p. servicios',
        tipoTransaccionId: 4,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Depósito',
        tipoTransaccionId: 5,
        agentes: { '1': 800, '2': 1400, '3': 0, '4': 0, '5': 0 },
        efectivo: 1200
      },
      {
        tipoTransaccion: 'Pago',
        tipoTransaccionId: 6,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Pago de factura sin efectivo',
        tipoTransaccionId: 7,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Pago super con transferencia',
        tipoTransaccionId: 8,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Prestamo a caja del super',
        tipoTransaccionId: 9,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Remesa',
        tipoTransaccionId: 10,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Retiro',
        tipoTransaccionId: 11,
        agentes: { '1': 200, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 200
      },
      {
        tipoTransaccion: 'Saldo',
        tipoTransaccionId: 12,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      },
      {
        tipoTransaccion: 'Tasa de Seguridad',
        tipoTransaccionId: 13,
        agentes: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        efectivo: 0
      }
    ],
    agentes: [
      { id: 1, nombre: 'Atlantida' },
      { id: 2, nombre: 'BAC' },
      { id: 3, nombre: 'Banpais' },
      { id: 4, nombre: 'Occidente' },
      { id: 5, nombre: 'TENGO' }
    ],
    totales: { '1': 1000, '2': 1400, '3': 0, '4': 0, '5': 0 },
    totalEfectivo: 1400
  };

  // Usar datos reales o datos de ejemplo
  const reportData = data || mockData;
  
  // Filtrar el proveedor "EFECTIVO AGENTE" para que no se muestre en el reporte
  const filteredAgentes = reportData.agentes.filter(agente => agente.nombre !== 'EFECTIVO AGENTE');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Resumen de Transacciones
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filtros del Reporte
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateReport}
              disabled={isLoading}
              color="primary"
            >
              {isLoading ? <CircularProgress size={24} /> : 'Generar Reporte'}
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerarCierre}
              sx={{ bgcolor: '#dc7633', '&:hover': { bgcolor: '#c56a2d' } }}
            >
              Generar Cierre
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los datos del reporte. Por favor, intente nuevamente.
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Resumen de Transacciones
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExportToExcel}
              sx={{ mr: 1 }}
            >
              Exportar a Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimir
            </Button>
          </Box>
        </Box>
        
        <div ref={reportRef}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Reporte de Transacciones
            </Typography>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Período: {format(new Date(startDate), 'dd/MM/yyyy')} - {format(new Date(endDate), 'dd/MM/yyyy')}
            </Typography>
          </Box>
          
          <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#dc7633' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tipo de Transacción</TableCell>
                {filteredAgentes.map((agente) => (
                  <TableCell key={agente.id} align="right" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {agente.nombre}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>
                  Efectivo
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.transactionTypes.map((row) => (
                <TableRow key={row.tipoTransaccionId}>
                  <TableCell>{row.tipoTransaccion}</TableCell>
                  {filteredAgentes.map((agente) => (
                    <TableCell key={agente.id} align="right">
                      {row.agentes[agente.id] > 0 
                        ? formatCurrency(row.agentes[agente.id]) 
                        : '-'}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ bgcolor: 'hsl(23, 40%, 73%)' }}>
                    {calcularTotalPorTipo(row) > 0 ? formatCurrency(calcularTotalPorTipo(row)) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' } }}>
                <TableCell>TOTAL</TableCell>
                {filteredAgentes.map((agente) => (
                  <TableCell key={agente.id} align="right">
                    {calcularTotalPorAgente(agente.id) > 0 
                      ? formatCurrency(calcularTotalPorAgente(agente.id)) 
                      : 'L0.00'}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ bgcolor: 'hsl(23, 40%, 73%)', color: 'black', fontWeight: 'bold' }}>
                  {formatCurrency(calcularTotalEfectivo())}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        </div>
      </Paper>
    </Box>
  );
};

export default TransactionSummaryReport;
