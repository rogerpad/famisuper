// Interfaz para el tipo de egreso del super
export interface SuperExpenseType {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

// Interfaz para crear un tipo de egreso del super
export interface CreateSuperExpenseTypeDto {
  nombre: string;
  descripcion?: string | null;
}

// Interfaz para actualizar un tipo de egreso del super
export interface UpdateSuperExpenseTypeDto {
  nombre?: string;
  descripcion?: string | null;
}
