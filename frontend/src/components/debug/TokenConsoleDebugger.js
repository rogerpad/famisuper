// Script para verificar el token JWT desde la consola del navegador
// Copiar y pegar este código en la consola del navegador

(function() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token JWT almacenado en localStorage');
      return;
    }
    
    // Función para decodificar el token JWT sin necesidad de una biblioteca
    function parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error('Error al decodificar el token:', e);
        return null;
      }
    }
    
    const decoded = parseJwt(token);
    if (!decoded) {
      console.error('No se pudo decodificar el token JWT');
      return;
    }
    
    console.log('Token JWT decodificado:', decoded);
    console.log('Usuario:', decoded.username);
    console.log('ID de usuario:', decoded.sub);
    console.log('Rol:', decoded.rolName);
    
    // Verificar si hay permisos en el token
    if (decoded.permissions) {
      console.log('Permisos (permissions):', decoded.permissions);
      console.log('¿Tiene permiso ver_adic_presta?', decoded.permissions.includes('ver_adic_presta'));
    } else {
      console.log('No hay permisos (permissions) en el token');
    }
    
    // Verificar si hay permisos en el campo permisos
    if (decoded.permisos) {
      console.log('Permisos (permisos):', decoded.permisos);
      console.log('¿Tiene permiso ver_adic_presta?', decoded.permisos.includes('ver_adic_presta'));
    } else {
      console.log('No hay permisos (permisos) en el token');
    }
    
    // Verificar la fecha de expiración
    const expDate = new Date(decoded.exp * 1000);
    console.log('Fecha de expiración:', expDate.toLocaleString());
    console.log('¿Token expirado?', expDate < new Date());
    
  } catch (error) {
    console.error('Error al verificar el token JWT:', error);
  }
})();
