# 🧪 Guía de Pruebas - Asignación Automática de cajaNumero

**Fecha:** 25 de Octubre, 2024  
**Estado:** ✅ Backend compilado y listo para pruebas

---

## 🎯 Objetivo de las Pruebas

Verificar que todos los registros creados en las tablas de Super tengan asignado automáticamente el `caja_numero` del turno activo del usuario.

---

## ✅ Pre-requisitos

- ✅ Backend compilado sin errores
- ✅ Base de datos con migraciones ejecutadas
- ✅ Entidades actualizadas con campo `cajaNumero`
- ✅ Servicios actualizados con lógica de asignación

---

## 🧪 Plan de Pruebas

### **Test 1: Egreso de Super (SuperExpense)**

#### **Pasos:**
1. Login como usuario con permisos de Super
2. Iniciar turno seleccionando **Caja 1**
3. Ir a "Egresos de Super"
4. Crear un nuevo egreso:
   - Tipo: Gasto
   - Descripción: "Prueba Caja 1"
   - Monto: 100.00
   - Forma de pago: Efectivo
5. Guardar

#### **Verificación SQL:**
```sql
SELECT id, usuario_id, caja_numero, descripcion_egreso, total, fecha_egreso 
FROM tbl_egresos_super 
WHERE descripcion_egreso = 'Prueba Caja 1'
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = 1`
- ✅ `descripcion_egreso = 'Prueba Caja 1'`
- ✅ `total = 100.00`

---

### **Test 2: Conteo de Billetes (SuperBillCount)**

#### **Pasos:**
1. Con el turno activo en **Caja 1**
2. Ir a "Conteo de Billetes"
3. Ingresar cantidades:
   - 100 Bs: 5 billetes
   - 50 Bs: 10 billetes
4. Guardar conteo

#### **Verificación SQL:**
```sql
SELECT id, usuario_id, caja_numero, total_general, fecha 
FROM tbl_conteo_billetes_super 
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = 1`
- ✅ `total_general = 1000.00` (5*100 + 10*50)

---

### **Test 3: Flujo de Saldo (BalanceFlow)**

#### **Pasos:**
1. Con el turno activo en **Caja 1**
2. Ir a "Flujos de Saldo"
3. Crear un nuevo flujo:
   - Telefónica: VIVA
   - Saldo inicial: 500.00
   - Saldo comprado: 1000.00
   - Saldo vendido: 800.00
4. Guardar

#### **Verificación SQL:**
```sql
SELECT id, caja_numero, nombre, saldo_inicial, saldo_comprado, saldo_vendido, saldo_final, fecha 
FROM tbl_flujos_saldo 
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = 1`
- ✅ `saldo_final = 700.00` (500 + 1000 - 800)

---

### **Test 4: Venta de Saldo (BalanceSale)**

#### **Pasos:**
1. Con el turno activo en **Caja 1**
2. Ir a "Ventas de Saldo"
3. Registrar una venta:
   - Telefónica: ENTEL
   - Monto: 50.00
   - Cantidad: 1
4. Guardar

#### **Verificación SQL:**
```sql
SELECT id, usuario_id, caja_numero, cantidad, monto, fecha 
FROM tbl_ventas_saldo 
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = 1`
- ✅ `monto = 50.00`

---

### **Test 5: Adicional/Préstamo (AdditionalLoan)**

#### **Pasos:**
1. Con el turno activo en **Caja 1**
2. Ir a "Adicionales y Préstamos"
3. Registrar un adicional:
   - Acuerdo: Adicional
   - Origen: Caja chica
   - Descripción: "Prueba adicional Caja 1"
   - Monto: 200.00
4. Guardar

#### **Verificación SQL:**
```sql
SELECT id, usuario_id, caja_numero, acuerdo, origen, descripcion, monto, fecha 
FROM tbl_adic_prest 
WHERE descripcion = 'Prueba adicional Caja 1'
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = 1`
- ✅ `monto = 200.00`

---

### **Test 6: Cierre de Super (SuperClosing)**

#### **Pasos:**
1. Con el turno activo en **Caja 1**
2. Ir a "Cierre de Super"
3. Realizar el cierre con todos los datos
4. Guardar cierre

#### **Verificación SQL:**
```sql
SELECT id, usuario_id, caja_numero, fecha_cierre, efectivo_sistema, efectivo_real 
FROM tbl_cierres_super 
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = 1`
- ✅ Fecha del día actual

---

