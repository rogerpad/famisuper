# Solución al Problema de Prefijos en la API

## Problema Identificado

Se detectó un problema con la configuración de rutas en el backend que afectaba a los módulos existentes. El problema surgió al agregar un prefijo global `/api` en el archivo `main.ts` del backend, lo que causaba que las rutas se duplicaran:

- El frontend estaba configurado para acceder a las APIs con la URL base `http://localhost:4002/api`
- Al agregar el prefijo global `/api` en el backend, las rutas se convertían en `/api/api/...`
- Esto provocaba errores 404 en todos los módulos existentes

## Solución Implementada

Para resolver este problema, se optó por una solución que minimiza los cambios y mantiene la compatibilidad con el código existente:

1. **Eliminar el prefijo global en el backend**:
   - Se eliminó la línea `app.setGlobalPrefix('api');` del archivo `main.ts`
   - Esto restaura el comportamiento original para todos los módulos existentes

2. **Configurar un prefijo específico para el módulo AdicionalesPrestamos**:
   - Se modificó el decorador del controlador para incluir el prefijo `/api`:
   ```typescript
   @Controller('api/adicionales-prestamos')
   ```
   - Esto permite que el módulo AdicionalesPrestamos funcione correctamente con la configuración del frontend

## Ventajas de esta Solución

- **Mínimo impacto**: Solo afecta al nuevo módulo AdicionalesPrestamos
- **No requiere cambios en el frontend**: No es necesario recompilar ni modificar la configuración del frontend
- **Mantiene la coherencia**: Las rutas siguen el mismo patrón que el resto de la aplicación
- **Fácil de implementar**: Requiere cambios mínimos en el código

## Consideraciones para el Futuro

Para futuros desarrollos, se recomienda seguir una de estas estrategias:

1. **Opción 1**: Mantener la configuración actual (sin prefijo global) y agregar el prefijo `/api` a cada nuevo controlador según sea necesario.

2. **Opción 2**: Si se desea implementar un prefijo global en el backend, será necesario modificar la configuración del frontend para eliminar el `/api` de la URL base:
   ```typescript
   export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4002';
   ```

La opción 1 es la recomendada para mantener la compatibilidad con el código existente y minimizar los riesgos de introducir nuevos errores.
