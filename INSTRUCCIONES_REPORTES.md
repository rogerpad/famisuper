# Instrucciones para Implementar Módulo de Reportería

## Paso 1: Actualizar reports.service.ts

Abre el archivo `backend/src/modules/reports/reports.service.ts` y **copia todo el contenido** del archivo `backend/src/modules/reports/super-reports-methods.ts` (excepto las primeras 2 líneas de comentarios).

**Pégalo justo ANTES del cierre de la clase**, es decir, justo ANTES de la línea `}` final pero DESPUÉS del método `getAgentTypeId()`.

El archivo debería quedar así:

```typescript
  private async getAgentTypeId(): Promise<number> {
    const agentType = await this.providerTypesRepository.findOne({
      where: { nombre: 'Agente' },
    });
    
    if (!agentType) {
      throw new Error('No se encontró el tipo de proveedor "Agente"');
    }
    
    return agentType.id;
  }

  // ==================== REPORTES DE OPERACIÓN SUPER ====================
  // ... AQUÍ VAN LOS NUEVOS MÉTODOS ...

} // <-- Cierre de la clase
```

## Paso 2: Actualizar reports.controller.ts

Ahora vamos a crear los 12 nuevos endpoints con sus permisos.

Abre `backend/src/modules/reports/reports.controller.ts` y agrega estos imports al inicio:

```typescript
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
```

Luego, **agrega el decorador de guards a la clase**:

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('reports')
@Controller('reports')
export class ReportsController {
```

Finalmente, **agrega estos 12 endpoints al final del controlador** (antes del cierre de la clase):

```typescript
  // ==================== REPORTES SUPER ====================

  @Get('super/closings')
  @RequirePermissions('ver_reporte_cierres_super')
  @ApiOperation({ summary: 'Obtener reporte de cierres super' })
  async getSuperClosingsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
    @Query('usuarioId') usuarioId?: number,
  ) {
    return this.reportsService.getSuperClosingsReport(startDate, endDate, cajaNumero, usuarioId);
  }

  @Get('super/closings/excel')
  @RequirePermissions('exportar_reportes_super')
  @ApiOperation({ summary: 'Exportar reporte de cierres super a Excel' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportSuperClosingsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
    @Query('usuarioId') usuarioId?: number,
  ) {
    const buffer = await this.reportsService.exportSuperClosingsToExcel(startDate, endDate, cajaNumero, usuarioId);
    res.setHeader('Content-Disposition', 'attachment; filename=cierres_super.xlsx');
    res.send(buffer);
  }

  @Get('super/expenses')
  @RequirePermissions('ver_reporte_egresos_super')
  @ApiOperation({ summary: 'Obtener reporte de egresos y gastos' })
  async getSuperExpensesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tipoEgresoId') tipoEgresoId?: number,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    return this.reportsService.getSuperExpensesReport(startDate, endDate, tipoEgresoId, cajaNumero);
  }

  @Get('super/expenses/excel')
  @RequirePermissions('exportar_reportes_super')
  @ApiOperation({ summary: 'Exportar reporte de egresos a Excel' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportSuperExpensesToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tipoEgresoId') tipoEgresoId?: number,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    const buffer = await this.reportsService.exportSuperExpensesToExcel(startDate, endDate, tipoEgresoId, cajaNumero);
    res.setHeader('Content-Disposition', 'attachment; filename=egresos_super.xlsx');
    res.send(buffer);
  }

  @Get('super/balance-sales')
  @RequirePermissions('ver_reporte_ventas_saldo')
  @ApiOperation({ summary: 'Obtener reporte de ventas de saldo' })
  async getSuperBalanceSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    return this.reportsService.getSuperBalanceSalesReport(startDate, endDate, cajaNumero);
  }

  @Get('super/balance-sales/excel')
  @RequirePermissions('exportar_reportes_super')
  @ApiOperation({ summary: 'Exportar reporte de ventas de saldo a Excel' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportSuperBalanceSalesToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    const buffer = await this.reportsService.exportSuperBalanceSalesToExcel(startDate, endDate, cajaNumero);
    res.setHeader('Content-Disposition', 'attachment; filename=ventas_saldo.xlsx');
    res.send(buffer);
  }

  // ==================== REPORTES AGENTE ====================

  @Get('agent/closings')
  @RequirePermissions('ver_reporte_cierres_agente')
  @ApiOperation({ summary: 'Obtener reporte de cierres de agentes' })
  async getAgentClosingsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('proveedorId') proveedorId?: number,
  ) {
    return this.reportsService.getAgentClosingsReport(startDate, endDate, proveedorId);
  }

  @Get('agent/closings/excel')
  @RequirePermissions('exportar_reportes_agente')
  @ApiOperation({ summary: 'Exportar reporte de cierres de agentes a Excel' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAgentClosingsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('proveedorId') proveedorId?: number,
  ) {
    const buffer = await this.reportsService.exportAgentClosingsToExcel(startDate, endDate, proveedorId);
    res.setHeader('Content-Disposition', 'attachment; filename=cierres_agentes.xlsx');
    res.send(buffer);
  }

  @Get('agent/transactions')
  @RequirePermissions('ver_reporte_transacciones_agente')
  @ApiOperation({ summary: 'Obtener reporte de transacciones por agente' })
  async getAgentTransactionsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agenteId') agenteId?: number,
    @Query('tipoTransaccionId') tipoTransaccionId?: number,
  ) {
    return this.reportsService.getAgentTransactionsReport(startDate, endDate, agenteId, tipoTransaccionId);
  }

  @Get('agent/transactions/excel')
  @RequirePermissions('exportar_reportes_agente')
  @ApiOperation({ summary: 'Exportar reporte de transacciones a Excel' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAgentTransactionsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agenteId') agenteId?: number,
    @Query('tipoTransaccionId') tipoTransaccionId?: number,
  ) {
    const buffer = await this.reportsService.exportAgentTransactionsToExcel(startDate, endDate, agenteId, tipoTransaccionId);
    res.setHeader('Content-Disposition', 'attachment; filename=transacciones_agentes.xlsx');
    res.send(buffer);
  }

  @Get('agent/consolidated')
  @RequirePermissions('ver_reporte_consolidado_agente')
  @ApiOperation({ summary: 'Obtener reporte consolidado de operación agente' })
  async getAgentConsolidatedReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAgentConsolidatedReport(startDate, endDate);
  }

  @Get('agent/consolidated/excel')
  @RequirePermissions('exportar_reportes_agente')
  @ApiOperation({ summary: 'Exportar reporte consolidado a Excel' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAgentConsolidatedToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.reportsService.exportAgentConsolidatedToExcel(startDate, endDate);
    res.setHeader('Content-Disposition', 'attachment; filename=consolidado_agentes.xlsx');
    res.send(buffer);
  }
```

## Paso 3: Verificar que el backend compile

Ejecuta:
```bash
cd backend
npm run build
```

Si todo compila correctamente, ¡el backend está listo! 🎉

---

## Siguiente Paso: Frontend

Avísame cuando hayas completado estos pasos y continuaré con la implementación del frontend (APIs, componentes, páginas y menú).
