export class IniciarTurnoDto {
  // Podemos incluir campos adicionales si es necesario
  // Por ejemplo, si queremos permitir iniciar con una hora específica en lugar de la actual
  horaInicio?: string;
  
  // Número de caja para operación de Super (1, 2, etc.)
  cajaNumero?: number;
}
