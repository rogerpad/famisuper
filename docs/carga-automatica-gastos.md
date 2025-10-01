# Carga Automática de Gastos en Cierre Super

## Descripción

Esta funcionalidad permite cargar automáticamente el valor de "Gastos" en el formulario de Nuevo Cierre Super. El sistema calcula la suma del campo `total` de los registros activos en la tabla `tbl_egresos_super` donde:
- `tipo_de_egreso_id` corresponde a "Gasto"
- `forma_pago_id` corresponde a "Efectivo"

## Implementación

### Backend

1. Se agregó un nuevo método en `SuperExpensesService`:
   ```typescript
   async getSumGastosEfectivo(): Promise<number>
   ```
   Este método:
   - Consulta dinámicamente los IDs de "Gasto" y "Efectivo" en sus respectivas tablas
   - Realiza una consulta SQL para sumar el campo `total` de los registros que cumplen los criterios
   - Devuelve 0 si no hay registros o si ocurre algún error

2. Se creó un nuevo endpoint en `SuperExpensesController`:
   ```typescript
   @Get('sum/gastos-efectivo')
   @UseGuards(PermisosGuard)
   @RequierePermiso('ver_egresos_super')
   async getSumGastosEfectivo()
   ```
   Este endpoint está protegido y requiere el permiso 'ver_egresos_super'.

### Frontend

1. Se agregó una nueva función en el hook `useSuperExpenses`:
   ```typescript
   const getSumGastosEfectivo = async (): Promise<number>
   ```
   Esta función consume el endpoint del backend y devuelve la suma calculada.

2. Se modificó el componente `CierreSuperForm` para:
   - Importar la función `getSumGastosEfectivo` del hook `useSuperExpenses`
   - Actualizar la función `cargarValoresAdicionalesPrestamos` para obtener y asignar el valor de Gastos al campo correspondiente del formulario

## Uso

Al crear un nuevo Cierre Super, el campo "Gastos" se cargará automáticamente con la suma de los gastos en efectivo activos. Este valor se calcula en tiempo real al abrir el formulario.

## Consideraciones

- Si no existen registros que cumplan los criterios, el valor será 0
- Si ocurre algún error durante la consulta, se manejará adecuadamente y se mostrará un mensaje en la consola
- La búsqueda de los IDs de "Gasto" y "Efectivo" utiliza ILIKE para ser tolerante a variaciones en mayúsculas/minúsculas

## Relación con otras funcionalidades

Esta funcionalidad es similar a la carga automática de "Venta Saldo" y "Pago Productos", y complementa el proceso de creación de Cierres Super, facilitando el registro de información precisa y actualizada.
