-- Script para marcar las migraciones antiguas como ya ejecutadas
-- Esto permite ejecutar solo las nuevas migraciones de caja_numero

INSERT INTO migrations (timestamp, name) VALUES
  (1686536584000, 'ReorderAndAddTurnoIdToAgentClosings1686536584000'),
  (1717979200000, 'AddSumaTotalToFormulaConfig1717979200000'),
  (1718586000000, 'AddCodigoToPermisos1718586000000'),
  (1720000000000, 'AddTurnosPermisosToVendedor1720000000000'),
  (1720100000000, 'CreateRegistroActividadTable1720100000000'),
  (1720200000000, 'AddReiniciarTurnosPermisoToVendedor1720200000000'),
  (1721234000000, 'AddCashCounterPermission1721234000000'),
  (1721500000000, 'InsertInitialBilletes1721500000000'),
  (1721600000000, 'CreateConteoBilletesTable1721600000000'),
  (1723652870000, 'CreateTipoEgresosTable1723652870000')
ON CONFLICT (timestamp) DO NOTHING;
