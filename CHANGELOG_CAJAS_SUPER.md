# 📦 Implementación: Múltiples Cajas para Operación de Super

**Rama:** `adicion_caja`  
**Fecha:** 25 de Octubre, 2025  
**Feature:** Permitir que la operación de Super se ejecute en dos cajas independientes simultáneamente

---

## 🎯 Objetivo

Implementar la funcionalidad para que dos usuarios puedan operar simultáneamente en la operación de Super, cada uno en una caja diferente (Caja 1 y Caja 2), con flujos de transacciones y saldos independientes.

---

## 📋 Cambios Realizados

### **Backend**

#### **Archivos Nuevos**

1. **`backend/src/config/cajas.config.ts`**
   - Configuración centralizada de cajas disponibles
   - Para agregar más cajas, solo modificar el array `CAJAS_SUPER_NUMEROS`
   
   ```typescript
   export const CAJAS_SUPER_NUMEROS = [1, 2]; // Cajas disponibles
   ```

2. **Migraciones de Base de Datos**
   - `backend/src/database/migrations/1729860000000-AddCajaNumeroToUsuariosTurnos.ts`
     - Agrega columna `caja_numero` a `tbl_usuarios_turnos`
   
   - `backend/src/database/migrations/1729860100000-AddCajaNumeroToSuperTables.ts`
     - Agrega columna `caja_numero` a todas las tablas relacionadas con Super:
       - `tbl_cierres_super`
       - `tbl_super_expenses`
       - `tbl_super_bill_count`
       - `tbl_balance_flows`
       - `tbl_balance_sales`
       - `tbl_additional_loans`

#### **Archivos Modificados**

1. **Entidades**
   - `backend/src/modules/turnos/entities/usuario-turno.entity.ts`
     - Campo `cajaNumero: number` agregado
   
   - `backend/src/modules/super-closings/entities/super-closing.entity.ts`
     - Campo `cajaNumero: number` agregado

2. **DTOs**
   - `backend/src/modules/turnos/dto/iniciar-turno.dto.ts`
     - Campo `cajaNumero?: number` agregado

3. **Servicios**
   - `backend/src/modules/turnos/usuarios-turnos.service.ts`
     - Validación de disponibilidad de caja específica
     - Asignación de `cajaNumero` al iniciar turno
     - Limpieza de `cajaNumero` al finalizar turno (libera la caja)
     - Método `getOperacionesEnUso()` ahora retorna información dinámica de cajas

### **Frontend**

#### **Archivos Modificados**

1. **API Client**
   - `frontend/src/api/turnos/turnosApi.ts`
     - Interface `UsuarioTurno` incluye `cajaNumero`
     - Interface `OperationType` incluye `cajaNumero`
     - Método `getOperacionesEnUso()` retorna array de cajas
     - Método `iniciarTurnoVendedor()` acepta `cajaNumero` en `operationType`

2. **Componente de Diálogo**
   - `frontend/src/components/turnos/OperationTypeDialog.tsx`
     - **Rediseño completo** con flujo de dos pasos:
       - **Paso 1:** Seleccionar tipo de operación (Agente/Super)
       - **Paso 2:** Si es Super, seleccionar caja (1, 2, ...)
     - Validación en tiempo real de disponibilidad
     - UI muestra qué usuario está usando cada caja
     - Botón "Atrás" para regresar al paso anterior

---

## 🗄️ Esquema de Base de Datos

### **Campo `caja_numero`**

**Tipo:** `INTEGER`  
**Nullable:** `true`  
**Valores:**
- `NULL` - Sin caja asignada (turno inactivo o operación de agentes)
- `1` - Caja Super 1
- `2` - Caja Super 2
- `3+` - Cajas futuras

### **Tablas Afectadas**
```sql
-- Tabla principal de turnos de usuario
tbl_usuarios_turnos (caja_numero)

-- Tablas de operación Super
tbl_cierres_super (caja_numero)
tbl_super_expenses (caja_numero)
tbl_super_bill_count (caja_numero)
tbl_balance_flows (caja_numero)
tbl_balance_sales (caja_numero)
tbl_additional_loans (caja_numero)
```

---

## 🚀 Instrucciones de Despliegue

### **1. Ejecutar Migraciones**

```bash
# Posicionarse en el directorio del backend
cd backend

# Ejecutar migraciones
npm run migration:run
```

**Verificar que las migraciones se ejecuten correctamente:**
```bash
# Deberías ver algo como:
# ✅ Columna caja_numero agregada a tbl_usuarios_turnos
# ✅ Columna caja_numero agregada a tbl_cierres_super
# ... etc
```

### **2. Rollback (si es necesario)**

Si algo sale mal, puedes revertir las migraciones:

```bash
npm run migration:revert
npm run migration:revert
```

### **3. Reiniciar Servicios**

```bash
# Backend
cd backend
npm run start:dev

# Frontend (en otra terminal)
cd frontend
npm start
```

---

## 🧪 Pruebas Sugeridas

### **Caso 1: Usuario inicia turno en Caja 1**
1. Usuario A inicia sesión
2. Selecciona iniciar turno
3. Elige "Operación de Super"
4. Selecciona "Caja Super 1"
5. ✅ Turno debe iniciarse correctamente con `caja_numero = 1`

