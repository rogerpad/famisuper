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
}
