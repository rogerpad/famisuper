# Carga Automática de Adicionales y Préstamos en Cierre Super

## Descripción de la Funcionalidad

Se ha implementado una función que carga automáticamente los valores de adicionales y préstamos al abrir el formulario de "Nuevo Cierre de Super". Esta funcionalidad consulta la tabla `tbl_adic_prest` y obtiene los montos según los siguientes criterios:

1. **Adicional Casa**: Carga el valor de monto donde `Acuerdo = 'Adicional'` y `Origen = 'Casa'`
2. **Adicional Agente**: Carga el valor de monto donde `Acuerdo = 'Adicional'` y `Origen = 'Agente'`
3. **Préstamo Agente**: Carga el valor de monto donde `Acuerdo = 'Prestamo'` y `Origen = 'Agente'`

En todos los casos, solo se consideran los registros que están activos (`activo = true`).

## Implementación Técnica

### 1. API de Adicionales y Préstamos

Se han agregado dos nuevas funciones en `adicionalesPrestamosApi.ts`:

- `getAdicionalesPrestamosActivosByAcuerdoOrigen`: Obtiene los registros activos filtrados por acuerdo y origen
- `getMontoTotalByAcuerdoOrigen`: Calcula el monto total de los registros que cumplen con los criterios

### 2. Backend: Filtrado por Query Parameters

Se ha modificado el backend para soportar el filtrado por parámetros de consulta:

- **Controlador**: Se actualizó `AdicionalesPrestamosController` para recibir y procesar los parámetros `acuerdo`, `origen` y `activo`
- **Servicio**: Se modificó `AdicionalesPrestamosService.findAll()` para aplicar los filtros en la consulta a la base de datos

### 3. Manejo de variaciones en el valor "Préstamo"

Para solucionar el problema de carga del campo "Préstamos Agentes", se implementó una solución que maneja ambas variantes del texto:

- Se intenta primero obtener registros con el valor `Préstamo` (con tilde)
- Si no se encuentran resultados, se intenta con `Prestamo` (sin tilde)
- Esta implementación asegura la compatibilidad con la forma en que los datos están almacenados en la base de datos

### 4. Formulario de Cierre Super

En el componente `CierreSuperForm.tsx` se ha implementado:

- La función `cargarValoresAdicionalesPrestamos()` que se ejecuta automáticamente al cargar el formulario en modo creación
- Esta función consulta los montos y actualiza los campos correspondientes en el formulario

## Flujo de Ejecución

1. El usuario navega a "Nuevo Cierre de Super"
2. Al cargar el formulario, se ejecuta automáticamente la función `cargarValoresAdicionalesPrestamos()`
3. La función realiza tres consultas a la API para obtener los montos según los criterios definidos
4. Los campos "Adicional Casa", "Adicional Agente" y "Préstamos a Agentes" se actualizan con los valores obtenidos
5. El usuario puede continuar completando el resto del formulario

## Consideraciones

- Esta funcionalidad solo se ejecuta en modo creación, no en modo edición
- Si no hay registros que cumplan con los criterios, los campos se inicializan en 0
- Si ocurre algún error durante la consulta, se registra en la consola pero no se muestra al usuario
- Los valores cargados automáticamente pueden ser modificados por el usuario si es necesario