### **Caso 2: Otro usuario intenta usar Caja 1**
1. Usuario B inicia sesión (mientras A está en Caja 1)
2. Selecciona iniciar turno
3. Elige "Operación de Super"
4. ❌ "Caja Super 1" debe aparecer como "En uso por Usuario A"
5. ✅ Solo "Caja Super 2" debe estar disponible

### **Caso 3: Ambas cajas en uso**
1. Usuario A en Caja 1
2. Usuario B en Caja 2
3. Usuario C intenta iniciar turno
4. ❌ Ambas cajas deben aparecer ocupadas
5. ❌ No debe poder iniciar turno de Super

### **Caso 4: Finalizar turno libera la caja**
1. Usuario A finaliza turno en Caja 1
2. ✅ `caja_numero` debe ser `NULL` en base de datos
3. ✅ Usuario C ahora puede seleccionar Caja 1

### **Caso 5: Operación de Agentes (sin caja)**
1. Usuario selecciona "Operación de Agentes"
2. ✅ No debe mostrar selección de caja
3. ✅ Confirma directamente
4. ✅ `caja_numero` debe ser `NULL`

---

## 📊 Queries de Verificación

### **Ver turnos activos con cajas**
```sql
SELECT 
  ut.id,
  u.nombre || ' ' || u.apellido as usuario,
  t.nombre as turno,
  ut.caja_numero,
  ut.activo,
  ut.hora_inicio_real
FROM tbl_usuarios_turnos ut
JOIN tbl_usuarios u ON ut.usuario_id = u.id
JOIN tbl_turnos t ON ut.turno_id = t.id
WHERE ut.activo = true;
```

### **Ver cajas disponibles**
```sql
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM tbl_usuarios_turnos 
      WHERE activo = true AND caja_numero = 1
    ) THEN 'En uso'
    ELSE 'Disponible'
  END as caja_1,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM tbl_usuarios_turnos 
      WHERE activo = true AND caja_numero = 2
    ) THEN 'En uso'
    ELSE 'Disponible'
  END as caja_2;
```

---

## 🔮 Escalabilidad: Agregar Caja 3

**Es muy simple, solo un cambio:**

```typescript
// backend/src/config/cajas.config.ts
export const CAJAS_SUPER_NUMEROS = [1, 2, 3]; // ← Agregar 3
```

**Todo lo demás funciona automáticamente:**
- ✅ Backend genera la configuración dinámica
- ✅ Frontend muestra las 3 cajas
- ✅ Validaciones funcionan para 3 cajas
- ✅ No se necesitan cambios en UI o BD

---

## 🐛 Troubleshooting

### **Error: "La caja ya está en uso"**
**Causa:** Otro usuario ya inició turno en esa caja  
**Solución:** Seleccionar otra caja o esperar a que se libere

### **Error: "Debe seleccionar una caja"**
**Causa:** Intento de iniciar Super sin seleccionar caja  
**Solución:** Esto no debería pasar (botón deshabilitado), revisar código

### **Caja no se libera al finalizar turno**
**Causa:** Error en la lógica de finalización  
**Verificar:**
```sql
SELECT * FROM tbl_usuarios_turnos 
WHERE usuario_id = ? AND activo = false 
ORDER BY id DESC LIMIT 1;
-- caja_numero debe ser NULL
```

### **Migraciones no se ejecutan**
**Verificar:**
1. Conexión a base de datos correcta
2. Usuario tiene permisos para `ALTER TABLE`
3. Revisar logs de migración

---

## 📝 Notas Importantes

1. **No hay constraint CHECK en `caja_numero`**
   - Esto permite agregar cajas sin modificar BD
   - Validación se hace a nivel de aplicación

2. **NULL es el valor por defecto**
   - Turno inactivo = `NULL`
   - Operación Agentes = `NULL`
   - Solo Super asignado tiene número de caja

3. **Cleanup automático**
   - Al finalizar turno, `cajaNumero` se limpia automáticamente
   - No hay registros "huérfanos" con caja asignada

4. **Queries deben filtrar por caja**
   - Todos los queries de Super deben incluir `WHERE caja_numero = ?`
   - Esto asegura separación de datos entre cajas

---

## ✅ Checklist de Implementación

- [x] Archivo de configuración creado
- [x] Migraciones creadas
- [x] Entidades actualizadas
- [x] DTOs actualizados
- [x] Servicios actualizados con validaciones
- [x] API client actualizado
- [x] Componente UI rediseñado
- [ ] Migraciones ejecutadas en base de datos
- [ ] Pruebas manuales realizadas
- [ ] Documentación revisada
- [ ] Merge a rama principal

---

## 🤝 Contribuidores

- Implementación: Cascade AI Assistant
- Solicitud: Roger (Usuario)
- Fecha: 25 de Octubre, 2025

---

## 📞 Soporte

Si encuentras algún problema con esta implementación, revisa:
1. Este documento de CHANGELOG
2. Los logs de la aplicación
3. Las queries de verificación en la sección de Troubleshooting
