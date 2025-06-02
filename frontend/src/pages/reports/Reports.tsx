import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  CardContent,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import TransactionSummaryReport from './TransactionSummaryReport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

const Reports: React.FC = () => {
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('transactions');
  const [startDate, setStartDate] = useState<string>('2025-04-13');
  const [endDate, setEndDate] = useState<string>('2025-05-13');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[] | null>(null);
  
  // Efecto para establecer la pestaña activa basada en el estado de navegación
  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'tabIndex' in location.state) {
      setTabValue(location.state.tabIndex);
    }
  }, [location]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="reportes tabs">
          <Tab label="Reporte General" {...a11yProps(0)} />
          <Tab label="Resumen de Transacciones" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
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
                  value={reportType}
                  label="Tipo de Reporte"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="transactions">Transacciones</MenuItem>
                  <MenuItem value="sales">Ventas</MenuItem>
                  <MenuItem value="inventory">Inventario</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha Inicial"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha Final"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
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
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <TransactionSummaryReport />
      </TabPanel>
    </Box>
  );
};

export default Reports;
