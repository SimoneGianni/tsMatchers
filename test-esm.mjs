// Test ESM import
import { assert, equalTo } from './dist/esm/index.js';

console.log('Testing ESM import...');
try {
  assert("test", "test", equalTo("test"));
  console.log('✅ ESM import works correctly');
} catch (error) {
  console.error('❌ ESM import failed:', error);
  process.exit(1);
}
