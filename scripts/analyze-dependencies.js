const fs = require('fs');
const path = require('path');

/**
 * Script para analizar dependencias no utilizadas
 * Uso: node scripts/analyze-dependencies.js
 */

function analyzePackageJson(packagePath, srcPath) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log(`\n📦 Analizando: ${packagePath}`);
  console.log(`📁 Código fuente: ${srcPath}`);
  
  const unusedDeps = [];
  const usedDeps = [];
  
  // Leer todos los archivos de código
  const allFiles = getAllFiles(srcPath, ['.ts', '.tsx', '.js', '.jsx']);
  const allContent = allFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  
  Object.keys(dependencies).forEach(dep => {
    // Buscar imports de esta dependencia
    const importPatterns = [
      new RegExp(`import.*from\\s+['"]${dep}['"]`, 'g'),
      new RegExp(`import\\s+['"]${dep}['"]`, 'g'),
      new RegExp(`require\\(['"]${dep}['"]\\)`, 'g'),
      new RegExp(`from\\s+['"]${dep}/`, 'g'), // Para imports de subdirectorios
    ];
    
    const isUsed = importPatterns.some(pattern => pattern.test(allContent));
    
    if (isUsed) {
      usedDeps.push(dep);
    } else {
      // Verificar si es una dependencia de tipos o herramientas
      const isToolDep = dep.startsWith('@types/') || 
                      ['typescript', 'eslint', 'prettier', 'jest'].some(tool => dep.includes(tool));
      
      if (!isToolDep) {
        unusedDeps.push({
          name: dep,
          version: dependencies[dep],
          type: packageJson.dependencies[dep] ? 'dependency' : 'devDependency'
        });
      }
    }
  });
  
  console.log(`\n✅ Dependencias utilizadas: ${usedDeps.length}`);
  console.log(`❓ Posibles dependencias no utilizadas: ${unusedDeps.length}`);
  
  if (unusedDeps.length > 0) {
    console.log('\n🔍 Dependencias que podrían no estar en uso:');
    unusedDeps.forEach(dep => {
      console.log(`  - ${dep.name}@${dep.version} (${dep.type})`);
    });
    
    console.log('\n⚠️  IMPORTANTE: Verifica manualmente antes de eliminar.');
    console.log('   Algunas dependencias pueden ser usadas en configuración o runtime.');
  }
  
  return { used: usedDeps.length, unused: unusedDeps.length, unusedList: unusedDeps };
}

function getAllFiles(dir, extensions) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    console.warn(`No se pudo leer el directorio: ${dir}`);
  }
  
  return files;
}

// Analizar backend
const backendPackage = path.join(__dirname, '..', 'backend', 'package.json');
const backendSrc = path.join(__dirname, '..', 'backend', 'src');

if (fs.existsSync(backendPackage)) {
  const backendResults = analyzePackageJson(backendPackage, backendSrc);
}

// Analizar frontend
const frontendPackage = path.join(__dirname, '..', 'frontend', 'package.json');
const frontendSrc = path.join(__dirname, '..', 'frontend', 'src');

if (fs.existsSync(frontendPackage)) {
  const frontendResults = analyzePackageJson(frontendPackage, frontendSrc);
}

console.log('\n🎯 Análisis completado.');
console.log('💡 Ejecuta npm audit para verificar vulnerabilidades.');
console.log('🔧 Considera actualizar dependencias con npm update.');
