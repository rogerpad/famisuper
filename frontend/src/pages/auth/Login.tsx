import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authApi from '../../api/auth/authApi';

interface LoginFormValues {
  username: string;
  password: string;
  submit?: string; // Campo para errores generales del formulario
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('El nombre de usuario es obligatorio'),
      password: Yup.string()
        .required('La contraseña es obligatoria'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors, resetForm }) => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Intentando iniciar sesión con:', { 
          username: values.username, 
          password: '***' 
        });
        
        // Configurar un timeout para la solicitud
        const loginPromise = authApi.login({ username: values.username, password: values.password });
        
        // Timeout de 15 segundos
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Tiempo de espera agotado')), 15000);
        });
        
        // Esperar a que se complete el login o se agote el tiempo
        const response = await Promise.race([loginPromise, timeoutPromise]) as any;
        console.log('Respuesta de login:', response);
        
        // Verificar si la respuesta es válida
        if (response && response.access_token) {
          console.log('Login exitoso, guardando token manualmente');
          
          // Guardar token y datos del usuario en localStorage
          localStorage.setItem('token', response.access_token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          
          console.log('Token guardado en localStorage:', response.access_token.substring(0, 20) + '...');
          
          // Forzar una recarga completa de la página para reiniciar el estado
          console.log('Recargando la página para aplicar la autenticación...');
          
          // Determinar la ruta de redirección según el rol del usuario
          let redirectPath = '/';
          
          // Si el usuario tiene rol de Vendedor, redirigir a la página de turnos de vendedor
          if (response.user && response.user.rol && response.user.rol.nombre === 'Vendedor') {
            console.log('Usuario con rol Vendedor detectado, redirigiendo a /turnos/vendedor');
            redirectPath = '/turnos/vendedor';
          } else {
            console.log(`Usuario con rol ${response.user?.rol?.nombre || 'desconocido'}, redirigiendo a /`);
          }
          
          // Usar window.location.replace para evitar problemas con el historial del navegador
          setTimeout(() => {
            window.location.replace(redirectPath);
          }, 500);
        } else {
          console.error('Respuesta de login inválida:', response);
          setErrors({ submit: 'Error en la respuesta del servidor' });
        }
      } catch (error: any) {
        console.error('Error al iniciar sesión:', error);
        
        // Mostrar mensaje de error apropiado
        if (error.response) {
          if (error.response.status === 401) {
            setErrors({ submit: 'Credenciales incorrectas o usuario inactivo' });
          } else if (error.response.status >= 500) {
            setErrors({ submit: 'Error en el servidor. Inténtelo de nuevo más tarde.' });
          } else {
            setErrors({ submit: error.response.data?.message || 'Error al iniciar sesión' });
          }
        } else if (error.message === 'Tiempo de espera agotado') {
          setErrors({ submit: 'El servidor está tardando en responder. Inténtelo de nuevo.' });
        } else if (error.message) {
          setErrors({ submit: error.message });
        } else {
          setErrors({ submit: 'Error desconocido al iniciar sesión' });
        }
        
        // Mantener el nombre de usuario pero limpiar la contraseña en caso de error
        resetForm({ values: { username: values.username, password: '' } });
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
      {(error || formik.errors.submit) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || formik.errors.submit}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Nombre de Usuario"
        name="username"
        autoComplete="username"
        autoFocus
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.username && Boolean(formik.errors.username)}
        helperText={formik.touched.username && formik.errors.username}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type="password"
        id="password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
      </Button>
      
      <Typography variant="body2" color="text.secondary" align="center">
       {/* Sistema de Cierre de Transacciones Famisuper */}
      </Typography>
    </Box>
  );
};

export default Login;
