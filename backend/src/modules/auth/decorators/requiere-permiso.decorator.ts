import { SetMetadata } from '@nestjs/common';

export const PERMISO_KEY = 'permiso';
export const RequierePermiso = (...permisos: string[]) => SetMetadata(PERMISO_KEY, permisos);
