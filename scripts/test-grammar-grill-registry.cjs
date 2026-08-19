const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const registry = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'ingles', 'recursos.json'),
  'utf8'
));
const resource = registry.recursos.find((item) => item.id === 'grammar-grill');

assert.ok(resource, 'Grammar Grill must be published in recursos.json');
assert.equal(resource.url, 'recursos/grammar-grill.html');
assert.match(resource.titulo, /Grammar Grill/);

console.log('grammar-grill registry: PASS');
