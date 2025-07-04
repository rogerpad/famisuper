import React, { useState, useMemo } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Copyright from '../components/Copyright';
import TurnoIndicator from '../components/TurnoIndicator';
import logoImage from '../assets/images/LogoFS.png';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  AccountCircle,
  AdminPanelSettings as RolesIcon,
  Security as SecurityIcon,
  People,
  People as UsersIcon,
  Category as ProviderTypesIcon,
  LocalShipping as ProvidersIcon,
  Payments as TransactionTypesIcon,
  PointOfSale as AgentClosingsIcon,
  Store as StoreIcon,
  Schedule as TurnosIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const { state: authState, hasPermission, hasRole, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  // Definimos los códigos de permisos para cada opción del menú
const MENU_PERMISSIONS = {
  // Permisos de Administrador
  TRANSACTIONS: 'ver_transacciones',
  TRANSACTION_TYPES: 'ver_tipos_transaccion',
  AGENT_CLOSINGS: 'ver_cierres_agentes',
  REPORTS: 'ver_reportes',
  ROLES: 'ver_roles',
  USERS: 'ver_usuarios',
  TURNOS: 'ver_turnos',
  ADMIN_TURNOS: 'admin_turnos',
  PROVIDER_TYPES: 'ver_tipos_proveedor',
  PROVIDERS: 'ver_proveedores',
  
  // Permisos de Vendedor
  VENDEDOR_DASHBOARD: 'ver_dashboard_vendedor',
  VENTAS: 'ver_ventas',
  CLIENTES: 'ver_clientes',
  PRODUCTOS: 'ver_productos'
};

// Definimos los permisos por rol
const ROLE_PERMISSIONS = {
  ADMIN: [
    MENU_PERMISSIONS.TRANSACTIONS,
    MENU_PERMISSIONS.TRANSACTION_TYPES,
    MENU_PERMISSIONS.AGENT_CLOSINGS,
    MENU_PERMISSIONS.REPORTS,
    MENU_PERMISSIONS.ROLES,
    MENU_PERMISSIONS.USERS,
    MENU_PERMISSIONS.TURNOS,
    MENU_PERMISSIONS.ADMIN_TURNOS,
    MENU_PERMISSIONS.PROVIDER_TYPES,
    MENU_PERMISSIONS.PROVIDERS
  ],
  VENDEDOR: [
    MENU_PERMISSIONS.VENDEDOR_DASHBOARD,
    MENU_PERMISSIONS.VENTAS,
    MENU_PERMISSIONS.CLIENTES,
    MENU_PERMISSIONS.PRODUCTOS
  ]
};

// Definimos los elementos del menú con sus permisos requeridos
const menuItemsConfig = [
  // Menú para Vendedores
  { 
    text: 'Dashboard Vendedor', 
    icon: <DashboardIcon />, 
    path: '/vendedor', 
    permissionCode: MENU_PERMISSIONS.VENDEDOR_DASHBOARD 
  },
  { 
    text: 'Mis Turnos', 
    icon: <TurnosIcon />, 
    path: '/turnos/vendedor', 
    permissionCode: MENU_PERMISSIONS.TURNOS 
  },
  { 
    text: 'Ventas', 
    icon: <ReceiptIcon />, 
    path: '/ventas', 
    permissionCode: MENU_PERMISSIONS.VENTAS 
  },
  { 
    text: 'Clientes', 
    icon: <People />, 
    path: '/clientes', 
    permissionCode: MENU_PERMISSIONS.CLIENTES 
  },
  { 
    text: 'Productos', 
    icon: <StoreIcon />, 
    path: '/productos', 
    permissionCode: MENU_PERMISSIONS.PRODUCTOS 
  },
  
  // Menú para Administradores
  { 
    text: 'Administración de Turnos', 
    icon: <AccessTimeIcon />, 
    path: '/turnos', 
    permissionCode: MENU_PERMISSIONS.TURNOS 
  },
  { 
    text: 'Transacciones', 
    icon: <ReceiptIcon />, 
    path: '/transactions', 
    permissionCode: MENU_PERMISSIONS.TRANSACTIONS 
  },
  { 
    text: 'Tipos de Transacción', 
    icon: <TransactionTypesIcon />, 
    path: '/transaction-types', 
    permissionCode: MENU_PERMISSIONS.TRANSACTION_TYPES 
  },
  { 
    text: 'Cierre Final de Agentes', 
    icon: <AgentClosingsIcon />, 
    path: '/agent-closings', 
    permissionCode: MENU_PERMISSIONS.AGENT_CLOSINGS 
  },
  { 
    text: 'Reportes', 
    icon: <AssessmentIcon />, 
    path: '/reports', 
    permissionCode: MENU_PERMISSIONS.REPORTS 
  },
  { 
    text: 'Roles y Permisos', 
    icon: <SecurityIcon />, 
    path: '/roles', 
    permissionCode: MENU_PERMISSIONS.ROLES 
  },
  { 
    text: 'Gestión de Usuarios', 
    icon: <UsersIcon />, 
    path: '/users', 
    permissionCode: MENU_PERMISSIONS.USERS 
  },
  // Entrada de menú 'Gestión de Turnos' eliminada para evitar duplicidad
  // Solo se mantiene 'Administración de Turnos'
  { 
    text: 'Tipos de Proveedor', 
    icon: <ProviderTypesIcon />, 
    path: '/provider-types', 
    permissionCode: MENU_PERMISSIONS.PROVIDER_TYPES 
  },
  { 
    text: 'Proveedores', 
    icon: <ProvidersIcon />, 
    path: '/providers', 
    permissionCode: MENU_PERMISSIONS.PROVIDERS 
  },
];

  // Logs para depuración
  console.log('Auth State:', authState);
  console.log('Is Authenticated:', authState.isAuthenticated);
  console.log('User:', authState.user);
  console.log('Permissions:', authState.permissions);
  
  // Filtrar el menú según los permisos del usuario
  const menuItems = useMemo(() => {
    if (authState.loading) {
      console.log('Cargando permisos...');
      return []; // No mostrar menús mientras se cargan los permisos
    }
    
    if (hasRole('Vendedor')) {
      // Si el usuario tiene el rol de Vendedor, mostrar solo los menús de vendedor
      console.log('Mostrando menú para rol Vendedor');
      return menuItemsConfig.filter(item => 
        item.permissionCode && hasPermission(item.permissionCode)
      );
    } else {
      // Para cualquier otro rol (Admin), filtrar según permisos específicos
      console.log('Filtrando menús por permisos');
      return menuItemsConfig.filter(item => 
        !item.permissionCode || hasPermission(item.permissionCode)
      );
    }
  }, [authState.permissions, authState.loading, hasPermission, hasRole]);
  
  console.log('Menú filtrado:', menuItems.map(item => item.text));

  const drawer = (
    <div>
      <Toolbar sx={{ 
        backgroundColor: '#dc7633', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64 }}>
          <img src={logoImage} alt="Logo Famisuper" style={{ height: 50, objectFit: 'contain' }} />
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {authState.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  '&.active': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
      {/* Mostrar mensaje si no hay elementos en el menú */}
      {menuItems.length === 0 && !authState.loading && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No hay opciones disponibles para tu rol.
          </Typography>
        </Box>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#dc7633', // Nuevo color naranja
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Cierre
          </Typography>
          
          {/* Información del usuario en la barra */}
          {authState.user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {authState.user.nombre} {authState.user.apellido}
              </Typography>
              {hasRole('Vendedor') && (
                <TurnoIndicator />
              )}
            </Box>
          )}
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {authState.user?.nombre ? authState.user.nombre.charAt(0).toUpperCase() : <AccountCircle />}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {authState.user && (
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {authState.user.nombre} {authState.user.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {authState.user.username}
                </Typography>
                <Typography variant="caption" color="primary">
                  {authState.user.rol?.nombre || 'Usuario'}
                </Typography>
              </Box>
            )}
            <MenuItem onClick={handleMenuClose}>Perfil</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <Copyright companyName="FamiSuper" />
      </Box>
    </Box>
  );
};

export default MainLayout;
