# Guía de Validación de Parámetros en Famisuper

## Introducción

Este documento describe las mejoras implementadas para la validación robusta de parámetros en la aplicación Famisuper, especialmente enfocadas en prevenir errores como "invalid input syntax for type bigint: NaN" en la funcionalidad de Registros de Actividad de Turnos.

## Problema Resuelto

Se identificó que los errores ocurrían cuando valores `NaN` o inválidos eran enviados como IDs o parámetros de paginación desde el frontend al backend, causando fallos en las consultas SQL de PostgreSQL.

## Solución Implementada

### 1. Utilidades de Validación Centralizadas

Se ha creado un módulo de utilidades de validación en `frontend/src/utils/validationUtils.ts` que proporciona funciones reutilizables para validar:

- IDs numéricos
- Parámetros de paginación
- Fechas

### 2. Funciones Disponibles

#### `isValidId(value: any): boolean`

Verifica si un valor puede ser considerado un ID válido:
- Debe ser un número entero positivo
- No puede ser NaN, undefined, null o cadena vacía
- Si es string, debe contener solo dígitos

```typescript
// Ejemplo de uso
import { isValidId } from '../../utils/validationUtils';

if (isValidId(userId)) {
  // Proceder con el ID
} else {
  // Manejar caso inválido
}
```

#### `toValidId(value: any, defaultValue?: number): number | undefined`

Convierte un valor a un ID numérico válido:
- Si el valor es válido, retorna el ID como número
- Si es inválido, retorna undefined o el valor por defecto proporcionado

```typescript
// Ejemplo de uso
import { toValidId } from '../../utils/validationUtils';

const validUserId = toValidId(userIdInput);
// o con valor por defecto
const validUserId = toValidId(userIdInput, 1); // 1 si es inválido
```

#### `validatePaginationParams(limit?: number | string, offset?: number | string): { limit: number, offset: number }`

Valida y normaliza parámetros de paginación:
- Aplica valores por defecto (limit: 10, offset: 0)
- Asegura que sean números enteros positivos
- Aplica límites máximos (máximo 100 registros por consulta)

```typescript
// Ejemplo de uso
import { validatePaginationParams } from '../../utils/validationUtils';

const { limit, offset } = validatePaginationParams(limitInput, offsetInput);
```

#### `isValidDate(date: any): boolean`

Verifica si un valor es una fecha válida:
- Funciona con objetos Date y strings de fecha
- Detecta fechas inválidas como '2023-13-01'

```typescript
// Ejemplo de uso
import { isValidDate } from '../../utils/validationUtils';

if (isValidDate(fechaInput)) {
  // Proceder con la fecha
} else {
  // Manejar caso inválido
}
```

### 3. Implementación en Componentes

Las utilidades de validación han sido implementadas en múltiples componentes:

#### API Layer
- `turnosApi.ts`: Validación robusta en todos los métodos que manejan IDs para evitar enviar NaN al backend
  - Métodos mejorados: `getById`, `getByUsuarioId`, `update`, `delete`, `asignarUsuarios`, `getUsuariosPorTurno`, `getTurnosPorUsuario`, `iniciarTurno`, `finalizarTurno`, `iniciarTurnoVendedor`, `finalizarTurnoVendedor`, `reiniciarTurno`, `getTurnoActual`
  - Se agregó logging detallado para facilitar la depuración
  - Se implementó manejo de errores consistente

#### Componentes de UI
- `RegistrosActividadTurnos.tsx`: Validación de IDs y fechas en filtros antes de enviar consultas
- `TurnosList.tsx`: Validación en métodos de acción como `handleIniciarTurno`, `handleFinalizarTurno` y `handleDeleteTurno`
- `AsignarUsuariosDialog.tsx`: Validación de IDs de turnos y usuarios en la asignación de usuarios a turnos
- `TurnoForm.tsx`: Validación de IDs al crear o actualizar turnos

#### Mock API
- `turnosMock.ts`: Implementación completa de todos los métodos para mantener consistencia con la API real

### 4. Pruebas Unitarias

Se han creado pruebas unitarias en `validationUtils.test.ts` para verificar el correcto funcionamiento de las funciones de validación.

## Mejores Prácticas

1. **Siempre validar en ambos lados**: Aunque el frontend valide, el backend debe validar nuevamente todos los parámetros.

2. **Usar las utilidades de validación**: No implementar validaciones ad-hoc; usar las funciones centralizadas.

3. **Logs claros**: Incluir logs detallados cuando se detecten valores inválidos para facilitar la depuración.

4. **Valores por defecto seguros**: Siempre proporcionar valores por defecto seguros cuando los parámetros sean inválidos.

5. **Manejo visual de errores**: Mostrar mensajes claros al usuario cuando se detecten errores de validación.

## Scripts SQL para Permisos

Se han creado scripts SQL para asignar el permiso `ver_registro_actividad_turnos` a los roles necesarios:

- `agregar-permiso-ver-registro-actividad.sql`: Crea el permiso y lo asigna al rol Administrador
- `agregar-permiso-supervisor.sql`: Asigna el permiso al rol Supervisor

## Prevención Específica del Error "ID de turno inválido: NaN"

El error "ID de turno inválido: NaN" ha sido específicamente abordado mediante las siguientes estrategias:

### 1. Validación Temprana

Se implementa validación en el punto más temprano posible del flujo de datos:

```typescript
// Ejemplo en turnosApi.ts
getById: async (id: number | string): Promise<Turno> => {
  const validId = toValidId(id);
  if (validId === undefined) {
    console.error(`[TURNOS API] ID de turno inválido para getById: ${id}`);
    throw new Error(`ID de turno inválido: ${id}`);
  }
  // Continuar con el ID validado
}
```

### 2. Filtrado de Arrays de IDs

Cuando se trabaja con arrays de IDs (como en `asignarUsuarios`), se filtran los valores inválidos:

```typescript
// Ejemplo en AsignarUsuariosDialog.tsx
const validUsuariosIds = usuariosIds
  .map(id => toValidId(id))
  .filter((id): id is number => id !== undefined);
```

### 3. Logging Detallado

Se ha implementado un sistema de logging consistente con prefijos para facilitar la depuración:

```typescript
console.log(`[TURNOS API] Consultando turno actual`);
console.error(`[TURNOS LIST] ID de turno inválido para iniciar: ${id}`);
```

### 4. Manejo Consistente de Errores

Se lanzan errores descriptivos cuando se detectan IDs inválidos, permitiendo un manejo adecuado en la UI:

```typescript
throw new Error(`ID de turno inválido: ${id}`);
```

## Conclusión

Las mejoras implementadas garantizan que la aplicación Famisuper maneje de forma robusta los parámetros de entrada, previniendo específicamente los errores "ID de turno inválido: NaN" que afectaban la funcionalidad de Turnos. 

La estrategia de validación centralizada, combinada con el logging detallado y el manejo consistente de errores, no solo resuelve los problemas actuales sino que establece un patrón para el desarrollo futuro, asegurando que la aplicación sea más robusta y mantenible.
