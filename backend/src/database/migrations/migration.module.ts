import { Module, OnModuleInit } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { FixUsuariosTurnosMigration } from './fix-usuarios-turnos.migration';
import { CreateTipoEgresosTable1723652870000 } from './1723652870000-CreateTipoEgresosTable';
import { ModuleRef } from '@nestjs/core';
import { DataSource } from 'typeorm';

@Module({
  providers: [MigrationService, FixUsuariosTurnosMigration, CreateTipoEgresosTable1723652870000],
})
export class MigrationModule implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      // Ejecutar la migración para corregir la tabla tbl_usuarios_turnos
      const fixUsuariosTurnosMigration = this.moduleRef.get(FixUsuariosTurnosMigration);
      await fixUsuariosTurnosMigration.run();
      
      // Ejecutar la migración para crear o actualizar la tabla tbl_tipo_egresos solo si la conexión está disponible
      if (this.dataSource && this.dataSource.isInitialized) {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
          await queryRunner.connect();
          await queryRunner.startTransaction();
          
          const createTipoEgresosTable = this.moduleRef.get(CreateTipoEgresosTable1723652870000);
          await createTipoEgresosTable.up(queryRunner);
          
          await queryRunner.commitTransaction();
        } catch (error) {
          console.error('Error al ejecutar la migración de tbl_tipo_egresos:', error);
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
      } else {
        console.warn('La conexión a la base de datos no está inicializada, omitiendo migración de tbl_tipo_egresos');
      }
    } catch (error) {
      console.error('Error en el módulo de migraciones:', error);
    }
  }
}
