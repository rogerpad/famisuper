export interface SuperClosing {
  id: number;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    username: string;
  };
  efectivoInicial: number;
  adicionalCasa: number;
  adicionalAgente: number;
  ventaContado: number;
  ventaCredito: number;
  ventaPos: number;
  transfOccidente: number;
  transfAtlantida: number;
  transfBac: number;
  transfBanpais: number;
  totalSpv: number;
  abonoCredito: number;
  ventaSaldo: number;
  pagoProductos: number;
  gastos: number;
  prestaAgentes: number;
  efectivoTotal: number;
  efectivoCajaF: number;
  efectivoCierreTurno: number;
  faltanteSobrante: number;
  fechaCierre: Date | string;
  activo: boolean;
}

export interface SuperClosingFormData {
  usuarioId: number;
  efectivoInicial: number;
  adicionalCasa: number;
  adicionalAgente: number;
  ventaContado: number;
  ventaCredito: number;
  ventaPos: number;
  transfOccidente: number;
  transfAtlantida: number;
  transfBac: number;
  transfBanpais: number;
  totalSpv: number;
  abonoCredito: number;
  ventaSaldo: number;
  pagoProductos: number;
  gastos: number;
  prestaAgentes: number;
  efectivoTotal: number;
  efectivoCajaF: number;
  efectivoCierreTurno: number;
  faltanteSobrante: number;
  fechaCierre: Date;
  activo: boolean;
}

export interface SuperClosingFilters {
  fechaInicio?: Date;
  fechaFin?: Date;
  usuarioId?: number;
  activo?: boolean;
}
