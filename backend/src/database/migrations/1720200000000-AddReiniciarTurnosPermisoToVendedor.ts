import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReiniciarTurnosPermisoToVendedor1720200000000 implements MigrationInterface {
    name = 'AddReiniciarTurnosPermisoToVendedor1720200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Iniciando migración para agregar permiso reiniciar_turnos al rol Vendedor');
        
        // Verificar si el permiso ya existe
        const permisoExistente = await queryRunner.query(`
            SELECT id FROM tbl_permisos WHERE nombre = 'reiniciar_turnos'
        `);
        
        let permisoId: number;
        
        if (permisoExistente.length === 0) {
            console.log('Creando permiso reiniciar_turnos');
            // Crear el permiso si no existe
            const resultado = await queryRunner.query(`
                INSERT INTO tbl_permisos (nombre, descripcion)
                VALUES ('reiniciar_turnos', 'Permite reiniciar turnos (eliminar hora de inicio y fin)')
                RETURNING id
            `);
            permisoId = resultado[0].id;
            console.log(`Permiso reiniciar_turnos creado con ID: ${permisoId}`);
        } else {
            permisoId = permisoExistente[0].id;
            console.log(`El permiso reiniciar_turnos ya existe con ID: ${permisoId}`);
        }
        
        // Buscar el ID del rol Vendedor
        const rolVendedor = await queryRunner.query(`
            SELECT id FROM tbl_roles WHERE nombre = 'Vendedor'
        `);
        
        if (rolVendedor.length === 0) {
            console.log('No se encontró el rol Vendedor');
            return;
        }
        
        const rolId = rolVendedor[0].id;
        console.log(`Rol Vendedor encontrado con ID: ${rolId}`);
        
        // Verificar si el permiso ya está asignado al rol
        const permisoAsignado = await queryRunner.query(`
            SELECT 1 FROM tbl_permisos_roles 
            WHERE rol_id = ${rolId} AND permiso_id = ${permisoId}
        `);
        
        if (permisoAsignado.length === 0) {
            console.log('Asignando permiso reiniciar_turnos al rol Vendedor');
            // Asignar el permiso al rol Vendedor
            await queryRunner.query(`
                INSERT INTO tbl_permisos_roles (rol_id, permiso_id)
                VALUES (${rolId}, ${permisoId})
            `);
            console.log('Permiso reiniciar_turnos asignado al rol Vendedor');
        } else {
            console.log('El permiso reiniciar_turnos ya está asignado al rol Vendedor');
        }
        
        console.log('Migración completada exitosamente');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('Revirtiendo migración: eliminando permiso reiniciar_turnos del rol Vendedor');
        
        // Buscar IDs necesarios
        const permiso = await queryRunner.query(`
            SELECT id FROM tbl_permisos WHERE nombre = 'reiniciar_turnos'
        `);
        
        const rolVendedor = await queryRunner.query(`
            SELECT id FROM tbl_roles WHERE nombre = 'Vendedor'
        `);
        
        if (permiso.length > 0 && rolVendedor.length > 0) {
            const permisoId = permiso[0].id;
            const rolId = rolVendedor[0].id;
            
            // Eliminar la asignación del permiso al rol
            await queryRunner.query(`
                DELETE FROM tbl_permisos_roles 
                WHERE rol_id = ${rolId} AND permiso_id = ${permisoId}
            `);
            console.log('Asignación del permiso reiniciar_turnos al rol Vendedor eliminada');
            
            // Opcionalmente, eliminar el permiso si no está siendo usado por otros roles
            const otrasAsignaciones = await queryRunner.query(`
                SELECT 1 FROM tbl_permisos_roles WHERE permiso_id = ${permisoId}
            `);
            
            if (otrasAsignaciones.length === 0) {
                await queryRunner.query(`
                    DELETE FROM tbl_permisos WHERE id = ${permisoId}
                `);
                console.log('Permiso reiniciar_turnos eliminado');
            }
        }
        
        console.log('Reversión de migración completada');
    }
}
