#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const esmDir = join(__dirname, '../dist/esm');

function fixImportsInFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  
  let fixedContent = content;
  
  // Fix any statement with "from" clause (covers both import and export from)
  fixedContent = fixedContent.replace(
    /from\s+['"](\.\/.+?)['"];?/g,
    (match, path) => path.endsWith('.js') ? match : `from '${path}.js';`
  );
  
  // Fix bare import statements (e.g., import "./strictly";)
  fixedContent = fixedContent.replace(
    /import\s+['"](\.\/.+?)['"];?/g,
    (match, path) => path.endsWith('.js') ? match : `import '${path}.js';`
  );
  
  if (content !== fixedContent) {
    writeFileSync(filePath, fixedContent);
    console.log(`Fixed imports in ${filePath}`);
  }
}

function fixImportsRecursively(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const itemPath = join(dir, item);
    const stats = statSync(itemPath);
    
    if (stats.isDirectory()) {
      fixImportsRecursively(itemPath);
    } else if (extname(item) === '.js') {
      fixImportsInFile(itemPath);
    }
  }
}

console.log('Fixing ESM imports...');
fixImportsRecursively(esmDir);
console.log('✅ Fixed ESM imports');
