# Actualización de Flujos de Saldo

## Descripción del Cambio

Se ha implementado una mejora en el sistema para la actualización de los saldos vendidos y finales en los flujos de saldo. Anteriormente, se utilizaban las funciones `updateBalanceAfterSale` y `updateBalanceAfterSaleEdit` para actualizar los saldos de manera individual después de cada venta o edición. Ahora, se ha reemplazado este enfoque por un método más robusto llamado `recalcularSaldosVendidos` que recalcula todos los saldos vendidos y finales para todos los flujos activos.

**IMPORTANTE**: Con este cambio, los saldos de los flujos YA NO se actualizan automáticamente al crear o editar ventas de saldo. Los saldos SOLO se actualizan cuando el usuario presiona explícitamente el botón "Actualizar Flujos de Ventas" en la interfaz.

## Implementación

### 1. Backend (NestJS)

#### 1.1 Servicio de Balance Flows

Se implementó el método `recalcularSaldosVendidos` en el servicio `BalanceFlowsService`:

```typescript
async recalcularSaldosVendidos(): Promise<{ actualizados: number, errores: number }> {
  this.logger.log('Iniciando recálculo de saldos vendidos para todos los flujos activos', 'BalanceFlowsService');
  
  let actualizados = 0;
  let errores = 0;
  
  try {
    // 1. Obtener todos los flujos de saldo activos
    const flujosActivos = await this.balanceFlowsRepository.find({
      where: { activo: true }
    });
    
    this.logger.log(`Se encontraron ${flujosActivos.length} flujos activos para recalcular`, 'BalanceFlowsService');
    
    // 2. Para cada flujo, recalcular su saldo vendido y saldo final
    for (const flujo of flujosActivos) {
      try {
        // 2.1 Obtener la suma de montos de ventas activas para este flujo
        const resultadoVentas = await this.balanceFlowsRepository.query(
          `SELECT SUM(vs.monto) as total_vendido 
           FROM tbl_ventas_saldo vs 
           WHERE vs.flujo_saldo_id = $1 AND vs.activo = true`,
          [flujo.id]
        );
        
        // 2.2 Extraer el total vendido del resultado (o 0 si no hay ventas)
        const totalVendido = resultadoVentas[0]?.total_vendido 
          ? parseFloat(resultadoVentas[0].total_vendido) 
          : 0;
          
        // 2.3 Verificar si es un flujo Tigo para aplicar el cálculo especial
        const telefonica = await this.balanceFlowsRepository.query(
          `SELECT nombre FROM tbl_lineas_telefonicas WHERE id = $1`,
          [flujo.telefonicaId]
        );
        
        const nombreTelefonica = telefonica[0]?.nombre || '';
        const esTigo = nombreTelefonica.toLowerCase().includes('tigo');
        
        // 2.4 Calcular el nuevo saldo final
        let saldoCompradoAjustado = Number(flujo.saldoComprado);
        
        if (esTigo) {
          const bonificacionTigo = saldoCompradoAjustado * 0.055;
          saldoCompradoAjustado += bonificacionTigo;
        }
        
        const nuevoSaldoFinal = Number(flujo.saldoInicial) + saldoCompradoAjustado - Number(totalVendido);
        
        // 2.5 Actualizar el flujo de saldo con los nuevos valores
        await this.balanceFlowsRepository
          .createQueryBuilder()
          .update(BalanceFlow)
          .set({
            saldoVendido: totalVendido,
            saldoFinal: nuevoSaldoFinal
          })
          .where('id = :id', { id: flujo.id })
          .execute();
        
        actualizados++;
      } catch (error) {
        errores++;
      }
    }
    
    return { actualizados, errores };
  } catch (error) {
    throw error;
  }
}
```

#### 1.2 Controlador de Balance Flows

Se expuso el nuevo método como un endpoint REST:

```typescript
@Post('recalcular-saldos')
@RequierePermiso('crear_editar_flujo')
async recalcularSaldosVendidos() {
  try {
    const resultado = await this.balanceFlowsService.recalcularSaldosVendidos();
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Recálculo de saldos completado',
      data: resultado
    };
  } catch (error) {
    throw error;
  }
}
```

### 2. Frontend (React)

#### 2.1 API Client para Balance Flows

Se eliminaron las funciones `updateBalanceAfterSale` y `updateBalanceAfterSaleEdit` y se agregó la función `recalcularSaldosVendidos`:

```typescript
// Recalcular saldos vendidos y finales para todos los flujos activos
const recalcularSaldosVendidos = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    if (USE_MOCK) {
      // Simular recálculo en datos mock
      console.log('Recálculo de saldos simulado en modo mock');
      return { actualizados: mockBalanceFlows.length, errores: 0 };
    } else {
      // Usar API real
      const response = await fetch(`${API_BASE_URL}/balance-flows/recalcular-saldos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const resultado = await response.json();
      
      // Refrescar los datos después del recálculo
      await fetchBalanceFlows();
      
      return resultado.data;
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
    console.error('Error al recalcular saldos vendidos:', err);
    throw err; // Re-lanzar el error para manejarlo en el componente
  } finally {
    setLoading(false);
  }
}, [fetchBalanceFlows]);
```

#### 2.2 Componente BalanceSaleForm

Se modificó el componente para eliminar las llamadas automáticas a `recalcularSaldosVendidos` después de crear o editar ventas de saldo:

```typescript
// Al crear una nueva venta de saldo
const result = await createBalanceSale(dataToSubmit);
console.log('[BalanceSaleForm] Resultado de la creación:', result);

// Ya no actualizamos los saldos automáticamente después de crear una venta
// Los saldos se actualizarán solo cuando el usuario presione el botón "Actualizar Flujos de Ventas"

// Al editar una venta de saldo existente
const result = await updateBalanceSale(parseInt(id), dataToSubmit);
console.log('[BalanceSaleForm] Resultado de la actualización:', result);

// Ya no actualizamos los saldos automáticamente después de editar una venta
// Los saldos se actualizarán solo cuando el usuario presione el botón "Actualizar Flujos de Ventas"
```

## Ventajas del Nuevo Enfoque

1. **Consistencia de datos**: Al recalcular todos los saldos basados en las ventas registradas, se garantiza que los saldos siempre estén sincronizados con las ventas reales.
2. **Manejo de casos especiales**: El método incluye lógica para manejar casos especiales como la bonificación del 5.5% para flujos Tigo.
3. **Mantenibilidad**: Centraliza la lógica de cálculo de saldos en un solo lugar, facilitando futuras modificaciones.
4. **Robustez**: Reduce la posibilidad de errores acumulativos que podrían ocurrir con actualizaciones incrementales.
5. **Control manual**: Los saldos solo se actualizan cuando el usuario lo decide explícitamente, lo que permite realizar múltiples ventas antes de actualizar los saldos y tener mayor control sobre cuándo se realizan los cálculos.

## Archivos Modificados

- `frontend/src/api/balance-flows/balanceFlowsApi.ts`: Eliminadas funciones `updateBalanceAfterSale` y `updateBalanceAfterSaleEdit`
- `frontend/src/components/balance-sales/BalanceSaleForm.tsx`: Modificado para usar `recalcularSaldosVendidos`
