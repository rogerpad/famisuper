import { Module, OnModuleInit } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { FixUsuariosTurnosMigration } from './fix-usuarios-turnos.migration';
import { ModuleRef } from '@nestjs/core';

@Module({
  providers: [MigrationService, FixUsuariosTurnosMigration],
})
export class MigrationModule implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    // Ejecutar la migración para corregir la tabla tbl_usuarios_turnos
    const fixUsuariosTurnosMigration = this.moduleRef.get(FixUsuariosTurnosMigration);
    await fixUsuariosTurnosMigration.run();
  }
}
