#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create package.json for CJS build
const cjsPackageJson = {
  "type": "commonjs"
};

writeFileSync(
  join(__dirname, '../dist/cjs/package.json'),
  JSON.stringify(cjsPackageJson, null, 2)
);

console.log('✅ Created package.json for CJS build');
