import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import {
  List as ListIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import RolesList from './RolesList';
import RolesPermisosList from './RolesPermisosList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`roles-tabpanel-${index}`}
      aria-labelledby={`roles-tab-${index}`}
      {...other}
      style={{ paddingTop: '1rem' }}
    >
      {value === index && children}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `roles-tab-${index}`,
    'aria-controls': `roles-tabpanel-${index}`,
  };
};

const RolesPermisos: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ color: '#dc7633', fontWeight: 'bold' }}>
        Gestión de Roles y Permisos
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure los roles del sistema y asigne permisos específicos a cada rol para controlar el acceso a las funcionalidades.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="roles y permisos tabs"
            sx={{
              '& .Mui-selected': {
                color: '#dc7633 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#dc7633',
              },
            }}
          >
            <Tab 
              label="Roles" 
              icon={<ListIcon />} 
              iconPosition="start" 
              {...a11yProps(0)} 
            />
            <Tab 
              label="Asignación de Permisos" 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              {...a11yProps(1)} 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <RolesList />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <RolesPermisosList />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default RolesPermisos;
