import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Provider } from '../providers/entities/provider.entity';
import { TransactionType } from '../transaction-types/entities/transaction-type.entity';
import { ProviderType } from '../provider-types/entities/provider-type.entity';
import * as ExcelJS from 'exceljs';
import * as PdfMake from 'pdfmake/build/pdfmake';
import * as PdfFonts from 'pdfmake/build/vfs_fonts';

interface TransactionSummary {
  tipoTransaccion: string;
  tipoTransaccionId: number;
  agentes: {
    [agenteId: string]: number; // Monto por agente
  };
  efectivo: number; // Total en efectivo
}

interface TransactionReportData {
  transactionTypes: TransactionSummary[];
  agentes: {
    id: number;
    nombre: string;
  }[];
  totales: {
    [agenteId: string]: number;
  };
  totalEfectivo: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
    @InjectRepository(TransactionType)
    private transactionTypesRepository: Repository<TransactionType>,
    @InjectRepository(ProviderType)
    private providerTypesRepository: Repository<ProviderType>,
  ) {}

  async getTransactionSummary(startDate?: string, endDate?: string): Promise<TransactionReportData> {
    // Obtener todos los tipos de transacción
    const transactionTypes = await this.transactionTypesRepository.find({
      order: { nombre: 'ASC' },
    });

    // Obtener todos los proveedores de tipo agente
    const agentTypeId = await this.getAgentTypeId();
    const agentes = await this.providersRepository.find({
      where: { tipoProveedorId: agentTypeId, activo: true },
      order: { nombre: 'ASC' },
    });

    // Crear un mapa de agentes por ID para facilitar la búsqueda
    const agentesMap = {};
    agentes.forEach(agente => {
      agentesMap[agente.id] = agente;
    });

    // Para el cálculo del resultado final, solo consideramos transacciones activas sin filtrar por fechas
    // Obtener todas las transacciones activas
    const transactions = await this.transactionsRepository.find({
      where: {
        estado: 1, // Solo transacciones activas
      },
      relations: ['tipoTransaccion', 'agente'],
    });
  
    console.log(`[REPORTS_SERVICE] getTransactionSummary - Obteniendo todas las transacciones activas sin filtro de fechas`);
    console.log(`[REPORTS_SERVICE] getTransactionSummary - Total de transacciones activas: ${transactions.length}`);

    // Inicializar el objeto de resumen
    const summaryMap: { [tipoTransaccionId: number]: TransactionSummary } = {};
    
    // Inicializar el resumen para cada tipo de transacción
    transactionTypes.forEach(type => {
      const agentesSummary = {};
      agentes.forEach(agente => {
        agentesSummary[agente.id] = 0;
      });

      summaryMap[type.id] = {
        tipoTransaccion: type.nombre,
        tipoTransaccionId: type.id,
        agentes: agentesSummary,
        efectivo: 0,
      };
    });

    // Inicializar totales por agente
    const totales = {};
    agentes.forEach(agente => {
      totales[agente.id] = 0;
    });
    let totalEfectivo = 0;

    // Procesar las transacciones
    transactions.forEach(transaction => {
      // Asegurarse de que tipoTransaccionId y agenteId sean números válidos
      const tipoTransaccionId = Number(transaction.tipoTransaccionId);
      const agenteId = Number(transaction.agenteId);
      const valor = Number(transaction.valor) || 0;
      
      // Validar que el valor sea un número
      if (isNaN(valor)) {
        console.warn(`[REPORTS_SERVICE] Valor inválido en transacción ID ${transaction.id}: ${transaction.valor}`);
        return; // Saltar esta transacción
      }
      
      // Validar que el tipo de transacción exista
      if (!summaryMap[tipoTransaccionId]) {
        console.warn(`[REPORTS_SERVICE] Tipo de transacción no encontrado: ${tipoTransaccionId}`);
        return; // Saltar esta transacción
      }
      
      // Log detallado para depuración
      console.log(`[REPORTS_SERVICE] Procesando transacción: ID=${transaction.id}, Tipo=${transaction.tipoTransaccion?.nombre || tipoTransaccionId}, Agente=${transaction.agente?.nombre || agenteId}, Valor=${valor}`);
      
      // Si la transacción tiene un agente válido y ese agente está en nuestro listado
      if (!isNaN(agenteId) && agentesMap[agenteId] && totales[agenteId] !== undefined) {
        console.log(`[REPORTS_SERVICE] Sumando ${valor} al agente ${agentesMap[agenteId].nombre} (ID: ${agenteId}) para tipo ${summaryMap[tipoTransaccionId].tipoTransaccion}`);
        summaryMap[tipoTransaccionId].agentes[agenteId] += valor;
        totales[agenteId] += valor;
      } else {
        // Si no tiene agente o el agente no está en el listado, se considera efectivo
        console.log(`[REPORTS_SERVICE] Sumando ${valor} a efectivo para tipo ${summaryMap[tipoTransaccionId].tipoTransaccion}`);
        summaryMap[tipoTransaccionId].efectivo += valor;
        totalEfectivo += valor;
      }
    });
    
    // Log del resumen final para depuración
    console.log('[REPORTS_SERVICE] Resumen de transacciones por tipo y agente:');
    Object.values(summaryMap).forEach(summary => {
      console.log(`[REPORTS_SERVICE] Tipo: ${summary.tipoTransaccion}`);
      Object.entries(summary.agentes).forEach(([agenteId, valor]) => {
        if (valor > 0) {
          console.log(`[REPORTS_SERVICE]   - Agente ${agentesMap[agenteId]?.nombre || agenteId}: ${valor}`);
        }
      });
      if (summary.efectivo > 0) {
        console.log(`[REPORTS_SERVICE]   - Efectivo: ${summary.efectivo}`);
      }
    });

    // Convertir el mapa a un array para el resultado
    const result: TransactionReportData = {
      transactionTypes: Object.values(summaryMap),
      agentes: agentes.map(agente => ({ id: agente.id, nombre: agente.nombre })),
      totales,
      totalEfectivo,
    };

    return result;
  }

  async exportToExcel(startDate?: string, endDate?: string): Promise<any> {
    const reportData = await this.getTransactionSummary(startDate, endDate);
    
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen de Transacciones');
    
    // Añadir encabezados
    const headers = ['Tipo de Transacción'];
    reportData.agentes.forEach(agente => {
      headers.push(agente.nombre);
    });
    headers.push('Efectivo');
    
    worksheet.addRow(headers);
    
    // Añadir datos
    reportData.transactionTypes.forEach(row => {
      const rowData = [row.tipoTransaccion];
      reportData.agentes.forEach(agente => {
        rowData.push((row.agentes[agente.id] || 0).toString());
      });
      rowData.push(row.efectivo.toString());
      worksheet.addRow(rowData);
    });
    
    // Añadir fila de totales
    const totalsRow = ['TOTAL'];
    reportData.agentes.forEach(agente => {
      totalsRow.push((reportData.totales[agente.id] || 0).toString());
    });
    totalsRow.push(reportData.totalEfectivo.toString());
    worksheet.addRow(totalsRow);
    
    // Dar formato a las celdas
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(worksheet.rowCount).font = { bold: true };
    
    // Formatear las columnas numéricas como moneda
    for (let i = 2; i <= headers.length; i++) {
      worksheet.getColumn(i).numFmt = '"L"#,##0.00';
      worksheet.getColumn(i).width = 15;
    }
    
    // Guardar el libro como buffer
    return await workbook.xlsx.writeBuffer();
  }

  async getPrintVersion(startDate?: string, endDate?: string): Promise<any> {
    const reportData = await this.getTransactionSummary(startDate, endDate);
    
    // Registrar las fuentes para pdfmake
    PdfMake.vfs = PdfFonts.pdfMake.vfs;
    
    // Preparar los encabezados de la tabla
    const headers = ['Tipo de Transacción'];
    reportData.agentes.forEach(agente => {
      headers.push(agente.nombre);
    });
    headers.push('Efectivo');
    
    // Preparar los datos de la tabla
    const tableBody = [];
    
    // Añadir fila de encabezados
    tableBody.push(headers.map(header => ({
      text: header,
      style: 'tableHeader',
      alignment: header === 'Tipo de Transacción' ? 'left' : 'right'
    })));
    
    // Añadir filas de datos
    reportData.transactionTypes.forEach(row => {
      const rowData = [{ text: row.tipoTransaccion, alignment: 'left' }];
      
      reportData.agentes.forEach(agente => {
        const valor = row.agentes[agente.id] || 0;
        rowData.push({
          text: valor > 0 ? `L${valor.toFixed(2)}` : '-',
          alignment: 'right'
        });
      });
      
      // Calcular el total por tipo (suma de agentes + efectivo)
      let totalPorTipo = row.efectivo || 0;
      Object.values(row.agentes).forEach((valor: any) => {
        totalPorTipo += Number(valor) || 0;
      });
      
      rowData.push({
        text: totalPorTipo > 0 ? `L${totalPorTipo.toFixed(2)}` : '-',
        alignment: 'right'
        // El color de fondo se aplicará en la definición del layout
      });
      
      tableBody.push(rowData);
    });
    
    // Añadir fila de totales
    const totalsRow = [{ text: 'TOTAL', style: 'tableFooter', alignment: 'left' }];
    
    // Calcular totales por agente
    reportData.agentes.forEach(agente => {
      let totalPorAgente = 0;
      reportData.transactionTypes.forEach(tipo => {
        totalPorAgente += Number(tipo.agentes[agente.id]) || 0;
      });
      
      totalsRow.push({
        text: `L${totalPorAgente.toFixed(2)}`,
        style: 'tableFooter',
        alignment: 'right'
      });
    });
    
    // Calcular total de efectivo
    let totalEfectivo = 0;
    reportData.transactionTypes.forEach(tipo => {
      // Sumar efectivo y valores de agentes
      let totalPorTipo = tipo.efectivo || 0;
      Object.values(tipo.agentes).forEach((valor: any) => {
        totalPorTipo += Number(valor) || 0;
      });
      totalEfectivo += totalPorTipo;
    });
    
    totalsRow.push({
      text: `L${totalEfectivo.toFixed(2)}`,
      style: 'tableFooter',
      alignment: 'right'
      // El color de fondo se aplicará en la definición del layout
    });
    
    tableBody.push(totalsRow);
    
    // Definir el documento PDF
    const docDefinition = {
      content: [
        { text: 'Resumen de Transacciones', style: 'header' },
        {
          text: `Período: ${startDate || 'Inicio'} - ${endDate || 'Fin'}`,
          style: 'subheader'
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: Array(headers.length).fill('*'),
            body: tableBody
          },
          layout: {
            fillColor: function(rowIndex, node, columnIndex) {
              if (rowIndex === 0) {
                return '#2196F3'; // Color azul para los encabezados
              } else if (rowIndex === tableBody.length - 1) {
                return '#1976D2'; // Color azul oscuro para la fila de totales
              } else if (columnIndex === headers.length - 1) {
                return '#e6ffe6'; // Color verde claro para la columna de efectivo
              }
              return null;
            }
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'white'
        },
        tableFooter: {
          bold: true,
          fontSize: 12,
          color: 'white'
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
    
    // Generar el PDF
    const pdfDoc = PdfMake.createPdf(docDefinition);
    
    // Retornar el PDF como buffer
    return new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  }

  private async getAgentTypeId(): Promise<number> {
    // Buscar el tipo de proveedor "Agente"
    const agentType = await this.providerTypesRepository.findOne({
      where: { nombre: 'Agente' },
    });
    
    if (!agentType) {
      throw new Error('No se encontró el tipo de proveedor "Agente"');
    }
    
    return agentType.id;
  }
}
