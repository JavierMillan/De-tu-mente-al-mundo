const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert.equal(fs.existsSync(path.join(root, 'presentacion')), false,
  'DTMM landing repo must not contain Academy course source');
assert.equal(fs.existsSync(path.join(root, 'ingles')), false,
  'DTMM landing repo must not contain English course source');
assert.match(home, /https:\/\/academia\.lareddeluz\.com\/dtmm\//,
  'DTMM landing must link to its Academy course');
assert.match(home, /https:\/\/academia\.lareddeluz\.com\/ingles\//,
  'DTMM landing must keep the canonical English course link');

console.log('Academy course sources: ABSENT from DTMM landing');
