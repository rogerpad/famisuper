import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('transactions');
  const [startDate, setStartDate] = useState<string>('2025-04-13');
  const [endDate, setEndDate] = useState<string>('2025-05-13');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = () => {
    setLoading(true);
    
    // Simulamos la carga de datos
    setTimeout(() => {
      // Datos de ejemplo para el reporte
      const demoData = [
        { id: '1', date: '2025-05-13', reference: 'TRX-001', amount: 1250.00, status: 'Completada' },
        { id: '2', date: '2025-05-12', reference: 'TRX-002', amount: 890.50, status: 'Completada' },
        { id: '3', date: '2025-05-11', reference: 'TRX-003', amount: 2340.75, status: 'Pendiente' },
        { id: '4', date: '2025-05-10', reference: 'TRX-004', amount: 1100.25, status: 'Completada' },
        { id: '5', date: '2025-05-09', reference: 'TRX-005', amount: 760.00, status: 'Pendiente' },
        { id: '6', date: '2025-05-08', reference: 'TRX-006', amount: 1500.00, status: 'Cancelada' },
        { id: '7', date: '2025-05-07', reference: 'TRX-007', amount: 950.30, status: 'Completada' },
        { id: '8', date: '2025-05-06', reference: 'TRX-008', amount: 2100.00, status: 'Pendiente' },
      ];
      
      setReportData(demoData);
      setLoading(false);
    }, 1500);
    
    // En una implementación real, usaríamos:
    // const fetchReportData = async () => {
    //   try {
    //     const response = await api.get('/reports', {
    //       params: {
    //         type: reportType,
    //         startDate: startDate?.toISOString().split('T')[0],
    //         endDate: endDate?.toISOString().split('T')[0],
    //       }
    //     });
    //     setReportData(response.data);
    //   } catch (error) {
    //     console.error('Error fetching report data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchReportData();
  };

  const handleDownloadReport = (format: string) => {
    // En una implementación real, descargaríamos el reporte
    console.log(`Descargando reporte en formato ${format}`);
    // window.location.href = `/api/reports/download?type=${reportType}&format=${format}&startDate=${startDate?.toISOString().split('T')[0]}&endDate=${endDate?.toISOString().split('T')[0]}`;
  };

  const calculateTotals = () => {
    if (!reportData) return { total: 0, completed: 0, pending: 0, canceled: 0 };
    
    const total = reportData.reduce((sum, item) => sum + item.amount, 0);
    const completed = reportData
      .filter(item => item.status === 'Completada')
      .reduce((sum, item) => sum + item.amount, 0);
    const pending = reportData
      .filter(item => item.status === 'Pendiente')
      .reduce((sum, item) => sum + item.amount, 0);
    const canceled = reportData
      .filter(item => item.status === 'Cancelada')
      .reduce((sum, item) => sum + item.amount, 0);
    
    return { total, completed, pending, canceled };
  };

  const totals = calculateTotals();

  return (
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reportes
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Generar Reporte
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="report-type-label">Tipo de Reporte</InputLabel>
                <Select
                  labelId="report-type-label"
                  id="report-type"
                  value={reportType}
                  label="Tipo de Reporte"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="transactions">Transacciones</MenuItem>
                  <MenuItem value="sales">Ventas</MenuItem>
                  <MenuItem value="customers">Clientes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Fecha Inicio</InputLabel>
                <Select
                  value={startDate}
                  label="Fecha Inicio"
                  onChange={(e) => setStartDate(e.target.value)}
                >
                  <MenuItem value="2025-04-13">13/04/2025</MenuItem>
                  <MenuItem value="2025-04-20">20/04/2025</MenuItem>
                  <MenuItem value="2025-04-27">27/04/2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Fecha Fin</InputLabel>
                <Select
                  value={endDate}
                  label="Fecha Fin"
                  onChange={(e) => setEndDate(e.target.value)}
                >
                  <MenuItem value="2025-05-13">13/05/2025</MenuItem>
                  <MenuItem value="2025-05-06">06/05/2025</MenuItem>
                  <MenuItem value="2025-04-29">29/04/2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<RefreshIcon />}
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generar Reporte'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {reportData && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Completadas
                    </Typography>
                    <Typography variant="h5" component="div" color="success.main">
                      ${totals.completed.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pendientes
                    </Typography>
                    <Typography variant="h5" component="div" color="warning.main">
                      ${totals.pending.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Canceladas
                    </Typography>
                    <Typography variant="h5" component="div" color="error.main">
                      ${totals.canceled.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Resultados del Reporte
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => handleDownloadReport('excel')}
                    sx={{ mr: 1 }}
                  >
                    Excel
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => handleDownloadReport('pdf')}
                  >
                    PDF
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Referencia</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.reference}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell align="right">${row.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
  );
};

export default Reports;
