const fs = require('fs');
const path = require('path');

/**
 * Script para reemplazar console.log con el logger apropiado
 * Uso: node scripts/replace-console-logs.js
 */

const BACKEND_SRC = path.join(__dirname, '..', 'backend', 'src');

function replaceConsoleLogsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Verificar si ya tiene el import del logger
    const hasLoggerImport = content.includes("import { LoggerService }") || 
                           content.includes("@Injectable()");

    // Reemplazar console.log con this.logger.log
    const consoleLogRegex = /console\.log\((.*?)\);?/g;
    const matches = content.match(consoleLogRegex);
    
    if (matches && matches.length > 0) {
      console.log(`Encontrados ${matches.length} console.log en: ${filePath}`);
      
      // Solo mostrar los primeros 3 para no saturar la salida
      matches.slice(0, 3).forEach(match => {
        console.log(`  - ${match}`);
      });
      
      if (matches.length > 3) {
        console.log(`  ... y ${matches.length - 3} más`);
      }
      
      // Si es un servicio de NestJS, usar this.logger
      if (content.includes('@Injectable()') && hasLoggerImport) {
        content = content.replace(consoleLogRegex, 'this.logger.log($1);');
        modified = true;
      }
      // Si es un controlador, también usar this.logger
      else if (content.includes('@Controller()')) {
        content = content.replace(consoleLogRegex, 'this.logger.log($1);');
        modified = true;
      }
      // Para otros archivos, crear una instancia del logger
      else {
        // Agregar import si no existe
        if (!hasLoggerImport) {
          const importStatement = "import { LoggerService } from '../common/services/logger.service';\n";
          content = importStatement + content;
        }
        
        // Reemplazar console.log
        content = content.replace(consoleLogRegex, 'new LoggerService().log($1);');
        modified = true;
      }
    }

    if (modified) {
      // Crear backup antes de modificar
      fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath));
      fs.writeFileSync(filePath, content);
      console.log(`✅ Archivo modificado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalModified = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      totalModified += processDirectory(fullPath);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      if (replaceConsoleLogsInFile(fullPath)) {
        totalModified++;
      }
    }
  });
  
  return totalModified;
}

console.log('🔍 Buscando console.log en el backend...');
const modifiedFiles = processDirectory(BACKEND_SRC);
console.log(`\n✨ Proceso completado. ${modifiedFiles} archivos modificados.`);
console.log('\n📝 Se crearon backups (.backup) de los archivos modificados.');
console.log('💡 Revisa los cambios antes de hacer commit.');
