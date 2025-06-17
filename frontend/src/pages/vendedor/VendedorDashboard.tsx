import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { PermissionGuard, useHasPermission } from '../../components/auth/PermissionGuard';

// Definimos los códigos de permisos para el rol de Vendedor
export const VENDEDOR_PERMISSIONS = {
  VER_DASHBOARD: 'ver_dashboard',
  VER_VENTAS: 'ver_ventas',
  CREAR_VENTAS: 'crear_ventas',
  EDITAR_VENTAS: 'editar_ventas',
  ELIMINAR_VENTAS: 'eliminar_ventas',
  VER_CLIENTES: 'ver_clientes',
  CREAR_CLIENTES: 'crear_clientes',
  EDITAR_CLIENTES: 'editar_clientes',
  VER_PRODUCTOS: 'ver_productos',
  VER_REPORTES: 'ver_reportes',
};

const VendedorDashboard: React.FC = () => {
  // Utilizamos el hook para verificar permisos específicos
  const canCreateSales = useHasPermission(VENDEDOR_PERMISSIONS.CREAR_VENTAS);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Vendedor
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tarjeta de Ventas - Solo visible si tiene permiso de ver ventas */}
        <PermissionGuard permissionCode={VENDEDOR_PERMISSIONS.VER_VENTAS}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Ventas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestiona tus ventas y revisa el historial de transacciones.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">Ver Ventas</Button>
                
                {/* Botón de crear ventas - Solo visible si tiene el permiso específico */}
                <PermissionGuard permissionCode={VENDEDOR_PERMISSIONS.CREAR_VENTAS}>
                  <Button size="small" color="secondary">Crear Nueva Venta</Button>
                </PermissionGuard>
              </CardActions>
            </Card>
          </Grid>
        </PermissionGuard>
        
        {/* Tarjeta de Clientes - Solo visible si tiene permiso de ver clientes */}
        <PermissionGuard permissionCode={VENDEDOR_PERMISSIONS.VER_CLIENTES}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Clientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administra la información de tus clientes.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">Ver Clientes</Button>
                
                {/* Botón de crear clientes - Solo visible si tiene el permiso específico */}
                <PermissionGuard permissionCode={VENDEDOR_PERMISSIONS.CREAR_CLIENTES}>
                  <Button size="small" color="secondary">Registrar Cliente</Button>
                </PermissionGuard>
              </CardActions>
            </Card>
          </Grid>
        </PermissionGuard>
        
        {/* Tarjeta de Productos - Solo visible si tiene permiso de ver productos */}
        <PermissionGuard permissionCode={VENDEDOR_PERMISSIONS.VER_PRODUCTOS}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Productos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Consulta el catálogo de productos disponibles.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">Ver Productos</Button>
              </CardActions>
            </Card>
          </Grid>
        </PermissionGuard>
        
        {/* Tarjeta de Reportes - Solo visible si tiene permiso de ver reportes */}
        <PermissionGuard permissionCode={VENDEDOR_PERMISSIONS.VER_REPORTES}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Reportes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accede a reportes y estadísticas de ventas.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">Ver Reportes</Button>
              </CardActions>
            </Card>
          </Grid>
        </PermissionGuard>
      </Grid>
      
      {/* Mensaje si no tiene permisos para ver nada */}
      {!canCreateSales && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          No tienes permisos suficientes para realizar acciones en esta sección.
          Contacta al administrador si necesitas acceso.
        </Typography>
      )}
    </Container>
  );
};

export default VendedorDashboard;
