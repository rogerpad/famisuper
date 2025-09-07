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
  CircularProgress,
  Collapse
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
  AccessTime as AccessTimeIcon,
  AttachMoney as CashCounterIcon,
  ExpandLess,
  ExpandMore,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  SupervisorAccount as SupervisorIcon,
  SupervisedUserCircle as SuperUserIcon
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

  // Definimos los permisos para cada item del menú
const MENU_PERMISSIONS = {
  DASHBOARD: 'ver_dashboard',
  TRANSACTIONS: 'ver_transacciones',
  TRANSACTION_TYPES: 'ver_tipos_transaccion',
  AGENT_CLOSINGS: 'ver_cierres_agentes',
  REPORTS: 'ver_reportes',
  ROLES: 'ver_roles',
  USERS: 'ver_usuarios',
  TURNOS: 'ver_turnos',
  MIS_TURNOS: 'ver_mis_turnos',
  ADMIN_TURNOS: 'ver_turnos',
  REGISTRO_ACTIVIDAD_TURNOS: 'ver_registro_actividad_turnos',
  PROVIDER_TYPES: 'ver_tipos_proveedor',
  PROVIDERS: 'ver_proveedores',
  ADMIN_PERMISOS: 'admin_permisos',
  VENDEDOR_DASHBOARD: 'ver_dashboard_vendedor',
  VENTAS: 'ver_ventas',
  CLIENTES: 'ver_clientes',
  PRODUCTOS: 'ver_productos',
  SUPER_EXPENSE_TYPES: 'ver_tipos_egresos_super',
  PAYMENT_DOCUMENTS: 'ver_documento_pago',
  ADMIN_PAYMENT_DOCUMENTS: 'admin_documentos_pago',
  PAYMENT_METHODS: 'ver_forma_pago',
  ADMIN_PAYMENT_METHODS: 'admin_forma_pago',
  SUPER_EXPENSES: 'ver_egresos_super',
  ADMIN_SUPER_EXPENSES: 'admin_egresos_super',
  PHONE_LINES: 'admin_lineas_telefonicas',
  BALANCE_FLOWS: 'ver_flujos_saldo',
  ADMIN_BALANCE_FLOWS: 'crear_editar_flujo',
  BALANCE_SALES: 'ver_venta_paquete',
  ADMIN_BALANCE_SALES: 'crear_editar_venta',
  PACKAGES: 'ver_paquetes',
  ADMIN_PACKAGES: 'admin_paquetes',
  CONTEO_BILLETES_SUPER: 'ver_conteo_super',
  ADICIONALES_PRESTAMOS: 'ver_adic_presta',
  ADMIN_ADICIONALES_PRESTAMOS: 'crear_editar_adic_prest',
  CIERRES_SUPER: 'ver_cierre_super',
  ADMIN_CIERRES_SUPER: 'crear_editar_cierre_super'
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
    MENU_PERMISSIONS.MIS_TURNOS,
    MENU_PERMISSIONS.ADMIN_TURNOS,
    MENU_PERMISSIONS.REGISTRO_ACTIVIDAD_TURNOS,
    MENU_PERMISSIONS.PROVIDER_TYPES,
    MENU_PERMISSIONS.PROVIDERS,
    MENU_PERMISSIONS.DASHBOARD,
    MENU_PERMISSIONS.ADICIONALES_PRESTAMOS,
    MENU_PERMISSIONS.ADMIN_ADICIONALES_PRESTAMOS
  ],
  VENDEDOR: [
    MENU_PERMISSIONS.VENDEDOR_DASHBOARD,
    MENU_PERMISSIONS.MIS_TURNOS,
    MENU_PERMISSIONS.VENTAS,
    MENU_PERMISSIONS.DASHBOARD,
    // Permisos para Operación de Agentes
    MENU_PERMISSIONS.TRANSACTIONS,
    MENU_PERMISSIONS.REPORTS,
    'ver_contador_efectivo',
    MENU_PERMISSIONS.AGENT_CLOSINGS,
    // Permisos para Operación de Super
    MENU_PERMISSIONS.SUPER_EXPENSES,
    MENU_PERMISSIONS.BALANCE_FLOWS,
    MENU_PERMISSIONS.BALANCE_SALES,
    MENU_PERMISSIONS.CONTEO_BILLETES_SUPER,
    MENU_PERMISSIONS.CIERRES_SUPER,
    MENU_PERMISSIONS.ADICIONALES_PRESTAMOS
  ]
};

// Definir interfaces para los tipos de menú
interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  permissionCode?: string | null;
  isGroup?: boolean;
  children?: MenuItem[];
  showEmpty?: boolean; // Propiedad para indicar si un grupo debe mostrarse aunque esté vacío
}

