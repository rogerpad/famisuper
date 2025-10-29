# 🔧 Comandos Útiles - FamiSuper Backend

---

## 🚀 **Iniciar/Reiniciar Backend**

### **Problema: Puerto 4002 ya en uso**

Si obtienes el error: `EADDRINUSE: address already in use :::4002`

**Solución rápida:**

```bash
# 1. Ver qué proceso usa el puerto
netstat -ano | findstr :4002

# 2. Matar el proceso (reemplaza XXXX con el PID)
taskkill /PID XXXX /F

# 3. Iniciar backend
cd backend
npm run start:dev
```

### **Usando el Script Automático:**

Simplemente ejecuta:
```bash
reiniciar_backend.bat
```

Este script:
1. ✅ Encuentra automáticamente el proceso en puerto 4002
2. ✅ Lo detiene
3. ✅ Inicia el backend en una nueva ventana

---

## 📊 **Comandos de Migraciones**

### **Ver migraciones:**
```bash
cd backend
npm run typeorm -- migration:show
```

### **Ejecutar migraciones pendientes:**
```bash
cd backend
npm run migration:run
```

### **Revertir última migración:**
```bash
cd backend
npm run migration:revert
```

### **Crear nueva migración:**
```bash
cd backend
npm run typeorm -- migration:create src/database/migrations/NombreDeLaMigracion
```

---

## 🔍 **Verificar Estado del Backend**

### **Ver logs en tiempo real:**
El backend debe mostrar:
```
[NestFactory] Starting Nest application...
[InstanceLoader] AppModule dependencies initialized
[InstanceLoader] TypeOrmModule dependencies initialized
...
[NestApplication] Nest application successfully started
[NestApplication] 🚀 Application is running on: http://localhost:4002
```

### **Verificar que el puerto está libre:**
```bash
netstat -ano | findstr :4002
```

**Si está vacío** = Puerto libre ✅  
**Si muestra resultados** = Puerto ocupado ⚠️

### **Ver todos los procesos de Node:**
```bash
tasklist | findstr node
```

---

## 🗄️ **Comandos de Base de Datos**

### **Conectar a PostgreSQL:**
```bash
psql -U postgres -d famisuper
```

### **Ver tablas:**
```sql
\dt
```

### **Ver estructura de una tabla:**
```sql
\d tbl_cierres_super
```

### **Salir de psql:**
```sql
\q
```

---

## 🧪 **Pruebas Rápidas**

### **Test 1: Verificar Foreign Keys**
```sql
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (kcu.column_name = 'cierre_id' OR kcu.column_name = 'turno_id')
ORDER BY tc.table_name;
```

### **Test 2: Ver último cierre con turno**
```sql
SELECT 
  c.id as cierre_id,
  c.turno_id,
  c.caja_numero,
  t.fecha_inicio,
  u.nombre
FROM tbl_cierres_super c
LEFT JOIN tbl_usuarios_turnos t ON c.turno_id = t.id
LEFT JOIN tbl_usuarios u ON t.usuario_id = u.id
ORDER BY c.id DESC
LIMIT 1;
```

### **Test 3: Registros pendientes de cerrar**
```sql
SELECT 
  'Egresos' as tabla,
  COUNT(*) as pendientes
FROM tbl_egresos_super
WHERE caja_numero = 1 AND cierre_id IS NULL

UNION ALL

SELECT 'Flujos', COUNT(*)
FROM tbl_flujos_saldo
WHERE caja_numero = 1 AND cierre_id IS NULL

UNION ALL

SELECT 'Ventas', COUNT(*)
FROM tbl_ventas_saldo
WHERE caja_numero = 1 AND cierre_id IS NULL;
```

---

## 🛠️ **Compilación**

### **Compilar backend:**
```bash
cd backend
npm run build
```

### **Limpiar node_modules y reinstalar:**
```bash
cd backend
rmdir /s /q node_modules
npm install
```

---

## 📝 **Logs y Debugging**

### **Ver logs del backend:**
Los logs aparecen en la consola donde ejecutaste `npm run start:dev`

### **Logs importantes a buscar:**

**✅ Inicio exitoso:**
```
[NestApplication] 🚀 Application is running on: http://localhost:4002
```

**✅ Turno activo:**
```
[SuperClosingsService] Datos del turno activo:
  - Turno ID: 123
  - Caja: 1
```

**✅ Cierre creado:**
```
[SuperClosingsService] ✅ Cierre creado con ID: 42 (Turno: 123)
```

**✅ Registros asociados:**
```
[SuperClosingsService] 🔄 Asociando registros al cierre 42...
  ✅ tbl_egresos_super: 3 registros asociados
```

---

## 🔥 **Problemas Comunes**

### **1. Puerto en uso**
**Error:** `EADDRINUSE: address already in use :::4002`

**Solución:**
```bash
netstat -ano | findstr :4002
taskkill /PID XXXX /F
```

### **2. Error de conexión a BD**
**Error:** `Connection refused` o `password authentication failed`

**Solución:**
- Verificar que PostgreSQL esté corriendo
- Revisar credenciales en `.env`
- Verificar puerto de PostgreSQL (5432)

### **3. Migraciones pendientes**
**Error:** `Migrations are pending`

**Solución:**
```bash
npm run migration:run
```

### **4. Dependencias desactualizadas**
**Error:** Varios errores de módulos no encontrados

**Solución:**
```bash
npm install
```

---

## 📞 **Referencia Rápida**

| Acción | Comando |
|--------|---------|
| Iniciar backend | `npm run start:dev` |
| Compilar | `npm run build` |
| Ejecutar migraciones | `npm run migration:run` |
| Ver migraciones | `npm run migration:show` |
| Matar proceso puerto 4002 | `taskkill /PID XXXX /F` |
| Ver puerto 4002 | `netstat -ano \| findstr :4002` |
| Conectar a BD | `psql -U postgres -d famisuper` |
| Ver tablas | `\dt` en psql |

---

## 🎯 **Workflow Típico**

```bash
# 1. Abrir terminal en carpeta del proyecto
cd C:\Users\Roger\Documents\famisuper

# 2. Si necesitas, detener backend anterior
netstat -ano | findstr :4002
taskkill /PID XXXX /F

# 3. Iniciar backend
cd backend
npm run start:dev

# 4. En otra terminal, conectar a BD (si necesitas)
psql -U postgres -d famisuper

# 5. Ejecutar queries de verificación
-- Copiar de verificar_cierre_id.sql o queries_turno_cierre.sql
```

---

**Fecha:** 25 de Octubre, 2024  
**Versión:** 1.0.0
