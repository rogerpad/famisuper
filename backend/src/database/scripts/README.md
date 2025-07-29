# Scripts de Base de Datos para Famisuper

Este directorio contiene scripts SQL para configurar y mantener la base de datos PostgreSQL del sistema Famisuper.

## Corrección de Errores NaN en Registros de Actividad de Turnos

Se han implementado mejoras en el frontend y backend para evitar el error "invalid input syntax for type bigint: NaN" en la funcionalidad de Registros de Actividad de Turnos. Para completar la implementación, es necesario ejecutar los siguientes scripts SQL:

### 1. Agregar Permiso para Ver Registros de Actividad

```bash
psql -U [usuario_postgres] -d [nombre_base_datos] -f agregar-permiso-ver-registro-actividad.sql
```

Este script:
- Crea el permiso `ver_registro_actividad_turnos` si no existe
- Asigna el permiso al rol Administrador

### 2. Asignar Permiso al Rol Supervisor

```bash
psql -U [usuario_postgres] -d [nombre_base_datos] -f agregar-permiso-supervisor.sql
```

Este script:
- Asigna el permiso `ver_registro_actividad_turnos` al rol Supervisor
- Verifica que el permiso exista previamente

## Otros Scripts Disponibles

- `agregar-permiso-reiniciar-turnos.sql`: Agrega el permiso para reiniciar turnos

## Notas Importantes

- Ejecute los scripts en el orden indicado
- Verifique los mensajes de salida para confirmar que los permisos se han asignado correctamente
- Después de ejecutar los scripts, reinicie el servidor backend para que los cambios surtan efecto

## Solución de Problemas

Si encuentra errores relacionados con valores NaN en los IDs, verifique:

1. Que todos los componentes del frontend estén validando correctamente los IDs antes de enviarlos al backend
2. Que el backend esté validando y convirtiendo adecuadamente los parámetros recibidos
3. Que los usuarios tengan los permisos necesarios para acceder a la funcionalidad
