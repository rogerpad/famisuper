# Carga Automática de Venta Saldo en Formulario de Cierre Super

## Descripción del Requerimiento

Se requiere implementar una funcionalidad que cargue automáticamente el valor del campo "Venta Saldo" en el formulario "Nuevo Cierre de Super". Este valor debe corresponder a la suma del campo `saldo_vendido` de todos los registros activos en la tabla `tbl_flujos_saldo`.

## Implementación

### 1. Backend (NestJS)

#### 1.1 Servicio de Balance Flows

Se agregó un nuevo método en el servicio `BalanceFlowsService` para calcular la suma de `saldoVendido` de todos los registros activos:

```typescript
async getSumSaldoVendidoActivos(): Promise<number> {
  // Obtener la suma de saldo_vendido de todos los registros activos
  const result = await this.balanceFlowsRepository
    .createQueryBuilder('balanceFlow')
    .select('SUM(balanceFlow.saldoVendido)', 'total')
    .where('balanceFlow.activo = :activo', { activo: true })
    .getRawOne();
  
  // Convertir el resultado a número y manejar el caso de null/undefined
  const total = result?.total ? parseFloat(result.total) : 0;
  return total;
}
```

#### 1.2 Controlador de Balance Flows

Se expuso el nuevo método como un endpoint REST:

```typescript
@Get('sum-saldo-vendido')
@RequierePermiso('ver_flujos_saldo')
getSumSaldoVendido() {
  return this.balanceFlowsService.getSumSaldoVendidoActivos();
}
```

### 2. Frontend (React)

#### 2.1 API Client para Balance Flows

Se agregó una nueva función en el hook `useBalanceFlows` para consumir el endpoint:

```typescript
// Obtener la suma de saldo vendido de registros activos
const getSumSaldoVendido = useCallback(async (): Promise<number> => {
  setLoading(true);
  setError(null);
  
  try {
    if (USE_MOCK) {
      // Calcular suma en datos mock
      const sum = mockBalanceFlows
        .filter(flow => flow.activo)
        .reduce((total, flow) => total + flow.saldoVendido, 0);
      return sum;
    } else {
      // Usar API real
      const response = await fetch(`${API_BASE_URL}/balance-flows/sum-saldo-vendido`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const total = await response.json();
      return parseFloat(total) || 0;
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
    console.error('Error al obtener suma de saldo vendido:', err);
    return 0;
  } finally {
    setLoading(false);
  }
}, []);
```

#### 2.2 Componente CierreSuperForm

Se modificó la función `cargarValoresAdicionalesPrestamos` para incluir la carga automática del valor de Venta Saldo:

```typescript
// Función para cargar automáticamente los valores de adicionales, préstamos y venta saldo
const cargarValoresAdicionalesPrestamos = async () => {
  try {
    // 1. Cargar Adicional Casa (Acuerdo: Adicional, Origen: Casa)
    const montoAdicionalCasa = await getMontoTotalByAcuerdoOrigen('Adicional', 'Casa');
    
    // 2. Cargar Adicional Agente (Acuerdo: Adicional, Origen: Agente)
    const montoAdicionalAgente = await getMontoTotalByAcuerdoOrigen('Adicional', 'Agente');
    
    // 3. Cargar Préstamo Agente (Acuerdo: Préstamo, Origen: Agente)
    // Intentar primero con tilde
    let montoPrestamoAgente = await getMontoTotalByAcuerdoOrigen('Préstamo', 'Agente');
    
    // Si no hay resultados, intentar sin tilde
    if (montoPrestamoAgente === 0) {
      montoPrestamoAgente = await getMontoTotalByAcuerdoOrigen('Prestamo', 'Agente');
    }
    
    // 4. Cargar Venta Saldo (suma de saldo_vendido de registros activos en tbl_flujos_saldo)
    const montoVentaSaldo = await getSumSaldoVendido();
    
    // Actualizar el formulario con los valores obtenidos
    setFormData(prevData => ({
      ...prevData,
      adicionalCasa: montoAdicionalCasa,
      adicionalAgente: montoAdicionalAgente,
      prestaAgentes: montoPrestamoAgente,
      ventaSaldo: montoVentaSaldo
    }));
    
    console.log('Valores cargados automáticamente:', {
      adicionalCasa: montoAdicionalCasa,
      adicionalAgente: montoAdicionalAgente,
      prestaAgentes: montoPrestamoAgente,
      ventaSaldo: montoVentaSaldo
    });
  } catch (error) {
    console.error('Error al cargar valores de adicionales, préstamos y venta saldo:', error);
  }
};
```

## Flujo de Ejecución

1. Al abrir el formulario "Nuevo Cierre de Super", se ejecuta automáticamente la función `cargarValoresAdicionalesPrestamos`.
2. Esta función realiza varias llamadas a la API:
   - Obtiene los montos de adicionales y préstamos (funcionalidad existente)
   - Obtiene la suma de `saldo_vendido` de todos los registros activos en `tbl_flujos_saldo` (nueva funcionalidad)
3. Actualiza el estado del formulario con todos los valores obtenidos, incluyendo el campo "Venta Saldo".

## Consideraciones Técnicas

- La suma se realiza únicamente sobre registros activos (`activo = true`) en la tabla `tbl_flujos_saldo`.
- Se utiliza `parseFloat` para asegurar que el valor devuelto sea un número.
- Se maneja el caso de valores nulos o indefinidos, devolviendo 0 en esos casos.
- La función se ejecuta solo al crear un nuevo cierre, no al editar uno existente.
- Se requiere el permiso `ver_flujos_saldo` para acceder al endpoint que calcula la suma.

## Archivos Modificados

- `backend/src/modules/balance-flows/balance-flows.service.ts`: Agregado método `getSumSaldoVendidoActivos`
- `backend/src/modules/balance-flows/balance-flows.controller.ts`: Agregado endpoint `GET /balance-flows/sum-saldo-vendido`
- `frontend/src/api/balance-flows/balanceFlowsApi.ts`: Agregada función `getSumSaldoVendido`
- `frontend/src/components/cierres-super/CierreSuperForm.tsx`: Modificada función `cargarValoresAdicionalesPrestamos`
