const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const temporaryEnglish = path.join(root, 'ingles');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert.equal(
  fs.existsSync(temporaryEnglish),
  false,
  'DTMM must not contain the temporary ingles/ constellation'
);
assert.match(
  home,
  /href=["']https:\/\/academia\.lareddeluz\.com\/ingles\/["']/,
  'DTMM must link to the canonical Academy English hub'
);
assert.doesNotMatch(
  home,
  /href=["']ingles\//,
  'DTMM must not link to a local English copy'
);

console.log('temporary English constellation: ABSENT');
