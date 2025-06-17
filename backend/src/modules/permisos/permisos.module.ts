import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisosController } from './controllers/permisos.controller';
import { UserPermissionsController } from './controllers/user-permissions.controller';
import { PermisosService } from './services/permisos.service';
import { UserPermissionsService } from './services/user-permissions.service';
import { Permiso } from './entities/permiso.entity';
import { PermisoRol } from './entities/permiso-rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permiso, PermisoRol]),
  ],
  controllers: [PermisosController, UserPermissionsController],
  providers: [PermisosService, UserPermissionsService],
  exports: [PermisosService, UserPermissionsService],
})
export class PermisosModule {}