### **Test 7: Múltiples Cajas Simultáneas**

#### **Escenario:**
Dos usuarios trabajando al mismo tiempo en cajas diferentes.

#### **Usuario 1:**
1. Login como Usuario A
2. Iniciar turno en **Caja 1**
3. Crear un egreso: "Egreso Usuario A - Caja 1"

#### **Usuario 2 (en paralelo):**
1. Login como Usuario B
2. Iniciar turno en **Caja 2**
3. Crear un egreso: "Egreso Usuario B - Caja 2"

#### **Verificación SQL:**
```sql
SELECT 
  id, 
  usuario_id, 
  caja_numero, 
  descripcion_egreso, 
  total,
  fecha_egreso 
FROM tbl_egresos_super 
WHERE descripcion_egreso LIKE '%Usuario%Caja%'
ORDER BY id DESC 
LIMIT 2;
```

#### **Resultado Esperado:**
- ✅ Registro 1: `caja_numero = 1`, descripción contiene "Usuario A"
- ✅ Registro 2: `caja_numero = 2`, descripción contiene "Usuario B"
- ✅ Ambos registros creados sin conflictos

---

### **Test 8: Cambio de Caja**

#### **Pasos:**
1. Usuario con turno activo en **Caja 1**
2. Crear un egreso: "Registro en Caja 1"
3. **Finalizar turno**
4. **Iniciar nuevo turno** en **Caja 2**
5. Crear otro egreso: "Registro en Caja 2"

#### **Verificación SQL:**
```sql
SELECT 
  id, 
  usuario_id, 
  caja_numero, 
  descripcion_egreso,
  fecha_egreso 
FROM tbl_egresos_super 
WHERE descripcion_egreso LIKE '%Registro en Caja%'
ORDER BY id DESC 
LIMIT 2;
```

#### **Resultado Esperado:**
- ✅ Registro 1: `caja_numero = 1`, descripción = "Registro en Caja 1"
- ✅ Registro 2: `caja_numero = 2`, descripción = "Registro en Caja 2"
- ✅ Mismo usuario, diferentes cajas según el turno

---

### **Test 9: Usuario sin Turno Activo**

#### **Pasos:**
1. Usuario **sin turno activo** (o con turno finalizado)
2. Intentar crear un registro (puede requerir bypass de validación)

#### **Verificación SQL:**
```sql
SELECT id, usuario_id, caja_numero, descripcion_egreso 
FROM tbl_egresos_super 
WHERE usuario_id = [ID_USUARIO_SIN_TURNO]
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = NULL` (esperado, no hay turno activo)
- ⚠️ O el frontend debería prevenir la creación

---

### **Test 10: Operación de Agentes (Control)**

#### **Pasos:**
1. Login como usuario de Agentes
2. Iniciar turno de **Agentes** (no selecciona caja)
3. Realizar operaciones de agentes

#### **Verificación SQL:**
```sql
SELECT id, usuario_id, caja_numero, operacion_tipo, fecha 
FROM tbl_usuarios_turnos 
WHERE usuario_id = [ID_USUARIO_AGENTE]
ORDER BY id DESC 
LIMIT 1;
```

#### **Resultado Esperado:**
- ✅ `caja_numero = NULL` (Agentes no usa cajas)
- ✅ `operacion_tipo = 'agente'`

---

## 📊 Query de Verificación General

### **Resumen de Registros por Caja:**

```sql
-- Ver distribución de registros por caja en todas las tablas
SELECT 
  'Egresos Super' as tabla,
  caja_numero,
  COUNT(*) as total_registros,
  MIN(fecha_egreso) as primer_registro,
  MAX(fecha_egreso) as ultimo_registro
FROM tbl_egresos_super
GROUP BY caja_numero

UNION ALL

SELECT 
  'Cierres Super',
  caja_numero,
  COUNT(*),
  MIN(fecha_cierre::date),
  MAX(fecha_cierre::date)
FROM tbl_cierres_super
GROUP BY caja_numero

UNION ALL

SELECT 
  'Conteo Billetes',
  caja_numero,
  COUNT(*),
  MIN(fecha::date),
  MAX(fecha::date)
FROM tbl_conteo_billetes_super
GROUP BY caja_numero

UNION ALL

SELECT 
  'Flujos Saldo',
  caja_numero,
  COUNT(*),
  MIN(fecha::date),
  MAX(fecha::date)
FROM tbl_flujos_saldo
GROUP BY caja_numero

UNION ALL

SELECT 
  'Ventas Saldo',
  caja_numero,
  COUNT(*),
  MIN(fecha::date),
  MAX(fecha::date)
FROM tbl_ventas_saldo
GROUP BY caja_numero

UNION ALL

SELECT 
  'Adicionales/Préstamos',
  caja_numero,
  COUNT(*),
  MIN(fecha::date),
  MAX(fecha::date)
FROM tbl_adic_prest
GROUP BY caja_numero

ORDER BY tabla, caja_numero NULLS LAST;
```

