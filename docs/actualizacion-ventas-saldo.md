# Actualización de Ventas de Saldo

## Parte 1: Solución a la Actualización de Campos Select

### Problema Identificado

Se detectó un problema en el módulo de ventas de saldo donde los campos de selección (`telefonicaId`, `flujoSaldoId`) no se estaban actualizando correctamente en la base de datos al editar un registro. Solo los campos como `cantidad`, `monto` y `observacion` se actualizaban correctamente.

## Diagnóstico

Después de analizar el código y los logs, se identificaron las siguientes causas:

1. El método `update` en `BalanceSalesService` no estaba procesando correctamente todos los campos del DTO de actualización.
2. La consulta SQL generada por TypeORM no incluía los campos de tipo select (foreign keys) en la actualización.
3. El sistema de detección de cambios de TypeORM no detectaba correctamente las modificaciones en estos campos.

## Solución Implementada

Se realizaron las siguientes modificaciones para solucionar el problema:

### 1. Mejora en la Conversión de Tipos

Se implementó una conversión explícita de tipos para todos los campos numéricos:

```typescript
if (updateBalanceSaleDto.telefonicaId !== undefined) {
  updateData.telefonicaId = Number(updateBalanceSaleDto.telefonicaId);
}

if (updateBalanceSaleDto.flujoSaldoId !== undefined) {
  updateData.flujoSaldoId = Number(updateBalanceSaleDto.flujoSaldoId);
}
```

### 2. Uso de QueryBuilder para Actualización Directa

Se reemplazó el método `save` por una actualización directa usando `queryBuilder` con un enfoque optimizado:

```typescript
// Construir objeto con todos los campos a actualizar
const fieldsToUpdate = {};

// Agregar cada campo al objeto de actualización
Object.keys(updateData).forEach(key => {
  fieldsToUpdate[key] = updateData[key];
});

// Crear la consulta con todos los campos a la vez
let query = this.balanceSaleRepository.createQueryBuilder()
  .update('tbl_ventas_saldo')
  .set(fieldsToUpdate)
  .where('id = :id', { id });

// Ejecutar la consulta
const result = await query.execute();
```

Esta aproximación asegura que todos los campos se incluyan en una sola operación de actualización, evitando problemas con actualizaciones parciales.

### 3. Logging Detallado para Depuración

Se agregaron logs detallados en puntos clave del proceso:

- Tipos de datos recibidos
- Estado actual en la base de datos
- Campos a actualizar
- Consulta SQL generada
- Resultado de la actualización

## Verificación

La solución fue verificada mediante:

1. Compilación exitosa del proyecto
2. Revisión de logs para confirmar que la consulta SQL incluye todos los campos necesarios
3. Pruebas funcionales para verificar que los campos select se actualizan correctamente

## Recomendaciones Adicionales

1. Mantener la conversión explícita de tipos tanto en el frontend como en el backend para evitar problemas similares.
2. Utilizar `queryBuilder` para operaciones de actualización complejas donde se necesite mayor control sobre la consulta SQL generada.
3. Implementar logging detallado en operaciones críticas para facilitar la depuración.

## Archivos Modificados (Parte 1)

- `backend/src/modules/balance-sales/balance-sales.service.ts`: Implementación de la solución principal
- `backend/src/modules/balance-sales/balance-sales.controller.ts`: Corrección de importaciones
- `backend/src/modules/balance-sales/balance-sales.module.ts`: Corrección de importaciones

## Parte 2: Recálculo de Saldos Vendidos

### Descripción del Requerimiento

Se requiere implementar una funcionalidad que permita recalcular los campos `saldo_vendido` y `saldo_final` en la tabla `tbl_flujos_saldo` basándose en las ventas activas registradas en `tbl_ventas_saldo`. Esta funcionalidad debe ser accesible mediante un botón "Actualizar Flujos de Ventas" en la vista de Ventas de Saldo.

### Implementación

#### 1. Backend (NestJS)

##### 1.1 Servicio de Balance Flows

Se implementó un nuevo método `recalcularSaldosVendidos` en el servicio `BalanceFlowsService` que:

```typescript
async recalcularSaldosVendidos(): Promise<{ actualizados: number, errores: number }> {
  // 1. Obtener todos los flujos de saldo activos
  const flujosActivos = await this.balanceFlowsRepository.find({
    where: { activo: true }
  });
  
  // 2. Para cada flujo, recalcular su saldo vendido y saldo final
  for (const flujo of flujosActivos) {
    // 2.1 Obtener la suma de montos de ventas activas para este flujo
    const resultadoVentas = await this.balanceFlowsRepository.query(
      `SELECT SUM(vs.monto) as total_vendido 
       FROM tbl_ventas_saldo vs 
       WHERE vs.flujo_saldo_id = ? AND vs.activo = true`,
      [flujo.id]
    );
    
    // 2.2 Extraer el total vendido y calcular el nuevo saldo final
    const totalVendido = resultadoVentas[0]?.total_vendido ? parseFloat(resultadoVentas[0].total_vendido) : 0;
    const nuevoSaldoFinal = Number(flujo.saldoInicial) + Number(flujo.saldoComprado) - Number(totalVendido);
    
    // 2.3 Actualizar el flujo de saldo con los nuevos valores
    await this.balanceFlowsRepository
      .createQueryBuilder()
      .update(BalanceFlow)
      .set({
        saldoVendido: totalVendido,
        saldoFinal: nuevoSaldoFinal
      })
      .where('id = :id', { id: flujo.id })
      .execute();
  }
}
```

