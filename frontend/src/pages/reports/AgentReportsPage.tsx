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
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { FileDownload, Assessment } from '@mui/icons-material';
import agentReportsApi from '../../api/reports/agentReportsApi';

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

const AgentReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Filtros comunes
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Filtros específicos
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [agenteId, setAgenteId] = useState<number | ''>('');
  const [tipoTransaccionId, setTipoTransaccionId] = useState<number | ''>('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setProveedorId('');
    setAgenteId('');
    setTipoTransaccionId('');
  };

  // Query para Reporte 1: Cierres de Agentes
  const { data: closingsData, isLoading: closingsLoading } = useQuery({
    queryKey: ['agent-closings-report', startDate, endDate, proveedorId],
    queryFn: () => agentReportsApi.getAgentClosingsReport(
      startDate || undefined,
      endDate || undefined,
      proveedorId || undefined
    ),
    enabled: tabValue === 0,
  });

  // Query para Reporte 2: Transacciones por Agente
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['agent-transactions-report', startDate, endDate, agenteId, tipoTransaccionId],
    queryFn: () => agentReportsApi.getAgentTransactionsReport(
      startDate || undefined,
      endDate || undefined,
      agenteId || undefined,
      tipoTransaccionId || undefined
    ),
    enabled: tabValue === 1,
  });

  // Query para Reporte 3: Consolidado
  const { data: consolidatedData, isLoading: consolidatedLoading } = useQuery({
    queryKey: ['agent-consolidated-report', startDate, endDate],
    queryFn: () => agentReportsApi.getAgentConsolidatedReport(
      startDate || undefined,
      endDate || undefined
    ),
    enabled: tabValue === 2,
  });

  const handleExportClosings = async () => {
    await agentReportsApi.exportAgentClosingsToExcel(
      startDate || undefined,
      endDate || undefined,
      proveedorId || undefined
    );
  };

  const handleExportTransactions = async () => {
    await agentReportsApi.exportAgentTransactionsToExcel(
      startDate || undefined,
      endDate || undefined,
      agenteId || undefined,
      tipoTransaccionId || undefined
    );
  };

  const handleExportConsolidated = async () => {
    await agentReportsApi.exportAgentConsolidatedToExcel(
      startDate || undefined,
      endDate || undefined
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
        Reportes de Operación Agente
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Cierres de Agentes" />
          <Tab label="Transacciones por Agente" />
          <Tab label="Consolidado de Operación" />
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
            {tabValue === 0 && (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="ID Proveedor"
                  type="number"
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value ? parseInt(e.target.value) : '')}
                  size="small"
                />
              </Grid>
            )}
            {tabValue === 1 && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="ID Agente"
                    type="number"
                    value={agenteId}
                    onChange={(e) => setAgenteId(e.target.value ? parseInt(e.target.value) : '')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Tipo Transacción"
                    type="number"
                    value={tipoTransaccionId}
                    onChange={(e) => setTipoTransaccionId(e.target.value ? parseInt(e.target.value) : '')}
                    size="small"
                  />
                </Grid>
              </>
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

        {/* Tab 1: Cierres de Agentes */}
        <TabPanel value={tabValue} index={0}>
          {closingsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : closingsData ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reporte de Cierres de Agentes</Typography>
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
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Saldo Inicial Total</Typography>
                      <Typography variant="h5">L {closingsData.totales.totalSaldoInicial.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Saldo Final Total</Typography>
                      <Typography variant="h5">L {closingsData.totales.totalSaldoFinal.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Diferencias</Typography>
                      <Typography variant="h5" color="warning.main">L {closingsData.totales.totalDiferencias.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#9e480e' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agente</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Saldo Inicial</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Adicional Cta</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Resultado Final</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Saldo Final</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Diferencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {closingsData.cierres.map((cierre) => (
                      <TableRow key={cierre.id} hover>
                        <TableCell>{cierre.id}</TableCell>
                        <TableCell>{new Date(cierre.fecha).toLocaleDateString()}</TableCell>
                        <TableCell>{cierre.agente}</TableCell>
                        <TableCell align="right">L {cierre.saldoInicial.toFixed(2)}</TableCell>
                        <TableCell align="right">L {cierre.adicionalCta.toFixed(2)}</TableCell>
                        <TableCell align="right">L {cierre.resultadoFinal.toFixed(2)}</TableCell>
                        <TableCell align="right">L {cierre.saldoFinal.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: cierre.diferencia === 0 ? 'green' : 'orange' }}>
                          L {cierre.diferencia.toFixed(2)}
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

        {/* Tab 2: Transacciones por Agente */}
        <TabPanel value={tabValue} index={1}>
          {transactionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : transactionsData ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reporte de Transacciones por Agente</Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownload />}
                  onClick={handleExportTransactions}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {/* Tarjetas de Totales */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Transacciones</Typography>
                      <Typography variant="h5">{transactionsData.totales.totalTransacciones}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Valor Total</Typography>
                      <Typography variant="h5">L {transactionsData.totales.totalValor.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Promedio por Transacción</Typography>
                      <Typography variant="h5">L {transactionsData.totales.promedio.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Resumen por Agente */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Resumen por Agente</Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#4472c4' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agente</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionsData.resumenAgentes.map((resumen, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{resumen.agente}</TableCell>
                        <TableCell align="right">L {resumen.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Detalle de Transacciones */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Detalle de Transacciones</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#70ad47' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agente</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo Transacción</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Valor</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionsData.transacciones.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>{tx.id}</TableCell>
                        <TableCell>{new Date(tx.fecha).toLocaleString()}</TableCell>
                        <TableCell>{tx.agente}</TableCell>
                        <TableCell>{tx.tipoTransaccion}</TableCell>
                        <TableCell align="right">L {tx.valor.toFixed(2)}</TableCell>
                        <TableCell>{tx.observaciones}</TableCell>
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

        {/* Tab 3: Consolidado de Operación */}
        <TabPanel value={tabValue} index={2}>
          {consolidatedLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : consolidatedData ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Reporte Consolidado de Operación Agente</Typography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownload />}
                  onClick={handleExportConsolidated}
                >
                  Exportar a Excel
                </Button>
              </Box>

              {/* Resumen General */}
              <Typography variant="h6" sx={{ mb: 2 }}>Resumen General</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Agentes Activos</Typography>
                      <Typography variant="h5">{consolidatedData.resumen.agentesActivos}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Transacciones</Typography>
                      <Typography variant="h5">{consolidatedData.resumen.totalTransacciones}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Valor Total</Typography>
                      <Typography variant="h5">L {consolidatedData.resumen.totalValor.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>Promedio por Transacción</Typography>
                      <Typography variant="h5">L {consolidatedData.resumen.promedioPorTransaccion.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Por Tipo de Transacción */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Por Tipo de Transacción</Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#70ad47' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo Transacción</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Cantidad</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consolidatedData.porTipo.map((tipo, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{tipo.tipo}</TableCell>
                        <TableCell align="right">{tipo.cantidad}</TableCell>
                        <TableCell align="right">L {tipo.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Top 10 Agentes */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Top 10 Agentes</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#ed7d31' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Agente</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Transacciones</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consolidatedData.topAgentes.map((agente, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{agente.agente}</TableCell>
                        <TableCell align="right">{agente.transacciones}</TableCell>
                        <TableCell align="right">L {agente.total.toFixed(2)}</TableCell>
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

export default AgentReportsPage;
