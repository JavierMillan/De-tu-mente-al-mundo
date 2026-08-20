const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const dtmmHtml = read('presentacion', 'index.html');
const dtmmCss = read('presentacion', 'assets', 'hub.css');
const dtmmJs = read('presentacion', 'assets', 'hub.js');
const englishHtml = read('ingles', 'index.html');
const englishCss = read('ingles', 'assets', 'ingles.css');
const englishJs = read('ingles', 'assets', 'ingles.js');

for (const [name, html] of [['DTMM', dtmmHtml], ['Inglés', englishHtml]]) {
  assert.match(html, /class="topbar academy-shell"/, `${name} must use the shared shell`);
  assert.match(html, /LA RED DE LUZ · ACADEMIA/i, `${name} must name Academia`);
  assert.match(html, /id="heroSlot"/, `${name} hero must be data-driven`);
  assert.match(html, /id="navMain"/);
  assert.match(html, /id="navDrawer"/);
  assert.match(html, /id="burger"/);
}

assert.match(dtmmHtml, /theme-dtmm/);
assert.match(englishHtml, /theme-english/);
assert.doesNotMatch(englishHtml, /live-badge/);
assert.doesNotMatch(englishHtml, />En vivo</i);

assert.match(dtmmCss, /--academy-void:\s*#0d0b16/i);
assert.match(dtmmCss, /\.hub-hero/);
assert.match(dtmmCss, /backdrop-filter:\s*blur\(/);
assert.match(dtmmCss, /body\.nav-overflow/);
assert.match(dtmmCss, /\.constellation-avatar/);

assert.match(englishCss, /--accent-text:\s*#ea4a63/i);
assert.match(englishCss, /--accent-surface:\s*#c8102e/i);
assert.match(englishCss, /Archivo Black/);

for (const [name, source] of [['DTMM', dtmmJs], ['Inglés', englishJs]]) {
  assert.match(source, /activarNavAjustable/,
    `${name} must collapse nav based on available width`);
  assert.doesNotMatch(source, /class="prog"/,
    `${name} must not imply personal progress`);
}

assert.match(englishJs, /Sesiones en comunidad/);
console.log('academy hubs source contract: PASS');
