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
import api from '../../api/api';

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Correo electrónico inválido')
        .required('El correo electrónico es obligatorio'),
      password: Yup.string()
        .required('La contraseña es obligatoria'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        const response = await api.post('/auth/login', values);
        localStorage.setItem('token', response.data.access_token);
        navigate('/');
      } catch (err: any) {
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
        id="email"
        label="Correo Electrónico"
        name="email"
        autoComplete="email"
        autoFocus
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
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
