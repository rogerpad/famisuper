import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Obtener la respuesta original de la excepción
    const exceptionResponse = exception.getResponse();
    
    // Formatear la respuesta para mostrar detalles de validación
    let responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Si es un error de validación, mostrar detalles específicos
    if (status === HttpStatus.BAD_REQUEST && typeof exceptionResponse === 'object') {
      const errorResponse = exceptionResponse as any;
      
      if (errorResponse.message && Array.isArray(errorResponse.message)) {
        // Formatear los mensajes de error de validación para que sean más legibles
        responseBody.errors = this.formatValidationErrors(errorResponse.message);
        responseBody.message = 'Error de validación';
        
        // Agregar detalles adicionales para depuración
        responseBody.details = errorResponse;
        
        // Registrar en la consola para depuración
        console.error('Validation error details:', JSON.stringify(responseBody, null, 2));
      } else {
        responseBody.message = errorResponse.message || 'Bad Request';
      }
    } else {
      responseBody.message = exception.message || 'Internal Server Error';
    }

    response
      .status(status)
      .json(responseBody);
  }

  private formatValidationErrors(errors: any[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
    errors.forEach((error) => {
      if (typeof error === 'string') {
        // Si es un mensaje de error simple
        if (!result['general']) {
          result['general'] = [];
        }
        result['general'].push(error);
      } else if (error.property) {
        // Si es un error de validación de class-validator
        const property = error.property;
        if (!result[property]) {
          result[property] = [];
        }
        
        // Agregar mensajes de error para esta propiedad
        if (error.constraints) {
          Object.values(error.constraints).forEach((constraint: any) => {
            result[property].push(constraint);
          });
        }
        
        // Manejar errores anidados
        if (error.children && error.children.length > 0) {
          this.processNestedValidationErrors(result, error.children, property);
        }
      }
    });
    
    return result;
  }

  private processNestedValidationErrors(
    result: Record<string, string[]>,
    errors: ValidationError[],
    parentProperty: string,
  ): void {
    errors.forEach((error) => {
      const property = `${parentProperty}.${error.property}`;
      
      if (!result[property]) {
        result[property] = [];
      }
      
      if (error.constraints) {
        Object.values(error.constraints).forEach((constraint: any) => {
          result[property].push(constraint);
        });
      }
      
      if (error.children && error.children.length > 0) {
        this.processNestedValidationErrors(result, error.children, property);
      }
    });
  }
}
