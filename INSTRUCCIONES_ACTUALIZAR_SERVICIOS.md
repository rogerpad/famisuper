# 🔧 Instrucciones para Actualizar Servicios - Asignación Automática de `cajaNumero`

## ✅ Servicio Ya Actualizado:
1. **SuperExpensesService** - Ya actualizado ✅

## ⏳ Servicios Pendientes:

### **1. SuperBillCountService**
**Archivo:** `backend/src/modules/super-bill-count/super-bill-count.service.ts`

**Cambios:**
1. Agregar import:
```typescript
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';
```

2. Inyectar en constructor:
```typescript
constructor(
  @InjectRepository(SuperBillCount)
  private superBillCountRepository: Repository<SuperBillCount>,
  @InjectRepository(UsuarioTurno)
  private usuarioTurnoRepository: Repository<UsuarioTurno>,
) {}
```

3. En método `create`, antes de crear el registro:
```typescript
// Obtener caja del turno activo
const turnoActivo = await this.usuarioTurnoRepository.findOne({
  where: { usuarioId: createDto.usuarioId, activo: true }
});
const cajaNumero = turnoActivo?.cajaNumero || null;

// Al crear el registro
const superBillCount = this.superBillCountRepository.create({
  ...createDto,
  cajaNumero  // Agregar esta línea
});
```

4. Actualizar módulo (`super-bill-count.module.ts`):
```typescript
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperBillCount, UsuarioTurno]),
    // ... resto
  ],
})
```

---

### **2. BalanceFlowsService**
**Archivo:** `backend/src/modules/balance-flows/balance-flows.service.ts`

**Cambios similares:**
1. Import
2. Inyectar en constructor
3. Obtener cajaNumero del turno
4. Asignarlo al crear
5. Actualizar módulo

---

### **3. BalanceSalesService**
**Archivo:** `backend/src/modules/balance-sales/balance-sales.service.ts`

**Cambios similares:**
1. Import
2. Inyectar en constructor
3. Obtener cajaNumero del turno
4. Asignarlo al crear
5. Actualizar módulo

---

### **4. AdditionalLoanService**
**Archivo:** `backend/src/modules/additional-loan/additional-loan.service.ts`

**Cambios similares:**
1. Import
2. Inyectar en constructor
3. Obtener cajaNumero del turno
4. Asignarlo al crear
5. Actualizar módulo

---

### **5. SuperClosingsService** (Si no estaba actualizado)
**Archivo:** `backend/src/modules/super-closings/super-closings.service.ts`

Ver si ya tiene la lógica o necesita actualización similar.

---

## 📝 Patrón General para Cualquier Servicio:

### **En el Servicio (.service.ts):**

```typescript
// 1. IMPORT
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// 2. CONSTRUCTOR
constructor(
  @InjectRepository(TuEntidad)
  private tuRepository: Repository<TuEntidad>,
  @InjectRepository(UsuarioTurno)
  private usuarioTurnoRepository: Repository<UsuarioTurno>,
) {}

// 3. MÉTODO CREATE
async create(dto: CreateDto, userId: number) {
  // Obtener turno activo
  const turnoActivo = await this.usuarioTurnoRepository.findOne({
    where: { usuarioId: userId, activo: true }
  });
  
  const cajaNumero = turnoActivo?.cajaNumero || null;
  console.log(`[${this.constructor.name}] Caja del turno: ${cajaNumero}`);
  
  // Crear registro con cajaNumero
  const entity = this.tuRepository.create({
    ...dto,
    usuarioId: userId,
    cajaNumero  // ← Agregar esta línea
  });
  
  return await this.tuRepository.save(entity);
}
```

### **En el Módulo (.module.ts):**

```typescript
// 1. IMPORT
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// 2. AGREGAR A forFeature
@Module({
  imports: [
    TypeOrmModule.forFeature([TuEntidad, UsuarioTurno]),  // ← Agregar UsuarioTurno
    // ... otros imports
  ],
  // ...
})
```

---

## 🎯 Objetivo:

Que cada vez que se cree un registro en estas tablas, automáticamente se asigne el `cajaNumero` del turno activo del usuario, para mantener la separación de datos por caja.

---

## ✅ Verificación:

Después de actualizar un servicio, verificar:

1. **Compilación:** `npm run build` sin errores
2. **Crear un registro:** Debería tener `caja_numero` en la BD
3. **Query SQL:**
```sql
-- Ver registros con caja_numero asignado
SELECT id, usuario_id, caja_numero, fecha 
FROM tbl_nombre_tabla 
ORDER BY id DESC 
LIMIT 10;
```

---

¿Quieres que actualice todos estos servicios automáticamente?
