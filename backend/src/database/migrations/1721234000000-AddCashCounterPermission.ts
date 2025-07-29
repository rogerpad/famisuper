import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCashCounterPermission1721234000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si el permiso ya existe
    const existingPermission = await queryRunner.query(
      `SELECT id FROM tbl_permisos WHERE codigo = 'ver_contador_efectivo'`
    );

    // Si el permiso no existe, crearlo
    if (existingPermission.length === 0) {
      // Insertar el permiso
      await queryRunner.query(`
        INSERT INTO tbl_permisos (nombre, descripcion, modulo, codigo)
        VALUES (
          'Ver Contador de Efectivo', 
          'Permite acceder y utilizar el contador de efectivo para realizar conteos de billetes', 
          'Efectivo',
          'ver_contador_efectivo'
        )
      `);

      // Obtener el ID del permiso recién creado
      const permisoResult = await queryRunner.query(
        `SELECT id FROM tbl_permisos WHERE codigo = 'ver_contador_efectivo'`
      );
      const permisoId = permisoResult[0].id;

      // Obtener IDs de roles
      const rolesResult = await queryRunner.query(
        `SELECT id, nombre FROM tbl_roles WHERE nombre IN ('Administrador', 'Vendedor')`
      );

      // Asignar el permiso a los roles
      for (const rol of rolesResult) {
        // Verificar si ya existe la asignación
        const existingAssignment = await queryRunner.query(
          `SELECT id FROM tbl_permisos_roles WHERE rol_id = ${rol.id} AND permiso_id = ${permisoId}`
        );

        if (existingAssignment.length === 0) {
          await queryRunner.query(`
            INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
            VALUES (${rol.id}, ${permisoId})
          `);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Obtener el ID del permiso
    const permisoResult = await queryRunner.query(
      `SELECT id FROM tbl_permisos WHERE codigo = 'ver_contador_efectivo'`
    );
    
    if (permisoResult.length > 0) {
      const permisoId = permisoResult[0].id;
      
      // Eliminar las asignaciones de roles
      await queryRunner.query(`
        DELETE FROM tbl_permisos_roles WHERE permiso_id = ${permisoId}
      `);
      
      // Eliminar el permiso
      await queryRunner.query(`
        DELETE FROM tbl_permisos WHERE id = ${permisoId}
      `);
    }
  }
}
