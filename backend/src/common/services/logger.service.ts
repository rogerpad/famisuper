import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logsDir: string;

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogsDirectoryExists();
  }

  private ensureLogsDirectoryExists(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  log(message: string, context?: string): void {
    this.writeLog('info', message, context);
    console.log(`[${context || 'Application'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string): void {
    this.writeLog('error', message, context, trace);
    console.error(`[${context || 'Application'}] ERROR: ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string): void {
    this.writeLog('warn', message, context);
    console.warn(`[${context || 'Application'}] WARN: ${message}`);
  }

  debug(message: string, context?: string): void {
    this.writeLog('debug', message, context);
    console.debug(`[${context || 'Application'}] DEBUG: ${message}`);
  }

  verbose(message: string, context?: string): void {
    this.writeLog('verbose', message, context);
    console.log(`[${context || 'Application'}] VERBOSE: ${message}`);
  }

  private writeLog(level: string, message: string, context?: string, trace?: string): void {
    const now = new Date();
    const logFileName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.log`;
    const logFilePath = path.join(this.logsDir, logFileName);
    
    const timestamp = now.toISOString();
    const logEntry = {
      timestamp,
      level,
      context: context || 'Application',
      message,
      ...(trace && { trace }),
    };

    const logLine = `${JSON.stringify(logEntry)}\n`;
    
    fs.appendFileSync(logFilePath, logLine);
  }

  // Método específico para registrar errores de validación de datos
  logValidationError(entityName: string, data: any, error: any): void {
    const errorDetails = {
      entity: entityName,
      data: this.sanitizeData(data),
      error: this.formatError(error),
      timestamp: new Date().toISOString(),
    };

    this.error(
      `Error de validación en ${entityName}`,
      JSON.stringify(errorDetails, null, 2),
      'Validation'
    );
  }

  // Método específico para registrar errores de base de datos
  logDatabaseError(entityName: string, operation: string, data: any, error: any): void {
    const errorDetails = {
      entity: entityName,
      operation,
      data: this.sanitizeData(data),
      error: this.formatError(error),
      timestamp: new Date().toISOString(),
    };

    this.error(
      `Error de base de datos en ${operation} de ${entityName}`,
      JSON.stringify(errorDetails, null, 2),
      'Database'
    );
  }

  // Sanitiza los datos para no registrar información sensible
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Eliminar campos sensibles si existen
    const sensitiveFields = ['password', 'contraseña', 'token', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }

  // Formatea el error para obtener información útil
  private formatError(error: any): any {
    if (!error) return 'Unknown error';
    
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    
    if (typeof error === 'object') {
      try {
        return JSON.parse(JSON.stringify(error));
      } catch (e) {
        return String(error);
      }
    }
    
    return String(error);
  }
}
