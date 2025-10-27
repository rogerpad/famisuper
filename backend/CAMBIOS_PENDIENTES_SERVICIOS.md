# 🔧 Cambios Pendientes para 3 Servicios Restantes

## ✅ Servicios Ya Actualizados (3/6):
1. ✅ SuperExpensesService
2. ✅ SuperClosingsService  
3. ✅ SuperBillCountService

## ⏳ Servicios Pendientes (3/6):

---

### **4. BalanceFlowsService**

**Archivo Servicio:** `src/modules/balance-flows/balance-flows.service.ts`

```typescript
// AGREGAR AL INICIO (después de los otros imports)
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// MODIFICAR CONSTRUCTOR
constructor(
  @InjectRepository(BalanceFlow)
  private balanceFlowRepository: Repository<BalanceFlow>,
  @InjectRepository(UsuarioTurno)  // ← AGREGAR
  private usuarioTurnoRepository: Repository<UsuarioTurno>,  // ← AGREGAR
) {}

// MODIFICAR MÉTODO CREATE (agregar al inicio del método)
async create(createBalanceFlowDto: CreateBalanceFlowDto, userId: number): Promise<BalanceFlow> {
  // AGREGAR ESTAS LÍNEAS AL INICIO:
  const turnoActivo = await this.usuarioTurnoRepository.findOne({
    where: { usuarioId: userId, activo: true }
  });
  const cajaNumero = turnoActivo?.cajaNumero || null;
  console.log('[BalanceFlowsService] Caja del turno activo:', cajaNumero);
  
  // AL CREAR EL REGISTRO, AGREGAR cajaNumero:
  const balanceFlow = this.balanceFlowRepository.create({
    ...createBalanceFlowDto,
    cajaNumero  // ← AGREGAR
  });
  
  return await this.balanceFlowRepository.save(balanceFlow);
}
```

**Archivo Módulo:** `src/modules/balance-flows/balance-flows.module.ts`

```typescript
// AGREGAR IMPORT
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// MODIFICAR imports
TypeOrmModule.forFeature([BalanceFlow, UsuarioTurno]),  // ← Agregar UsuarioTurno
```

---

### **5. BalanceSalesService**

**Archivo Servicio:** `src/modules/balance-sales/balance-sales.service.ts`

```typescript
// AGREGAR AL INICIO (después de los otros imports)
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// MODIFICAR CONSTRUCTOR
constructor(
  @InjectRepository(BalanceSale)
  private balanceSaleRepository: Repository<BalanceSale>,
  @InjectRepository(UsuarioTurno)  // ← AGREGAR
  private usuarioTurnoRepository: Repository<UsuarioTurno>,  // ← AGREGAR
) {}

// MODIFICAR MÉTODO CREATE
async create(createBalanceSaleDto: CreateBalanceSaleDto, userId: number): Promise<BalanceSale> {
  // AGREGAR AL INICIO:
  const turnoActivo = await this.usuarioTurnoRepository.findOne({
    where: { usuarioId: userId, activo: true }
  });
  const cajaNumero = turnoActivo?.cajaNumero || null;
  console.log('[BalanceSalesService] Caja del turno activo:', cajaNumero);
  
  // AL CREAR:
  const balanceSale = this.balanceSaleRepository.create({
    ...createBalanceSaleDto,
    cajaNumero  // ← AGREGAR
  });
  
  return await this.balanceSaleRepository.save(balanceSale);
}
```

**Archivo Módulo:** `src/modules/balance-sales/balance-sales.module.ts`

```typescript
// AGREGAR IMPORT
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// MODIFICAR imports
TypeOrmModule.forFeature([BalanceSale, UsuarioTurno]),  // ← Agregar UsuarioTurno
```

---

### **6. AdditionalLoanService**

**Archivo Servicio:** `src/modules/additional-loan/additional-loan.service.ts`

```typescript
// AGREGAR AL INICIO (después de los otros imports)
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// MODIFICAR CONSTRUCTOR
constructor(
  @InjectRepository(AdditionalLoan)
  private additionalLoanRepository: Repository<AdditionalLoan>,
  @InjectRepository(UsuarioTurno)  // ← AGREGAR
  private usuarioTurnoRepository: Repository<UsuarioTurno>,  // ← AGREGAR
) {}

// MODIFICAR MÉTODO CREATE
async create(createAdditionalLoanDto: CreateAdditionalLoanDto, userId: number): Promise<AdditionalLoan> {
  // AGREGAR AL INICIO:
  const turnoActivo = await this.usuarioTurnoRepository.findOne({
    where: { usuarioId: userId, activo: true }
  });
  const cajaNumero = turnoActivo?.cajaNumero || null;
  console.log('[AdditionalLoanService] Caja del turno activo:', cajaNumero);
  
  // AL CREAR:
  const additionalLoan = this.additionalLoanRepository.create({
    ...createAdditionalLoanDto,
    cajaNumero  // ← AGREGAR
  });
  
  return await this.additionalLoanRepository.save(additionalLoan);
}
```

**Archivo Módulo:** `src/modules/additional-loan/additional-loan.module.ts`

```typescript
// AGREGAR IMPORT
import { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';

// MODIFICAR imports
TypeOrmModule.forFeature([AdditionalLoan, UsuarioTurno]),  // ← Agregar UsuarioTurno
```

---

## 🚀 Después de Hacer los Cambios:

### 1. Compilar
```bash
cd backend
npm run build
```

### 2. Reiniciar Backend
```bash
npm run start:dev
```

### 3. Probar
- Iniciar turno en Caja 1
- Crear un flujo/venta/adicional
- Verificar en BD que tenga `caja_numero = 1`

### 4. Query SQL
```sql
SELECT * FROM tbl_flujos_saldo ORDER BY id DESC LIMIT 3;
SELECT * FROM tbl_ventas_saldo ORDER BY id DESC LIMIT 3;
SELECT * FROM tbl_adic_prest ORDER BY id DESC LIMIT 3;
```

---

## ✅ Checklist Final:
- [x] SuperExpensesService
- [x] SuperClosingsService
- [x] SuperBillCountService
- [ ] BalanceFlowsService (manual)
- [ ] BalanceSalesService (manual)
- [ ] AdditionalLoanService (manual)

**Nota:** Estos 3 servicios deben actualizarse manualmente. Los cambios son simples y siguen el mismo patrón.

¿Quieres que los actualice automáticamente?
