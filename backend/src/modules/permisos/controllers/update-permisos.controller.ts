import { Controller, Post, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Connection } from 'typeorm';

@ApiTags('permisos')
@Controller('permisos/update')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UpdatePermisosController {
  constructor(private connection: Connection) {}

  @Get('verificar-turnos')
  @ApiOperation({ summary: 'Verificar permisos de turnos' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permisos de turnos verificados' })
  async verificarPermisosTurnos() {
    try {
      // Consultar permisos relacionados con turnos
      const permisosTurnos = await this.connection.query(`
        SELECT id, nombre, codigo, descripcion, modulo 
        FROM tbl_permisos 
        WHERE modulo = 'Turnos' OR codigo LIKE '%turno%'
        ORDER BY id
      `);
      
      // Verificar si existe el permiso admin_turnos
      const adminTurnos = await this.connection.query(`
        SELECT id, nombre, codigo, descripcion, modulo 
        FROM tbl_permisos 
        WHERE codigo = 'admin_turnos'
      `);
      
      // Verificar permisos asignados al rol Administrador
      const permisosAdmin = await this.connection.query(`
        SELECT r.nombre as rol, p.codigo as permiso, p.id as permiso_id
        FROM tbl_permisos_roles pr
        JOIN tbl_roles r ON pr.rol_id = r.id
        JOIN tbl_permisos p ON pr.permiso_id = p.id
        WHERE (p.modulo = 'Turnos' OR p.codigo LIKE '%turno%')
        AND r.nombre = 'Administrador'
        ORDER BY p.codigo
      `);
      
      return {
        permisosTurnos,
        adminTurnos,
        permisosAdmin
      };
    } catch (error) {
      console.error('Error al verificar permisos de turnos:', error);
      throw error;
    }
  }

  @Post('turnos-granulares')
  @ApiOperation({ summary: 'Actualizar permisos de turnos a versión granular' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permisos actualizados correctamente' })
  async updateTurnosPermisos(): Promise<{ message: string; details: any }> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('Iniciando actualización de permisos de turnos a versión granular');

      // 1. Eliminar las asignaciones de permisos antiguos
      console.log('Eliminando asignaciones de permisos antiguos...');
      await queryRunner.query(`
        DELETE FROM tbl_permisos_roles 
        WHERE permiso_id IN (SELECT id FROM tbl_permisos WHERE codigo = 'admin_turnos');
      `);
      await queryRunner.query(`
        DELETE FROM tbl_permisos_roles 
        WHERE permiso_id IN (SELECT id FROM tbl_permisos WHERE codigo = 'ver_turnos');
      `);
      await queryRunner.query(`
        DELETE FROM tbl_permisos_roles 
        WHERE permiso_id IN (SELECT id FROM tbl_permisos WHERE codigo = 'activar_desactivar_turnos');
      `);

      // 2. Eliminar los permisos antiguos
      console.log('Eliminando permisos antiguos...');
      await queryRunner.query(`DELETE FROM tbl_permisos WHERE codigo = 'admin_turnos';`);
      await queryRunner.query(`DELETE FROM tbl_permisos WHERE codigo = 'ver_turnos';`);
      await queryRunner.query(`DELETE FROM tbl_permisos WHERE codigo = 'activar_desactivar_turnos';`);

      // 3. Crear nuevos permisos granulares
      console.log('Creando nuevos permisos granulares...');
      
      // Ver turnos
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
        VALUES ('Ver Turnos', 'Ver listado de turnos', 'ver_turnos', 'Turnos');
      `);
      
      // Crear turnos
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
        VALUES ('Crear Turnos', 'Crear nuevos turnos', 'crear_turnos', 'Turnos');
      `);
      
      // Editar turnos
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
        VALUES ('Editar Turnos', 'Editar turnos existentes', 'editar_turnos', 'Turnos');
      `);
      
      // Eliminar turnos
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
        VALUES ('Eliminar Turnos', 'Eliminar turnos', 'eliminar_turnos', 'Turnos');
      `);
      
      // Asignar usuarios a turnos
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
        VALUES ('Asignar Usuarios a Turnos', 'Asignar usuarios a turnos', 'asignar_usuarios_turnos', 'Turnos');
      `);
      
      // Iniciar turnos
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
        VALUES ('Iniciar Turnos', 'Iniciar turnos (registrar hora de inicio)', 'iniciar_turnos', 'Turnos');
      `);
      
      // Finalizar turnos
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, codigo, modulo)
        VALUES ('Finalizar Turnos', 'Finalizar turnos (registrar hora de fin)', 'finalizar_turnos', 'Turnos');
      `);

      // 4. Asignar permisos al rol de Administrador
      console.log('Asignando permisos al rol de Administrador...');
      
      // Obtener el ID del rol de Administrador
      const adminRolResult = await queryRunner.query(`SELECT id FROM tbl_roles WHERE nombre = 'Administrador' LIMIT 1;`);
      const adminRolId = adminRolResult[0]?.id || 1;
      
      // Obtener los IDs de los permisos recién creados
      const verTurnosResult = await queryRunner.query(`SELECT id FROM tbl_permisos WHERE codigo = 'ver_turnos' LIMIT 1;`);
      const crearTurnosResult = await queryRunner.query(`SELECT id FROM tbl_permisos WHERE codigo = 'crear_turnos' LIMIT 1;`);
      const editarTurnosResult = await queryRunner.query(`SELECT id FROM tbl_permisos WHERE codigo = 'editar_turnos' LIMIT 1;`);
      const eliminarTurnosResult = await queryRunner.query(`SELECT id FROM tbl_permisos WHERE codigo = 'eliminar_turnos' LIMIT 1;`);
      const asignarUsuariosTurnosResult = await queryRunner.query(`SELECT id FROM tbl_permisos WHERE codigo = 'asignar_usuarios_turnos' LIMIT 1;`);
      const iniciarTurnosResult = await queryRunner.query(`SELECT id FROM tbl_permisos WHERE codigo = 'iniciar_turnos' LIMIT 1;`);
      const finalizarTurnosResult = await queryRunner.query(`SELECT id FROM tbl_permisos WHERE codigo = 'finalizar_turnos' LIMIT 1;`);
      
      // Asignar permisos al rol de Administrador
      await queryRunner.query(`INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (${adminRolId}, ${verTurnosResult[0].id});`);
      await queryRunner.query(`INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (${adminRolId}, ${crearTurnosResult[0].id});`);
      await queryRunner.query(`INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (${adminRolId}, ${editarTurnosResult[0].id});`);
      await queryRunner.query(`INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (${adminRolId}, ${eliminarTurnosResult[0].id});`);
      await queryRunner.query(`INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (${adminRolId}, ${asignarUsuariosTurnosResult[0].id});`);
      await queryRunner.query(`INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (${adminRolId}, ${iniciarTurnosResult[0].id});`);
      await queryRunner.query(`INSERT INTO tbl_permisos_roles (rol_id, permiso_id) VALUES (${adminRolId}, ${finalizarTurnosResult[0].id});`);

      // 5. Verificar que los permisos se hayan creado correctamente
      console.log('Verificando permisos creados...');
      const permisosResult = await queryRunner.query(`
        SELECT id, nombre, codigo, descripcion, modulo 
        FROM tbl_permisos 
        WHERE modulo = 'Turnos'
      `);

      // Confirmar la transacción
      await queryRunner.commitTransaction();
      
      console.log('Actualización de permisos completada con éxito');
      
      return { 
        message: 'Permisos de turnos actualizados correctamente a versión granular',
        details: {
          permisosCreados: permisosResult
        }
      };
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      console.error('Error al actualizar permisos de turnos:', error);
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }
}
