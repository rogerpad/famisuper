-- Script para insertar un registro de prueba en la tabla tbl_egresos_super
INSERT INTO tbl_egresos_super (
  usuario_id,
  tipo_egreso_id,
  descripcion_egreso,
  documento_pago_id,
  nro_factura,
  excento,
  gravado,
  impuesto,
  total,
  forma_pago_id,
  fecha_egreso,
  activo
) VALUES (
  1, -- usuario_id (asegúrate de que este ID exista en la tabla de usuarios)
  1, -- tipo_egreso_id (asegúrate de que este ID exista en la tabla de tipos de egresos)
  'Egreso de prueba', -- descripcion_egreso
  NULL, -- documento_pago_id (puede ser NULL)
  '12345', -- nro_factura
  100.00, -- excento
  200.00, -- gravado
  30.00, -- impuesto
  330.00, -- total
  1, -- forma_pago_id (asegúrate de que este ID exista en la tabla de formas de pago)
  CURRENT_DATE, -- fecha_egreso
  TRUE -- activo
);

-- Consulta para verificar si se insertó correctamente
SELECT * FROM tbl_egresos_super ORDER BY id DESC LIMIT 1;
