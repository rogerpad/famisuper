export interface SuperBillCount {
  id: number;
  usuarioId: number;
  deno500: number;
  cant500: number;
  total500: number;
  deno200: number;
  cant200: number;
  total200: number;
  deno100: number;
  cant100: number;
  total100: number;
  deno50: number;
  cant50: number;
  total50: number;
  deno20: number;
  cant20: number;
  total20: number;
  deno10: number;
  cant10: number;
  total10: number;
  deno5: number;
  cant5: number;
  total5: number;
  deno2: number;
  cant2: number;
  total2: number;
  deno1: number;
  cant1: number;
  total1: number;
  totalGeneral: number;
  activo: boolean;
  fecha: string;
  cajaNumero?: number | null;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface SuperBillCountFormData {
  usuarioId?: number;
  cant500: number;
  cant200: number;
  cant100: number;
  cant50: number;
  cant20: number;
  cant10: number;
  cant5: number;
  cant2: number;
  cant1: number;
  // Date is generated automatically in backend
}
