const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'ingles', 'sesion-5.html'),
  'utf8'
);

const slide = html.match(/<!-- 6 · ROLE-PLAY: MENÚ -->([\s\S]*?)<!-- 7 · FRASES CLAVE -->/);
assert.ok(slide, 'slide 6 must exist');

const source = slide[1];
assert.match(source, /class="slide[^"\n]*menu-slide/);
assert.match(source, /class="restaurant-scene"/);
assert.doesNotMatch(source, /ceiling-rail/);
assert.match(html, /linear-gradient\(180deg,#292826 0 89%,#aaa49a 89% 100%\)/);
assert.match(html, /body:has\(\.menu-slide\.active\) #hud/);
assert.match(html, /body:has\(\.menu-slide\.active\) #hint/);
assert.match(source, /class="menu-rig"/);
assert.equal((source.match(/class="menu-panel/g) || []).length, 3);
assert.match(source, />Burgers</);
assert.match(source, />Sides &amp; Drinks</);
assert.match(source, />Combos</);
assert.match(source, /ORDER HERE · WHAT CAN I GET FOR YOU\?/);
assert.match(source, /TEACHER = CASHIER · STUDENT = CUSTOMER/);
assert.doesNotMatch(source, /<h2 class="h1">/);

console.log('session-5 menu structure: PASS');
