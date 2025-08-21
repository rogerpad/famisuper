export interface Package {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  telefonicaId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PackageFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  telefonicaId: number;
}
