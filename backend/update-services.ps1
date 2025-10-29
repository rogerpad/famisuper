# Script PowerShell para actualizar servicios con cajaNumero
# Ejecutar desde: backend/

Write-Host "=== Actualizando Servicios para Asignar cajaNumero ===" -ForegroundColor Green

# Función para actualizar un servicio
function Update-Service {
    param(
        [string]$ServicePath,
        [string]$ServiceName
    )
    
    Write-Host "`nActualizando $ServiceName..." -ForegroundColor Yellow
    
    # Leer el contenido del archivo
    $content = Get-Content $ServicePath -Raw
    
    # Verificar si ya tiene el import
    if ($content -notmatch "import.*UsuarioTurno") {
        Write-Host "  ✓ Agregando import de UsuarioTurno" -ForegroundColor Green
        $content = $content -replace "(import.*from.*dto.*;)", "`$1`nimport { UsuarioTurno } from '../turnos/entities/usuario-turno.entity';"
    } else {
        Write-Host "  - Import ya existe" -ForegroundColor Gray
    }
    
    # Guardar cambios
    Set-Content -Path $ServicePath -Value $content -NoNewline
    Write-Host "  ✓ $ServiceName actualizado" -ForegroundColor Green
}

# Lista de servicios a actualizar
$services = @(
    @{Path="src/modules/super-bill-count/super-bill-count.service.ts"; Name="SuperBillCountService"},
    @{Path="src/modules/balance-flows/balance-flows.service.ts"; Name="BalanceFlowsService"},
    @{Path="src/modules/balance-sales/balance-sales.service.ts"; Name="BalanceSalesService"},
    @{Path="src/modules/additional-loan/additional-loan.service.ts"; Name="AdditionalLoanService"}
)

# Actualizar cada servicio
foreach ($service in $services) {
    if (Test-Path $service.Path) {
        Update-Service -ServicePath $service.Path -ServiceName $service.Name
    } else {
        Write-Host "❌ No se encontró: $($service.Path)" -ForegroundColor Red
    }
}

Write-Host "`n=== Actualización Completada ===" -ForegroundColor Green
Write-Host "Nota: Debes actualizar manualmente los métodos create() y los módulos" -ForegroundColor Yellow