// Definimos los elementos del menú con sus permisos requeridos
const menuItemsConfig: MenuItem[] = [
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
    permissionCode: MENU_PERMISSIONS.MIS_TURNOS 
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
  
  // Grupo de Módulo Administrativo
  {
    text: 'Módulo Administrativo',
    icon: <SettingsIcon />,
    isGroup: true,
    permissionCode: null, // No requiere permiso específico para ver el grupo
    children: [
      { 
        text: 'Administración de Turnos', 
        icon: <AccessTimeIcon />, 
        path: '/turnos', 
        permissionCode: MENU_PERMISSIONS.TURNOS 
      },
      { 
        text: 'Registro de Actividad de Turnos', 
        icon: <AccessTimeIcon />, 
        path: '/turnos/registros-actividad', 
        permissionCode: MENU_PERMISSIONS.REGISTRO_ACTIVIDAD_TURNOS 
      },
      { 
        text: 'Roles y Permisos', 
        icon: <SecurityIcon />, 
        path: '/roles', 
        permissionCode: MENU_PERMISSIONS.ROLES 
      },
      { 
        text: 'Gestión de Permisos', 
        icon: <SecurityIcon />, 
        path: '/permissions', 
        permissionCode: MENU_PERMISSIONS.ADMIN_PERMISOS 
      },
      { 
        text: 'Gestión de Usuarios', 
        icon: <UsersIcon />, 
        path: '/users', 
        permissionCode: MENU_PERMISSIONS.USERS 
      },
    ]
  },
  
  // Grupo de Operación de Agentes
  {
    text: 'Operación de Agentes',
    icon: <BusinessIcon />,
    isGroup: true,
    permissionCode: null, // No requiere permiso específico para ver el grupo
    children: [
      { 
        text: 'Transacciones', 
        icon: <ReceiptIcon />, 
        path: '/transactions', 
        permissionCode: MENU_PERMISSIONS.TRANSACTIONS 
      },
      { 
        text: 'Resumen de Transacciones', 
        icon: <AssessmentIcon />, 
        path: '/reports', 
        permissionCode: MENU_PERMISSIONS.REPORTS 
      },
      { 
        text: 'Contador de Efectivo', 
        icon: <CashCounterIcon />, 
        path: '/cash-counter', 
        permissionCode: 'ver_contador_efectivo' 
      },
      { 
        text: 'Cierre Final de Agentes', 
        icon: <AgentClosingsIcon />, 
        path: '/agent-closings', 
        permissionCode: MENU_PERMISSIONS.AGENT_CLOSINGS 
      },
    ]
  },
  // Grupo de Administración Agentes
  {
    text: 'Administración Agentes',
    icon: <SupervisorIcon />,
    isGroup: true,
    permissionCode: null, // No requiere permiso específico para ver el grupo
    children: [
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
      { 
        text: 'Tipos de Transacción', 
        icon: <TransactionTypesIcon />, 
        path: '/transaction-types', 
        permissionCode: MENU_PERMISSIONS.TRANSACTION_TYPES 
      },
    ]
  },
  
  // Grupo de Operación de Super
  {
    text: 'Operación de Super',
    icon: <SuperUserIcon />,
    isGroup: true,
    permissionCode: null, // No requiere permiso específico para ver el grupo
    showEmpty: true, // Propiedad para indicar que se debe mostrar aunque esté vacío
    children: [
      { 
        text: 'Egresos de Super', 
        icon: <ReceiptIcon />, 
        path: '/super-expenses', 
        permissionCode: MENU_PERMISSIONS.SUPER_EXPENSES 
      },
      { 
        text: 'Flujos de Saldo', 
        icon: <ReceiptIcon />, 
        path: '/balance-flows', 
        permissionCode: MENU_PERMISSIONS.BALANCE_FLOWS 
      },
      { 
        text: 'Ventas de Saldo', 
        icon: <ReceiptIcon />, 
        path: '/balance-sales', 
        permissionCode: MENU_PERMISSIONS.BALANCE_SALES 
      },
      { 
        text: 'Contador de Efectivo', 
        icon: <CashCounterIcon />, 
        path: '/conteo-billetes-super', 
        permissionCode: MENU_PERMISSIONS.CONTEO_BILLETES_SUPER 
      },
      { 
        text: 'Cierres Super', 
        icon: <AgentClosingsIcon />, 
        path: '/cierres-super', 
        permissionCode: MENU_PERMISSIONS.CIERRES_SUPER 
      },
      { 
        text: 'Adicionales y Préstamos', 
        icon: <ReceiptIcon />, 
        path: '/adicionales-prestamos', 
        permissionCode: MENU_PERMISSIONS.ADICIONALES_PRESTAMOS 
      },
    ]
  },
  
  // Grupo de Administración Super
  {
    text: 'Administración Super',
    icon: <SuperUserIcon />,
    isGroup: true,
    permissionCode: null, // No requiere permiso específico para ver el grupo
    showEmpty: true, // Propiedad para indicar que se debe mostrar aunque esté vacío
    children: [
      { 
        text: 'Tipos de Egresos del Super', 
        icon: <TransactionTypesIcon />, 
        path: '/super-expense-types', 
        permissionCode: MENU_PERMISSIONS.SUPER_EXPENSE_TYPES 
      },
      { 
        text: 'Documentos de Pago', 
        icon: <ReceiptIcon />, 
        path: '/payment-documents', 
        permissionCode: MENU_PERMISSIONS.PAYMENT_DOCUMENTS 
      },
      { 
        text: 'Formas de Pago', 
        icon: <ReceiptIcon />, 
        path: '/payment-methods', 
        permissionCode: MENU_PERMISSIONS.PAYMENT_METHODS 
      },
      { 
        text: 'Líneas Telefónicas', 
        icon: <ReceiptIcon />, 
        path: '/phone-lines', 
        permissionCode: MENU_PERMISSIONS.PHONE_LINES 
      },
      { 
        text: 'Paquetes', 
        icon: <ReceiptIcon />, 
        path: '/packages', 
        permissionCode: MENU_PERMISSIONS.PACKAGES 
      },
    ]
  },
];

  // Estado para controlar qué grupos están expandidos
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  
  // Función para alternar la expansión de un grupo
  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // Filtrar el menú según los permisos del usuario
  const menuItems = useMemo((): MenuItem[] => {
    if (authState.loading) {
      console.log('Cargando permisos...');
      return []; // No mostrar menús mientras se cargan los permisos
    }
    
    const filterByPermission = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        // Si el ítem tiene hijos (es un grupo), filtrar sus hijos
        if (item.isGroup && item.children) {
          const filteredChildren: MenuItem[] = filterByPermission(item.children);
          // Mostrar el grupo si tiene al menos un hijo con permiso O si está marcado para mostrarse vacío
          return filteredChildren.length > 0 || item.showEmpty === true;
        }
        // Para ítems normales, verificar el permiso
        return !item.permissionCode || hasPermission(item.permissionCode);
      });
    };

    // Filtrar los grupos específicos que queremos mostrar para el rol Vendedor
    const filterVendorGroups = (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        // Para elementos no agrupados, verificar si el usuario tiene el permiso
        if (!item.isGroup) {
          return !item.permissionCode || hasPermission(item.permissionCode);
        }
        
        // Incluir específicamente los grupos "Operación de Agentes" y "Operación de Super"
        if (item.text === 'Operación de Agentes' || item.text === 'Operación de Super') {
          // Filtrar los hijos según permisos
          if (item.children) {
            item.children = item.children.filter(child => 
              !child.permissionCode || hasPermission(child.permissionCode)
            );
          }
          // Mostrar el grupo si tiene al menos un hijo con permiso
          return item.children && item.children.length > 0;
        }
        
        // Excluir otros grupos
        return false;
      });
    };

    if (hasRole('Vendedor')) {
      // Si el usuario tiene el rol de Vendedor, mostrar los menús de vendedor
      // y los grupos específicos "Operación de Agentes" y "Operación de Super"
      console.log('Mostrando menú para rol Vendedor');
      return filterVendorGroups(menuItemsConfig);
    } else {
      // Para cualquier otro rol (Admin), filtrar según permisos específicos
      console.log('Filtrando menús por permisos');
      return filterByPermission(menuItemsConfig);
    }
  }, [authState.loading, hasPermission, hasRole]);
  
  // Renderizar un ítem de menú (puede ser un grupo o un ítem normal)
  const renderMenuItem = (item: MenuItem) => {
    // Si es un grupo con hijos
    if (item.isGroup && item.children) {
      const isOpen = openGroups[item.text] || false;
      
      return (
        <React.Fragment key={item.text}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => toggleGroup(item.text)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child: MenuItem) => (
                <ListItem 
                  key={child.text} 
                  disablePadding 
                  sx={{ pl: 4 }}
                >
                  <ListItemButton onClick={() => child.path && navigate(child.path)}>
                    <ListItemIcon>{child.icon}</ListItemIcon>
                    <ListItemText primary={child.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
    
    // Si es un ítem normal
    return (
      <ListItem 
        key={item.text} 
        disablePadding
      >
        <ListItemButton onClick={() => item.path && navigate(item.path)}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      </ListItem>
    );
  };

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
          menuItems.map(renderMenuItem)
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
          
          {/* Indicador de turno - Posición destacada */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <TurnoIndicator />
          </Box>
          
          {/* Información del usuario en la barra */}
          {authState.user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {authState.user.nombre} {authState.user.apellido}
              </Typography>
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
