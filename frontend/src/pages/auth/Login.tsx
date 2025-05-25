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
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        const response = await authApi.login({
          username: values.username,
          password: values.password
        });
        localStorage.setItem('token', response.access_token);
        // Guardar información del usuario si es necesario
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/');
      } catch (err: any) {
        console.error('Error de inicio de sesión:', err);
        setError(
          err.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
        Sistema de Cierre de Transacciones Famisuper
      </Typography>
    </Box>
  );
};

export default Login;