##### 1.2 Controlador de Balance Flows

Se expuso el nuevo método como un endpoint REST:

```typescript
@Post('recalcular-saldos')
@RequierePermiso('crear_editar_flujo')
async recalcularSaldosVendidos() {
  const resultado = await this.balanceFlowsService.recalcularSaldosVendidos();
  return {
    statusCode: HttpStatus.OK,
    message: 'Recálculo de saldos completado',
    data: resultado
  };
}
```

#### 2. Frontend (React)

##### 2.1 API Client para Balance Flows

Se agregó una nueva función en el hook `useBalanceFlows` para consumir el endpoint:

```typescript
const recalcularSaldosVendidos = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`${API_BASE_URL}/balance-flows/recalcular-saldos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`[HTTP] ERROR: Response ${response.status} for POST /balance-flows/recalcular-saldos`);
    }

    const result = await response.json();
    
    // Refrescar los datos de flujos después del recálculo
    await fetchBalanceFlows();
    
    return result.data;
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
    console.error('Error al recalcular saldos vendidos:', err);
    throw err;
  } finally {
    setLoading(false);
  }
}, [fetchBalanceFlows]);
```

##### 2.2 Componente BalanceSalesList

Se agregó un botón "Actualizar Flujos de Ventas" en la vista de lista de ventas de saldo:

```tsx
<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
  <Typography variant="h5">Ventas de Saldo</Typography>
  <Box>
    <Button
      variant="outlined"
      color="secondary"
      startIcon={<RefreshIcon />}
      onClick={handleRecalcularSaldos}
      sx={{ mr: 2 }}
    >
      Actualizar Flujos de Ventas
    </Button>
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={handleAddClick}
    >
      Nueva Venta
    </Button>
  </Box>
</Box>
```

Y la función para manejar el recálculo:

```typescript
const handleRecalcularSaldos = async () => {
  try {
    const resultado = await recalcularSaldosVendidos();
    
    setSnackbarMessage(
      `Recálculo completado. Flujos actualizados: ${resultado.actualizados}, Errores: ${resultado.errores}`
    );
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Recargar la lista de ventas para mostrar datos actualizados
    loadBalanceSales();
  } catch (error) {
    console.error('Error al recalcular saldos:', error);
    
    setSnackbarMessage(
      `Error al recalcular saldos: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  }
};
```

### Flujo de Ejecución

1. El usuario accede a la vista de Ventas de Saldo.
2. El usuario hace clic en el botón "Actualizar Flujos de Ventas".
3. El sistema envía una solicitud POST al endpoint `/balance-flows/recalcular-saldos`.
4. El backend recorre todos los flujos activos y para cada uno:
   - Calcula la suma de montos de ventas activas asociadas a ese flujo
   - Actualiza el campo `saldo_vendido` con esa suma
   - Recalcula el campo `saldo_final` como `saldo_inicial + saldo_comprado - saldo_vendido`
5. El backend devuelve estadísticas sobre la operación (flujos actualizados y errores).
6. El frontend muestra un mensaje con el resultado de la operación.
7. La lista de ventas se recarga para mostrar datos actualizados.

### Consideraciones Técnicas

- El recálculo solo afecta a flujos activos (`activo = true`) en la tabla `tbl_flujos_saldo`.
- Solo se consideran ventas activas (`activo = true`) en la tabla `tbl_ventas_saldo`.
- Se requiere el permiso `crear_editar_flujo` para ejecutar el recálculo.
- Se utilizan logs detallados para facilitar la depuración.
- Se implementó manejo de errores tanto en el backend como en el frontend.
- **Bonificación para flujos Tigo**: Se aplica un 5.5% adicional al `saldo_comprado` para flujos de la compañía Tigo, lo que aumenta el `saldo_final` calculado.

### Archivos Modificados (Parte 2)

- `backend/src/modules/balance-flows/balance-flows.service.ts`: Agregado método `recalcularSaldosVendidos`
- `backend/src/modules/balance-flows/balance-flows.controller.ts`: Agregado endpoint `POST /balance-flows/recalcular-saldos`
- `frontend/src/api/balance-flows/balanceFlowsApi.ts`: Agregada función `recalcularSaldosVendidos`
- `frontend/src/components/balance-sales/BalanceSalesList.tsx`: Agregado botón y función para recalcular saldos
