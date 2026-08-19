const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resourceDir = path.join(__dirname, '..', 'ingles', 'recursos');
const read = (name) => fs.readFileSync(path.join(resourceDir, name), 'utf8');
const html = read('grammar-grill.html');
const css = read('grammar-grill.css');
const js = read('grammar-grill.js');

assert.doesNotThrow(() => new Function(js), 'grammar-grill.js must compile');

assert.match(html, /<html lang="en">/);
assert.match(html, /id="app"/);
assert.match(html, /grammar-grill-model\.js/);
assert.match(html, /grammar-grill\.js/);
assert.match(html, /Build it\. Say it\. Serve it\./);

assert.match(css, /--yellow:#ffbc0d/);
assert.match(css, /@media\(max-width:820px\)/);
assert.match(css, /@media\(max-width:480px\)/);
assert.match(css, /prefers-reduced-motion:reduce/);

assert.match(js, /data-role="customer"/);
assert.match(js, /data-role="delivery"/);
assert.match(js, /createRandomOrder/);
assert.match(js, /compareOrders/);
assert.match(js, /ORDER CREATED!/);
assert.match(js, /ORDER READY!/);
assert.match(js, /CREATE ANOTHER ORDER/);
assert.match(js, /PREPARE ANOTHER ORDER/);

console.log('grammar-grill UI contract: PASS');
