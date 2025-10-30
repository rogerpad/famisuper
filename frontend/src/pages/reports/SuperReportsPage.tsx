import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { FileDownload, Assessment } from '@mui/icons-material';
import superReportsApi from '../../api/reports/superReportsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SuperReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Filtros comunes
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cajaNumero, setCajaNumero] = useState<number | ''>('');
  
  // Filtros específicos
  const [usuarioId, setUsuarioId] = useState<number | ''>('');
  const [tipoEgresoId, setTipoEgresoId] = useState<number | ''>('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCajaNumero('');
    setUsuarioId('');
    setTipoEgresoId('');
  };

  // Query para Reporte 1: Cierres Super
  const { data: closingsData, isLoading: closingsLoading, refetch: refetchClosings } = useQuery({
    queryKey: ['super-closings-report', startDate, endDate, cajaNumero, usuarioId],
    queryFn: () => superReportsApi.getSuperClosingsReport(
      startDate || undefined,
      endDate || undefined,
      cajaNumero || undefined,
      usuarioId || undefined
    ),
    enabled: tabValue === 0,
  });

  // Query para Reporte 2: Egresos
  const { data: expensesData, isLoading: expensesLoading, refetch: refetchExpenses } = useQuery({
    queryKey: ['super-expenses-report', startDate, endDate, tipoEgresoId, cajaNumero],
    queryFn: () => superReportsApi.getSuperExpensesReport(
      startDate || undefined,
      endDate || undefined,
      tipoEgresoId || undefined,
      cajaNumero || undefined
    ),
    enabled: tabValue === 1,
  });

  // Query para Reporte 3: Ventas de Saldo
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useQuery({
    queryKey: ['balance-sales-report', startDate, endDate, cajaNumero],
    queryFn: () => superReportsApi.getBalanceSalesReport(
      startDate || undefined,
      endDate || undefined,
      cajaNumero || undefined
    ),
    enabled: tabValue === 2,
  });

  const handleExportClosings = async () => {
    await superReportsApi.exportSuperClosingsToExcel(
      startDate || undefined,
      endDate || undefined,
      cajaNumero || undefined,
      usuarioId || undefined
    );
  };

  const handleExportExpenses = async () => {
    await superReportsApi.exportSuperExpensesToExcel(
      startDate || undefined,
      endDate || undefined,
      tipoEgresoId || undefined,
      cajaNumero || undefined
    );
  };

  const handleExportSales = async () => {
    await superReportsApi.exportBalanceSalesToExcel(
      startDate || undefined,
      endDate || undefined,
      cajaNumero || undefined
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
        Reportes de Operación Super
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Cierres Super" />
          <Tab label="Egresos y Gastos" />
          <Tab label="Ventas de Saldo" />
        </Tabs>

        {/* Filtros Comunes */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha Fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Caja</InputLabel>
                <Select
                  value={cajaNumero}
                  label="Caja"
                  onChange={(e) => setCajaNumero(e.target.value as number)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value={1}>Caja 1</MenuItem>
                  <MenuItem value={2}>Caja 2</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {tabValue === 0 && (
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="ID Usuario"
                  type="number"
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(e.target.value ? parseInt(e.target.value) : '')}
                  size="small"
                />
              </Grid>
            )}
            {tabValue === 1 && (
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Tipo Egreso ID"
                  type="number"
                  value={tipoEgresoId}
                  onChange={(e) => setTipoEgresoId(e.target.value ? parseInt(e.target.value) : '')}
                  size="small"
                />
              </Grid>
            )}
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                size="small"
                sx={{ height: '40px' }}
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tab 1: Cierres Super */}
        <TabPanel value={tabValue} index={0}>
          {closingsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : closingsData ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reporte de Cierres Super</Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownload />}
                  onClick={handleExportClosings}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {/* Tarjetas de Totales */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Efectivo Inicial Total</Typography>
                      <Typography variant="h5">L {closingsData.totales.totalEfectivoInicial.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Efectivo Final Total</Typography>
                      <Typography variant="h5">L {closingsData.totales.totalEfectivoFinal.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Gastos Totales</Typography>
                      <Typography variant="h5" color="error">L {closingsData.totales.totalGastos.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Faltantes / Sobrantes</Typography>
                      <Typography variant="h5" color={closingsData.totales.totalSobrantes > closingsData.totales.totalFaltantes ? 'success' : 'error'}>
                        L {(closingsData.totales.totalSobrantes - closingsData.totales.totalFaltantes).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1976d2' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Caja</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Efectivo Inicial</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Efectivo Cierre</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Gastos</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Faltante/Sobrante</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {closingsData.cierres.map((cierre) => (
                      <TableRow key={cierre.id} hover>
                        <TableCell>{cierre.id}</TableCell>
                        <TableCell>{new Date(cierre.fecha).toLocaleString()}</TableCell>
                        <TableCell>{cierre.usuario}</TableCell>
                        <TableCell>{cierre.cajaNumero}</TableCell>
                        <TableCell align="right">L {cierre.efectivoInicial.toFixed(2)}</TableCell>
                        <TableCell align="right">L {cierre.efectivoCierreTurno.toFixed(2)}</TableCell>
                        <TableCell align="right">L {cierre.gastos.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: cierre.faltanteSobrante >= 0 ? 'green' : 'red' }}>
                          L {cierre.faltanteSobrante.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="info">No hay datos disponibles. Ajusta los filtros y vuelve a intentar.</Alert>
          )}
        </TabPanel>

        {/* Tab 2: Egresos y Gastos */}
        <TabPanel value={tabValue} index={1}>
          {expensesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : expensesData ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reporte de Egresos y Gastos</Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownload />}
                  onClick={handleExportExpenses}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {/* Tarjetas de Totales */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total General</Typography>
                      <Typography variant="h5">L {expensesData.totales.totalGeneral.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Promedio Diario</Typography>
                      <Typography variant="h5">L {expensesData.totales.promedioDiario.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Cantidad Total</Typography>
                      <Typography variant="h5">{expensesData.totales.cantidadTotal}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Resumen por Tipo */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Resumen por Tipo de Egreso</Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#ed7d31' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo de Egreso</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Cantidad</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expensesData.resumenPorTipo.map((resumen, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{resumen.tipo}</TableCell>
                        <TableCell align="right">{resumen.cantidad}</TableCell>
                        <TableCell align="right">L {resumen.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Detalle de Egresos */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Detalle de Egresos</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#70ad47' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Forma Pago</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Caja</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expensesData.egresos.map((egreso) => (
                      <TableRow key={egreso.id} hover>
                        <TableCell>{egreso.id}</TableCell>
                        <TableCell>{new Date(egreso.fecha).toLocaleDateString()}</TableCell>
                        <TableCell>{egreso.tipoEgreso}</TableCell>
                        <TableCell>{egreso.descripcion}</TableCell>
                        <TableCell align="right">L {egreso.total.toFixed(2)}</TableCell>
                        <TableCell>{egreso.formaPago}</TableCell>
                        <TableCell>{egreso.usuario}</TableCell>
                        <TableCell>{egreso.cajaNumero}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="info">No hay datos disponibles. Ajusta los filtros y vuelve a intentar.</Alert>
          )}
        </TabPanel>

        {/* Tab 3: Ventas de Saldo */}
        <TabPanel value={tabValue} index={2}>
          {salesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : salesData ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reporte de Ventas de Saldo</Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownload />}
                  onClick={handleExportSales}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {/* Tarjetas de Totales */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Ventas</Typography>
                      <Typography variant="h5">{salesData.totales.totalVentas}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Monto Total Ventas</Typography>
                      <Typography variant="h5">L {salesData.totales.totalMontoVentas.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Saldo Total Vendido</Typography>
                      <Typography variant="h5">L {salesData.totales.totalSaldoVendido.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Ventas de Saldo */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Ventas de Saldo</Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#5b9bd5' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Telefónica</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Cantidad</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Monto</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Caja</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.ventas.map((venta) => (
                      <TableRow key={venta.id} hover>
                        <TableCell>{venta.id}</TableCell>
                        <TableCell>{new Date(venta.fecha).toLocaleString()}</TableCell>
                        <TableCell>{venta.telefonica}</TableCell>
                        <TableCell align="right">{venta.cantidad}</TableCell>
                        <TableCell align="right">L {venta.monto.toFixed(2)}</TableCell>
                        <TableCell>{venta.usuario}</TableCell>
                        <TableCell>{venta.cajaNumero}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Flujos de Saldo */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Flujos de Saldo</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#70ad47' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Telefónica</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Saldo Vendido</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Saldo Final</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.flujos.map((flujo) => (
                      <TableRow key={flujo.id} hover>
                        <TableCell>{flujo.id}</TableCell>
                        <TableCell>{new Date(flujo.fecha).toLocaleString()}</TableCell>
                        <TableCell>{flujo.telefonica}</TableCell>
                        <TableCell>{flujo.nombre}</TableCell>
                        <TableCell align="right">L {flujo.saldoVendido.toFixed(2)}</TableCell>
                        <TableCell align="right">L {flujo.saldoFinal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="info">No hay datos disponibles. Ajusta los filtros y vuelve a intentar.</Alert>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SuperReportsPage;
