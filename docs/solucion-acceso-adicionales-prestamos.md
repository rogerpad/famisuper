# Solución al problema de "Access Denied" en el módulo de Adicionales y Préstamos

## Problema

El usuario administrador no podía acceder al menú de "Adicionales y Préstamos" debido a un error de "Access Denied", a pesar de tener asignado el rol de administrador que debería tener todos los permisos necesarios.

## Diagnóstico

Se identificaron varios problemas que contribuían al error:

1. **Inconsistencia en la estructura del token JWT**: El backend generaba los permisos en el campo `permissions` del token JWT, pero el frontend buscaba los permisos en el campo `permisos`.

2. **Verificación de permisos en el frontend**: El hook `usePermissions` solo buscaba permisos en `decoded.permisos` y no en `decoded.permissions`.

## Solución implementada

### 1. Modificación del hook usePermissions

Se modificó el hook `usePermissions` para buscar los permisos tanto en `decoded.permissions` como en `decoded.permisos`, asegurando que el frontend reconozca correctamente los permisos incluidos en el token JWT generado por el backend.

```typescript
// Antes
const permissions = decoded?.permisos || [];

// Después
const permissions = decoded?.permissions || decoded?.permisos || [];
```

### 2. Herramientas de depuración

Se crearon varias herramientas para facilitar la depuración de problemas relacionados con los tokens JWT:

- **TokenConsoleDebugger.js**: Script para verificar el token JWT desde la consola del navegador.
- **TokenManagerDebugger.tsx**: Componente React para visualizar y gestionar el token JWT desde la interfaz de usuario.

### 3. Rutas de depuración

Se agregaron rutas específicas para acceder a las herramientas de depuración:

- `/debug/token`: Muestra el componente TokenDebugger
- `/debug/token-manager`: Muestra el componente TokenManagerDebugger

## Verificación

Para verificar que la solución funciona correctamente:

1. Acceder a `/debug/token-manager` para confirmar que el token JWT contiene el permiso `ver_adic_presta`.
2. Intentar acceder al menú de Adicionales y Préstamos para confirmar que ya no aparece el error "Access Denied".

## Lecciones aprendidas

1. **Consistencia en la nomenclatura**: Es importante mantener una nomenclatura consistente entre el backend y el frontend para evitar problemas de integración.

2. **Herramientas de depuración**: Contar con herramientas de depuración específicas para componentes críticos como la autenticación y autorización facilita la identificación y resolución de problemas.

3. **Validación robusta**: Implementar validaciones más robustas que puedan manejar pequeñas inconsistencias en los datos, como buscar permisos en múltiples campos posibles.

## Recomendaciones para el futuro

1. **Estandarizar la estructura del token JWT**: Definir claramente la estructura del token JWT y asegurar que tanto el backend como el frontend utilicen la misma nomenclatura.

2. **Documentar los permisos**: Mantener una documentación actualizada de todos los permisos utilizados en la aplicación y su asignación a los diferentes roles.

3. **Pruebas automatizadas**: Implementar pruebas automatizadas para verificar que los permisos se asignan correctamente y que los usuarios pueden acceder a las funcionalidades correspondientes.