---

## ✅ Checklist de Verificación

### **Funcionalidad:**
- [ ] Test 1: Egreso con caja_numero correcto
- [ ] Test 2: Conteo de billetes con caja_numero correcto
- [ ] Test 3: Flujo de saldo con caja_numero correcto
- [ ] Test 4: Venta de saldo con caja_numero correcto
- [ ] Test 5: Adicional/Préstamo con caja_numero correcto
- [ ] Test 6: Cierre con caja_numero correcto
- [ ] Test 7: Múltiples cajas simultáneas funcionan
- [ ] Test 8: Cambio de caja actualiza correctamente
- [ ] Test 9: Usuario sin turno maneja correctamente
- [ ] Test 10: Operación de agentes no afecta

### **Logs del Backend:**
- [ ] Ver logs de consola: `[ServiceName] Caja del turno activo: X`
- [ ] Sin errores de TypeORM o inyección de dependencias
- [ ] Queries SQL ejecutándose correctamente

### **Base de Datos:**
- [ ] Todos los registros nuevos tienen `caja_numero` asignado
- [ ] Registros antiguos conservan `caja_numero = NULL`
- [ ] No hay errores de constraint o foreign key

---

## 🚨 Troubleshooting

### **Problema: caja_numero sigue siendo NULL**

#### **Posibles causas:**

1. **El turno no está activo:**
```sql
-- Verificar turno del usuario
SELECT id, usuario_id, operacion_tipo, caja_numero, activo 
FROM tbl_usuarios_turnos 
WHERE usuario_id = [ID_USUARIO] AND activo = true;
```

2. **El controller no pasa userId:**
   - Verificar que el controller pase `req.user.id` al servicio
   - Revisar logs del backend

3. **Error en la query del turno:**
   - Verificar logs: `[ServiceName] Caja del turno activo: null`
   - Revisar que la tabla `tbl_usuarios_turnos` tenga el campo `caja_numero`

4. **Caché del frontend:**
   - Hacer hard refresh: `Ctrl + Shift + R`
   - Limpiar localStorage del navegador

#### **Soluciones:**

```sql
-- Verificar estructura de tabla
\d tbl_egresos_super

-- Verificar que exista columna caja_numero
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tbl_egresos_super' AND column_name = 'caja_numero';

-- Ver turno activo actual
SELECT * FROM tbl_usuarios_turnos WHERE activo = true;
```

---

## 📝 Reporte de Pruebas

### **Plantilla:**

```
Fecha: _________________
Probado por: _________________

RESULTADOS:

✅ Test 1: Egreso de Super - PASÓ
✅ Test 2: Conteo de Billetes - PASÓ
✅ Test 3: Flujo de Saldo - PASÓ
✅ Test 4: Venta de Saldo - PASÓ
✅ Test 5: Adicional/Préstamo - PASÓ
✅ Test 6: Cierre de Super - PASÓ
✅ Test 7: Múltiples Cajas - PASÓ
✅ Test 8: Cambio de Caja - PASÓ
✅ Test 9: Sin Turno Activo - PASÓ
✅ Test 10: Operación Agentes - PASÓ

OBSERVACIONES:
_________________________________
_________________________________

ESTADO FINAL: ✅ APROBADO / ❌ RECHAZADO
```

---

## 🎉 Criterio de Aceptación

La implementación se considera **EXITOSA** si:

✅ **Todos los tests (1-10) pasan**  
✅ **Logs del backend muestran caja_numero correcto**  
✅ **Base de datos tiene registros con caja_numero asignado**  
✅ **Múltiples usuarios en diferentes cajas funcionan sin conflictos**  
✅ **Cambio de caja funciona correctamente**  
✅ **Backend compila y ejecuta sin errores**

---

## 🚀 Comando para Iniciar Pruebas

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend (si aplica)
cd frontend
npm run dev

# Navegador
http://localhost:3000
```

---

**¡Listo para comenzar las pruebas!** 🧪
