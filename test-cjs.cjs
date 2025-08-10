// Test CommonJS import
const { assert, equalTo } = require('./dist/cjs/index.js');

console.log('Testing CommonJS import...');
try {
  assert("test", "test", equalTo("test"));
  console.log('✅ CommonJS import works correctly');
} catch (error) {
  console.error('❌ CommonJS import failed:', error);
  process.exit(1);
}
