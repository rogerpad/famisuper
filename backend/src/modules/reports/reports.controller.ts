import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

export interface TransactionSummaryResponse {
  transactionTypes: {
    tipoTransaccion: string;
    tipoTransaccionId: number;
    agentes: Record<string, number>;
    efectivo: number;
  }[];
  agentes: {
    id: number;
    nombre: string;
  }[];
  totales: Record<string, number>;
  totalEfectivo: number;
}

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions-summary')
  @ApiOperation({ summary: 'Obtener resumen de transacciones por tipo y agente' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getTransactionSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TransactionSummaryResponse> {
    return this.reportsService.getTransactionSummary(startDate, endDate);
  }

  @Get('transactions-summary/excel')
  @ApiOperation({ summary: 'Exportar resumen de transacciones a Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename=transacciones_resumen.xlsx')
  async exportToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.reportsService.exportToExcel(startDate, endDate);
    res.send(buffer);
  }

  @Get('transactions-summary/print')
  @ApiOperation({ summary: 'Obtener versión para imprimir del resumen de transacciones en PDF' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getPrintVersion(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      console.log('Generando PDF para imprimir...');
      const buffer = await this.reportsService.getPrintVersion(startDate, endDate);
      
      // Configurar encabezados manualmente para evitar problemas
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=transacciones_resumen.pdf');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      
      // Enviar el buffer como respuesta
      console.log('Enviando PDF al cliente...');
      return res.send(buffer);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      return res.status(500).json({ message: 'Error al generar el PDF' });
    }
  }

  // ==================== REPORTES DE OPERACIÓN SUPER ====================

  @Get('super/closings')
  @ApiOperation({ summary: 'Reporte de Cierres Super' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'cajaNumero', required: false, type: Number })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number })
  async getSuperClosingsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
    @Query('usuarioId') usuarioId?: number,
  ) {
    return this.reportsService.getSuperClosingsReport(startDate, endDate, cajaNumero, usuarioId);
  }

  @Get('super/closings/excel')
  @ApiOperation({ summary: 'Exportar Cierres Super a Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'cajaNumero', required: false, type: Number })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportSuperClosingsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
    @Query('usuarioId') usuarioId?: number,
  ) {
    const buffer = await this.reportsService.exportSuperClosingsToExcel(startDate, endDate, cajaNumero, usuarioId);
    res.setHeader('Content-Disposition', `attachment; filename=cierres_super_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get('super/expenses')
  @ApiOperation({ summary: 'Reporte de Egresos Super' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'tipoEgresoId', required: false, type: Number })
  @ApiQuery({ name: 'cajaNumero', required: false, type: Number })
  async getSuperExpensesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tipoEgresoId') tipoEgresoId?: number,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    return this.reportsService.getSuperExpensesReport(startDate, endDate, tipoEgresoId, cajaNumero);
  }

  @Get('super/expenses/excel')
  @ApiOperation({ summary: 'Exportar Egresos Super a Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'tipoEgresoId', required: false, type: Number })
  @ApiQuery({ name: 'cajaNumero', required: false, type: Number })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportSuperExpensesToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tipoEgresoId') tipoEgresoId?: number,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    const buffer = await this.reportsService.exportSuperExpensesToExcel(startDate, endDate, tipoEgresoId, cajaNumero);
    res.setHeader('Content-Disposition', `attachment; filename=egresos_super_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get('super/balance-sales')
  @ApiOperation({ summary: 'Reporte de Ventas de Saldo' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'cajaNumero', required: false, type: Number })
  async getBalanceSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    return this.reportsService.getBalanceSalesReport(startDate, endDate, cajaNumero);
  }

  @Get('super/balance-sales/excel')
  @ApiOperation({ summary: 'Exportar Ventas de Saldo a Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'cajaNumero', required: false, type: Number })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportBalanceSalesToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cajaNumero') cajaNumero?: number,
  ) {
    const buffer = await this.reportsService.exportBalanceSalesToExcel(startDate, endDate, cajaNumero);
    res.setHeader('Content-Disposition', `attachment; filename=ventas_saldo_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  // ==================== REPORTES DE OPERACIÓN AGENTE ====================

  @Get('agent/closings')
  @ApiOperation({ summary: 'Reporte de Cierres de Agentes' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'proveedorId', required: false, type: Number })
  async getAgentClosingsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('proveedorId') proveedorId?: number,
  ) {
    return this.reportsService.getAgentClosingsReport(startDate, endDate, proveedorId);
  }

  @Get('agent/closings/excel')
  @ApiOperation({ summary: 'Exportar Cierres de Agentes a Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'proveedorId', required: false, type: Number })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAgentClosingsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('proveedorId') proveedorId?: number,
  ) {
    const buffer = await this.reportsService.exportAgentClosingsToExcel(startDate, endDate, proveedorId);
    res.setHeader('Content-Disposition', `attachment; filename=cierres_agentes_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get('agent/transactions')
  @ApiOperation({ summary: 'Reporte de Transacciones por Agente' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'agenteId', required: false, type: Number })
  @ApiQuery({ name: 'tipoTransaccionId', required: false, type: Number })
  async getAgentTransactionsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agenteId') agenteId?: number,
    @Query('tipoTransaccionId') tipoTransaccionId?: number,
  ) {
    return this.reportsService.getAgentTransactionsReport(startDate, endDate, agenteId, tipoTransaccionId);
  }

  @Get('agent/transactions/excel')
  @ApiOperation({ summary: 'Exportar Transacciones por Agente a Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'agenteId', required: false, type: Number })
  @ApiQuery({ name: 'tipoTransaccionId', required: false, type: Number })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAgentTransactionsToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agenteId') agenteId?: number,
    @Query('tipoTransaccionId') tipoTransaccionId?: number,
  ) {
    const buffer = await this.reportsService.exportAgentTransactionsToExcel(startDate, endDate, agenteId, tipoTransaccionId);
    res.setHeader('Content-Disposition', `attachment; filename=transacciones_agentes_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get('agent/consolidated')
  @ApiOperation({ summary: 'Reporte Consolidado de Operación Agente' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getAgentConsolidatedReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAgentConsolidatedReport(startDate, endDate);
  }

  @Get('agent/consolidated/excel')
  @ApiOperation({ summary: 'Exportar Consolidado de Agentes a Excel' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportAgentConsolidatedToExcel(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.reportsService.exportAgentConsolidatedToExcel(startDate, endDate);
    res.setHeader('Content-Disposition', `attachment; filename=consolidado_agentes_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }
}
