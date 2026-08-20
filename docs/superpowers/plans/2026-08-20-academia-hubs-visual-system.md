# Academia Hubs Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the DTMM and Inglés hub pages around one Academia shell while preserving each constellation's palette, display typography, motif, data, and routes.

**Architecture:** Keep `presentacion/assets/hub.css` as the shared hub component layer and use semantic theme classes on each page to supply constellation tokens. Keep each existing renderer responsible for its own JSON shape, but make both render the same hero/card contract and the same navigation-overflow behavior. Avoid touching decks, session pages, resources, or the current Grammar Grill work.

**Tech Stack:** HTML5, CSS custom properties, vanilla JavaScript, JSON, Node.js `assert`, Playwright with installed Edge.

---

## File map

- Modify `presentacion/index.html`: DTMM Academia shell, navigation landmarks, hero slot, constellation identity.
- Modify `presentacion/assets/hub.css`: shared Academia shell, compact hero, cards, blur surfaces, responsive drawer and base accessibility.
- Modify `presentacion/assets/hub.js`: DTMM hero renderer, semantic card markup, navigation fit detection.
- Modify `ingles/index.html`: Inglés Academia shell and dynamic hero slot; remove permanent live state.
- Modify `ingles/assets/ingles.css`: Inglés palette, typography and wave/node overrides only.
- Modify `ingles/assets/ingles.js`: dynamic featured session, semantic cards and navigation fit detection.
- Create `scripts/test-academy-hubs-structure.cjs`: fast source-contract regression test.
- Create `scripts/test-academy-hubs-e2e.cjs`: responsive layout, accessibility and screenshot test.

Do not modify `ingles/recursos/**`, `ingles/recursos.json`, or any Grammar Grill tests.

### Task 1: Lock the approved source contract with a failing test

**Files:**
- Create: `scripts/test-academy-hubs-structure.cjs`
- Test: `scripts/test-academy-hubs-structure.cjs`

- [ ] **Step 1: Write the structural regression test**

```js
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
```

- [ ] **Step 2: Run the test and verify it fails against the old hubs**

Run:

```powershell
node scripts/test-academy-hubs-structure.cjs
```

Expected: FAIL at `DTMM must use the shared shell`.

- [ ] **Step 3: Commit the failing contract test**

```powershell
git add -- scripts/test-academy-hubs-structure.cjs
git commit -m "test: define academy hub visual contract"
```

### Task 2: Build the shared Academia shell and semantic page landmarks

**Files:**
- Modify: `presentacion/index.html`
- Modify: `ingles/index.html`
- Modify: `presentacion/assets/hub.css`
- Test: `scripts/test-academy-hubs-structure.cjs`

- [ ] **Step 1: Replace the DTMM top-level shell markup**

Use this structure in `presentacion/index.html`, retaining its current font links
and `assets/hub.js` script:

```html
<body class="theme-dtmm">
<a class="skip-link" href="#rows">Saltar al contenido</a>
<header class="topbar academy-shell" id="academyHeader">
  <a class="academy-brand" href="../index.html" aria-label="Volver a Academia La Red de Luz">
    <img src="../assets/imgs/reddeluz.png" alt="" width="34" height="34">
    <span>La Red de Luz · Academia</span>
  </a>
  <span class="shell-divider" aria-hidden="true">/</span>
  <span class="constellation-context">DTMM</span>
  <nav class="nav nav-desktop" id="navMain" aria-label="Secciones del programa"></nav>
  <a class="all-constellations" href="../index.html">Todas las constelaciones</a>
  <button class="burger" id="burger" type="button" aria-label="Abrir menú"
          aria-expanded="false" aria-controls="navDrawer">
    <span></span><span></span><span></span>
  </button>
</header>
<nav class="nav-drawer" id="navDrawer" aria-label="Menú de navegación" aria-hidden="true">
  <a class="dfoot" href="../index.html">Todas las constelaciones</a>
</nav>
<div class="nav-scrim" id="navScrim"></div>
<main>
  <div id="heroSlot"></div>
  <div class="wrap pad rows-area" id="rows"></div>
</main>
<footer class="wrap pad hub-footer">
  <p class="foot">De tu mente al mundo · una constelación de La Red de Luz</p>
</footer>
```

- [ ] **Step 2: Replace the Inglés top-level shell markup**

Use the same landmarks in `ingles/index.html`, with these theme-specific values:

```html
<body class="theme-english">
<a class="skip-link" href="#rows">Saltar al contenido</a>
<header class="topbar academy-shell" id="academyHeader">
  <a class="academy-brand" href="../index.html" aria-label="Volver a Academia La Red de Luz">
    <img src="../assets/imgs/reddeluz.png" alt="" width="34" height="34">
    <span>La Red de Luz · Academia</span>
  </a>
  <span class="shell-divider" aria-hidden="true">/</span>
  <span class="constellation-context">Inglés</span>
  <nav class="nav nav-desktop" id="navMain" aria-label="Secciones del programa">
    <a href="recursos.html" class="solo">Recursos</a>
  </nav>
  <a class="all-constellations" href="../index.html">Todas las constelaciones</a>
  <button class="burger" id="burger" type="button" aria-label="Abrir menú"
          aria-expanded="false" aria-controls="navDrawer">
    <span></span><span></span><span></span>
  </button>
</header>
<nav class="nav-drawer" id="navDrawer" aria-label="Menú de navegación" aria-hidden="true">
  <a href="recursos.html" class="solo">Recursos</a>
  <a class="dfoot" href="../index.html">Todas las constelaciones</a>
</nav>
<div class="nav-scrim" id="navScrim"></div>
<main>
  <div id="heroSlot"></div>
  <div class="wrap pad rows-area" id="rows"></div>
</main>
<footer class="wrap pad hub-footer">
  <p class="frase-red">La luz se construye <span class="hl">en red</span></p>
  <p class="foot">¡Hablemos Inglés! · una constelación de La Red de Luz</p>
</footer>
```

- [ ] **Step 3: Add the shared shell tokens and alignment rules to `hub.css`**

Place these variables at the top of `:root`, then replace the old topbar rules
with the component rules below:

```css
:root{
  --academy-void:#0d0b16;
  --academy-surface:#161423;
  --academy-gold:#e4cd85;
  --academy-line:rgba(228,205,133,.18);
  --academy-warm:#f9f4e3;
  --hub-panel-rgb:36,29,22;
  --accent-text:var(--sesame);
  --accent-surface:var(--sesame);
}
.academy-shell{
  position:sticky;top:0;z-index:120;min-height:64px;
  display:flex;align-items:center;gap:clamp(.65rem,1.4vw,1.2rem);
  padding:.65rem clamp(1rem,3vw,2.6rem);
  background:rgba(13,11,22,.92);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--academy-line);
}
.academy-brand{display:inline-flex;align-items:center;gap:.75rem;flex:0 0 auto;
  color:var(--academy-gold);text-decoration:none;font-family:'Martian Mono',monospace;
  font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap}
.academy-brand img{width:34px;height:34px;object-fit:contain}
.shell-divider{color:rgba(249,244,227,.3)}
.constellation-context{color:var(--accent-text);font-family:'Martian Mono',monospace;
  font-size:.64rem;letter-spacing:.15em;text-transform:uppercase;white-space:nowrap}
.nav-desktop{margin-left:auto;display:flex;align-items:center;align-self:stretch;
  gap:clamp(.25rem,.8vw,.75rem);min-width:0}
.navgroup,.navgroup>.trigger,.nav-desktop>a.solo{align-self:center}
.navgroup>.trigger,.nav-desktop>a.solo{min-height:44px;display:inline-flex;align-items:center}
.all-constellations{min-height:44px;display:inline-flex;align-items:center;flex:0 0 auto;
  border:1px solid color-mix(in srgb,var(--accent-surface) 34%,var(--academy-line));
  border-radius:8px;padding:0 .8rem;color:var(--accent-text);text-decoration:none;
  font:500 .6rem 'Martian Mono',monospace;letter-spacing:.12em;text-transform:uppercase}
.burger{margin-left:auto}
body.nav-overflow .nav-desktop,body.nav-overflow .all-constellations{display:none}
body.nav-overflow .burger{display:flex}
```

- [ ] **Step 4: Run the source contract test**

Run:

```powershell
node scripts/test-academy-hubs-structure.cjs
```

Expected: FAIL at the first missing hero/card behavior, not at shell markup.

- [ ] **Step 5: Commit the shared shell**

```powershell
git add -- presentacion/index.html ingles/index.html presentacion/assets/hub.css
git commit -m "feat: add shared academy shell to course hubs"
```

### Task 3: Render the compact DTMM hero and constellation identity

**Files:**
- Modify: `presentacion/assets/hub.js`
- Modify: `presentacion/assets/hub.css`
- Test: `scripts/test-academy-hubs-structure.cjs`

- [ ] **Step 1: Replace `destacado(d)` with the compact hero contract**

```js
function figuraLyra(){
  return '<svg viewBox="0 0 180 135" aria-hidden="true">'+
    '<path d="M38 18L78 43L110 75L92 116L58 96L78 43"/>'+
    '<circle class="core" cx="38" cy="18" r="4.3"/>'+
    '<circle cx="78" cy="43" r="2"/><circle cx="110" cy="75" r="2"/>'+
    '<circle cx="92" cy="116" r="1.8"/><circle cx="58" cy="96" r="1.8"/>'+
  '</svg>';
}

function destacado(d){
  if(!d) return '';
  return '<section class="hub-hero" id="top">'+
    '<div class="constellation-motif motif-dtmm" aria-hidden="true"></div>'+
    '<div class="hub-identity">'+
      '<div class="constellation-avatar">'+figuraLyra()+'</div>'+
      '<span class="constellation-name">Lyra · La creación</span>'+
      '<h1>De tu Mente<br>al Mundo</h1>'+
      '<p>Ideas, contenido e inteligencia artificial convertidos en algo que puedas construir.</p>'+
    '</div>'+
    '<a class="featured-class" href="'+esc(d.deck)+'">'+
      '<span class="featured-label">Clase destacada · '+esc(d.estado)+'</span>'+
      '<h2>'+d.titulo.replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'')+'</h2>'+
      '<p>'+esc(d.resumen)+'</p>'+
      '<span class="featured-go">Abrir presentación →</span>'+
    '</a>'+
  '</section>';
}
```

- [ ] **Step 2: Add the shared hero layout and DTMM theme styles**

```css
.hub-hero{position:relative;isolation:isolate;min-height:clamp(300px,42vh,430px);
  padding:clamp(2rem,4.4vw,4.2rem) clamp(1.5rem,6vw,7rem);
  display:grid;grid-template-columns:minmax(0,1.15fr) minmax(260px,.85fr);
  align-items:stretch;gap:clamp(1.5rem,4vw,4.5rem);overflow:hidden;
  border-bottom:1px solid var(--line-d)}
.hub-identity{display:grid;grid-template-columns:58px minmax(0,1fr);
  grid-template-rows:58px auto auto;column-gap:.9rem;align-content:center}
.constellation-avatar{grid-column:1;grid-row:1;width:58px;height:58px;border-radius:50%;
  display:grid;place-items:center;padding:10px;color:var(--accent-text);
  border:1px solid color-mix(in srgb,var(--accent-surface) 55%,transparent);
  background:rgba(var(--hub-panel-rgb),.92)}
.constellation-avatar svg{width:100%;overflow:visible}
.constellation-avatar path{fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round}
.constellation-avatar circle{fill:var(--char-soft);stroke:currentColor;stroke-width:1.15}
.constellation-avatar circle.core{fill:var(--on-char);stroke:var(--on-char)}
.constellation-name{grid-column:2;grid-row:1;align-self:center;color:var(--accent-text);
  font:600 .64rem 'Martian Mono',monospace;letter-spacing:.16em;text-transform:uppercase}
.hub-identity h1{grid-column:1/-1;margin:1rem 0 .8rem;font-family:'Unbounded',sans-serif;
  font-size:clamp(2.25rem,5vw,5rem);line-height:.94;letter-spacing:-.035em}
.hub-identity>p{grid-column:1/-1;max-width:48ch;color:var(--on-char-soft);line-height:1.55}
.featured-class{position:relative;display:flex;flex-direction:column;padding:clamp(1.4rem,3vw,2.2rem);
  min-height:240px;border:1px solid color-mix(in srgb,var(--accent-surface) 38%,var(--line-d));
  border-radius:14px;background:rgba(var(--hub-panel-rgb),.92);
  backdrop-filter:blur(18px) saturate(.82);color:var(--on-char);text-decoration:none}
.featured-label,.featured-go{color:var(--accent-text);font:600 .62rem 'Martian Mono',monospace;
  letter-spacing:.14em;text-transform:uppercase}
.featured-class h2{font:500 clamp(1.6rem,3vw,2.5rem)/1 Fraunces,serif;margin:1.3rem 0 .7rem}
.featured-class p{color:var(--on-char-soft);font-size:.92rem;line-height:1.5}
.featured-go{margin-top:auto;padding-top:1.4rem}
.theme-dtmm{--hub-panel-rgb:36,29,22;--accent-text:#e8a13c;--accent-surface:#e8a13c}
.theme-dtmm .hub-hero{background:#19140f}
.motif-dtmm{position:absolute;inset:0;z-index:-1;background:
  linear-gradient(124deg,transparent 52%,rgba(232,161,60,.07) 52% 67%,transparent 67%),
  linear-gradient(rgba(232,161,60,.035) 1px,transparent 1px),
  linear-gradient(90deg,rgba(232,161,60,.035) 1px,transparent 1px);
  background-size:auto,34px 34px,34px 34px}
```

- [ ] **Step 3: Run the structural test**

Run `node scripts/test-academy-hubs-structure.cjs`.

Expected: FAIL only on remaining Inglés/nav/card requirements.

- [ ] **Step 4: Commit the DTMM hero**

```powershell
git add -- presentacion/assets/hub.js presentacion/assets/hub.css
git commit -m "feat: add compact DTMM academy hero"
```

### Task 4: Render the Inglés hero from JSON and restore its full personality

**Files:**
- Modify: `ingles/assets/ingles.js`
- Modify: `ingles/assets/ingles.css`
- Test: `scripts/test-academy-hubs-structure.cjs`

- [ ] **Step 1: Add the featured-session selector and Gemini figure**

```js
function primeraDisponible(data){
  return data.filas.flatMap(fila=>fila.clases).find(clase=>clase.deck) || null;
}

function figuraGemini(){
  return '<svg viewBox="0 0 180 135" aria-hidden="true">'+
    '<path d="M42 19L60 43L66 73L54 108"/><path d="M66 73L34 88"/>'+
    '<path d="M60 43L102 48L116 79L123 111"/><path d="M116 79L146 93"/>'+
    '<path d="M102 48L127 29"/><path d="M102 48L87 20"/>'+
    '<circle class="core" cx="42" cy="19" r="3.7"/><circle cx="60" cy="43" r="2"/>'+
    '<circle cx="66" cy="73" r="1.8"/><circle cx="54" cy="108" r="1.5"/>'+
    '<circle cx="34" cy="88" r="1.2"/><circle class="core" cx="102" cy="48" r="3.3"/>'+
    '<circle cx="116" cy="79" r="1.8"/><circle cx="123" cy="111" r="1.5"/>'+
    '<circle cx="146" cy="93" r="1.2"/><circle cx="127" cy="29" r="1.5"/>'+
    '<circle cx="87" cy="20" r="1.3"/>'+
  '</svg>';
}

function destacado(data){
  const clase = primeraDisponible(data);
  if(!clase) return '';
  return '<section class="hub-hero" id="top">'+
    '<div class="constellation-motif motif-english" aria-hidden="true"></div>'+
    '<div class="hub-identity">'+
      '<div class="constellation-avatar">'+figuraGemini()+'</div>'+
      '<span class="constellation-name">Gemini · Dos voces</span>'+
      '<h1>¡Hablemos<br>Inglés!</h1>'+
      '<p>Práctica didáctica y conversación para ganar confianza hablando en comunidad.</p>'+
    '</div>'+
    '<a class="featured-class" href="'+esc(clase.deck)+'">'+
      '<span class="featured-label">Sesión destacada · Sesiones en comunidad</span>'+
      '<h2>'+esc(clase.titulo)+'</h2><p>'+esc(clase.resumen)+'</p>'+
      '<span class="featured-go">Abrir sesión →</span>'+
    '</a>'+
  '</section>';
}
```

- [ ] **Step 2: Render the Inglés hero before the rows**

Inside the successful `fetch` callback, before assigning `rows.innerHTML`, add:

```js
const heroSlot = document.getElementById('heroSlot');
if(heroSlot) heroSlot.innerHTML = destacado(data);
```

- [ ] **Step 3: Replace the legacy Inglés hub overrides with theme tokens**

```css
:root{
  --char:#0a0a0a;--char-soft:#161414;
  --on-char:#f2f0ec;--on-char-soft:#c9c5be;--on-char-mute:#8a8680;
  --accent-text:#ea4a63;--accent-surface:#c8102e;
  --hub-panel-rgb:22,20,20;
  --sesame:var(--accent-text);--sesame-hi:#f06a7e;--glow:rgba(200,16,46,.45);
}
.theme-english{background:#0a0a0a;font-family:'Spline Sans',system-ui,sans-serif}
.theme-english .hub-identity h1{font-family:'Archivo Black',system-ui,sans-serif;
  text-transform:uppercase;font-size:clamp(2.8rem,6vw,6.2rem);line-height:.88;letter-spacing:.005em}
.theme-english .featured-class h2,.theme-english .row-head h3,
.theme-english .deck-card h4{font-family:'Archivo Black',system-ui,sans-serif;
  text-transform:uppercase;letter-spacing:-.01em}
.motif-english{position:absolute;inset:0;z-index:-1;background:
  radial-gradient(circle at 78% 18%,rgba(200,16,46,.22),transparent 30%),
  linear-gradient(rgba(242,240,236,.02) 1px,transparent 1px),
  linear-gradient(90deg,rgba(242,240,236,.02) 1px,transparent 1px);
  background-size:auto,34px 34px,34px 34px}
.motif-english::before,.motif-english::after{content:"";position:absolute;left:-10%;
  width:120%;height:42%;border:1px solid rgba(200,16,46,.42);border-radius:50%}
.motif-english::before{top:18%;transform:rotate(5deg)}
.motif-english::after{top:34%;border-color:rgba(242,240,236,.1);transform:rotate(-3deg)}
.theme-english .constellation-avatar{color:var(--accent-text)}
```

- [ ] **Step 4: Run the source contract test**

Run `node scripts/test-academy-hubs-structure.cjs`.

Expected: FAIL only on nav-fit and progress-removal assertions.

- [ ] **Step 5: Commit the Inglés hero and theme**

```powershell
git add -- ingles/assets/ingles.js ingles/assets/ingles.css
git commit -m "feat: add academy hero and theme to english hub"
```

### Task 5: Collapse navigation when the header actually runs out of room

**Files:**
- Modify: `presentacion/assets/hub.js`
- Modify: `ingles/assets/ingles.js`
- Modify: `presentacion/assets/hub.css`
- Test: `scripts/test-academy-hubs-e2e.cjs`

- [ ] **Step 1: Create the browser test before adding fit detection**

Create `scripts/test-academy-hubs-e2e.cjs`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('C:/Users/Usuario/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const results = path.join(root, 'test-results', 'academy-hubs');
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};

function server(){
  const instance = http.createServer((req,res)=>{
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = path.resolve(root,'.'+pathname);
    if(pathname.endsWith('/')) file = path.join(file,'index.html');
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
    fs.readFile(file,(error,body)=>{
      if(error){res.writeHead(404).end('Not found');return;}
      res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'}).end(body);
    });
  });
  return new Promise(resolve=>instance.listen(0,'127.0.0.1',()=>resolve(instance)));
}

async function inspect(browser,base,route,name,viewport){
  const context = await browser.newContext({viewport});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+route,{waitUntil:'networkidle'});
  await page.locator('.deck-card').first().waitFor();
  const metrics = await page.evaluate(()=>{
    const rect = selector=>document.querySelector(selector).getBoundingClientRect();
    const cards=[...document.querySelectorAll('.deck-card')];
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      header:rect('.academy-shell'),hero:rect('.hub-hero'),firstRow:rect('.row-sec'),
      burger:getComputedStyle(document.querySelector('#burger')).display,
      nav:getComputedStyle(document.querySelector('#navMain')).display,
      blurred:cards.every(card=>getComputedStyle(card).backdropFilter.includes('blur')),
      cardBackground:getComputedStyle(cards[0]).backgroundColor
    };
  });
  assert.ok(metrics.overflow<=0, `${name} must not overflow at ${viewport.width}`);
  assert.ok(metrics.firstRow.top<viewport.height, `${name} first row must begin in first viewport`);
  assert.ok(metrics.blurred, `${name} cards must blur their backdrop`);
  assert.deepEqual(errors,[]);
  if(viewport.width===760){
    assert.notEqual(metrics.burger,'none',`${name} burger must appear when nav does not fit`);
    assert.equal(metrics.nav,'none',`${name} desktop nav must collapse`);
    await page.locator('#burger').click();
    await page.locator('#navDrawer[aria-hidden="false"]').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#burger').getAttribute('aria-expanded'),'false');
  }
  await page.screenshot({path:path.join(results,`${name}-${viewport.width}x${viewport.height}.png`),fullPage:true});
  await context.close();
}

(async()=>{
  fs.mkdirSync(results,{recursive:true});
  const httpServer=await server();
  const base=`http://127.0.0.1:${httpServer.address().port}`;
  const browser=await chromium.launch({executablePath:edge,headless:true});
  try{
    for(const [route,name] of [['/presentacion/','dtmm'],['/ingles/','ingles']]){
      for(const viewport of [{width:1440,height:900},{width:1024,height:768},
        {width:760,height:900},{width:390,height:844}]){
        await inspect(browser,base,route,name,viewport);
      }
    }
    console.log('academy hubs browser layout: PASS');
  }finally{
    await browser.close();
    await new Promise(resolve=>httpServer.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
```

- [ ] **Step 2: Run the browser test and verify the 760 px nav assertion fails**

Run:

```powershell
node scripts/test-academy-hubs-e2e.cjs
```

Expected: FAIL because the desktop nav remains visible or overlaps at 760 px.

- [ ] **Step 3: Add fit detection to both hub scripts**

Add this function unchanged to `hub.js` and `ingles.js`, then call it immediately
after dynamic navigation is inserted and before `activarMenu()`:

```js
function activarNavAjustable(){
  const header = document.getElementById('academyHeader');
  const nav = document.getElementById('navMain');
  if(!header || !nav) return;

  function medir(){
    document.body.classList.remove('nav-overflow');
    const overflow = header.scrollWidth > header.clientWidth + 1 ||
      nav.scrollWidth > nav.clientWidth + 1;
    document.body.classList.toggle('nav-overflow', overflow || innerWidth <= 760);
  }

  const observer = new ResizeObserver(medir);
  observer.observe(header);
  observer.observe(nav);
  requestAnimationFrame(medir);
  window.addEventListener('load', medir, {once:true});
}
```

Call order:

```js
activarRieles(document);
activarNavAjustable();
activarMenu();
```

- [ ] **Step 4: Run the browser test**

Run `node scripts/test-academy-hubs-e2e.cjs`.

Expected: navigation assertions pass; any remaining failure concerns cards or
first-viewport sizing and is addressed in Task 6.

- [ ] **Step 5: Commit responsive navigation**

```powershell
git add -- presentacion/assets/hub.js ingles/assets/ingles.js presentacion/assets/hub.css scripts/test-academy-hubs-e2e.cjs
git commit -m "feat: collapse academy hub nav when space runs out"
```

### Task 6: Finish card density, glass depth and mobile layout

**Files:**
- Modify: `presentacion/assets/hub.js`
- Modify: `ingles/assets/ingles.js`
- Modify: `presentacion/assets/hub.css`
- Modify: `ingles/assets/ingles.css`
- Test: `scripts/test-academy-hubs-structure.cjs`
- Test: `scripts/test-academy-hubs-e2e.cjs`

- [ ] **Step 1: Remove decorative progress markup from both `tarjeta()` functions**

End each card renderer with the CTA and closing tag:

```js
return '<'+tag+' class="deck-card'+(soon?' soon':'')+'"'+href+'>'+
  '<span class="stripe"></span>'+
  '<div class="lvl"><span>'+esc(etiqueta)+'</span>'+
  '<span class="part">'+esc(clase.parte)+(soon?' · próximamente':'')+'</span></div>'+
  '<h4>'+esc(clase.titulo)+'</h4>'+
  '<p>'+esc(clase.resumen)+'</p>'+
  extras+cta+
'</'+tag+'>';
```

For Inglés, omit `extras` because that renderer does not define it.

- [ ] **Step 2: Replace the shared card surface and responsive rules**

```css
.deck-card{position:relative;flex:0 0 clamp(260px,28vw,340px);min-height:220px;
  display:flex;flex-direction:column;padding:clamp(1.25rem,2.2vw,1.75rem);
  border:1px solid var(--line-d2);border-radius:14px;
  background:rgba(var(--hub-panel-rgb),.88);
  -webkit-backdrop-filter:blur(13px) saturate(.84);
  backdrop-filter:blur(13px) saturate(.84);
  box-shadow:inset 0 1px rgba(255,255,255,.028),0 16px 36px -34px rgba(0,0,0,.9);
  color:var(--on-char);text-decoration:none;overflow:hidden;
  transition:transform .25s var(--ease),border-color .25s var(--ease),box-shadow .25s var(--ease)}
@supports not (backdrop-filter:blur(1px)){
  .deck-card{background:rgb(var(--hub-panel-rgb))}
}
.deck-card:hover{transform:translateY(-4px);border-color:var(--accent-surface);
  box-shadow:0 28px 60px -40px var(--glow)}
.deck-card .prog{display:none}
.rows-area{padding-bottom:clamp(4rem,8vw,7rem);margin-top:0}
.row-sec{margin-top:clamp(2rem,3.6vw,3rem)}
@media(max-width:760px){
  .hub-hero{grid-template-columns:1fr;min-height:0;padding:2rem 1.25rem;gap:1.25rem}
  .featured-class{min-height:190px}
  .hub-identity h1{font-size:clamp(2.3rem,12vw,4.2rem)}
  .deck-card{flex-basis:min(86vw,340px);min-height:230px}
}
@media(max-width:420px){
  .academy-brand span{max-width:8.5rem;white-space:normal;line-height:1.25}
  .shell-divider,.constellation-context{display:none}
}
```

- [ ] **Step 3: Ensure Inglés uses surface red only for borders and motifs**

```css
.theme-english .deck-card .stripe{background:var(--accent-surface)}
.theme-english .deck-card .lvl,.theme-english .deck-card .go{color:var(--accent-text)}
.theme-english .deck-card:hover{border-color:var(--accent-surface)}
```

- [ ] **Step 4: Run both new tests**

```powershell
node scripts/test-academy-hubs-structure.cjs
node scripts/test-academy-hubs-e2e.cjs
```

Expected:

```text
academy hubs source contract: PASS
academy hubs browser layout: PASS
```

- [ ] **Step 5: Commit cards and mobile layout**

```powershell
git add -- presentacion/assets/hub.js ingles/assets/ingles.js presentacion/assets/hub.css ingles/assets/ingles.css
git commit -m "feat: finish academy hub cards and responsive layout"
```

### Task 7: Run complete regression and inspect final screenshots

**Files:**
- Verify only; no planned source changes.
- Review: `test-results/academy-hubs/*.png`

- [ ] **Step 1: Run all existing fast Node tests**

```powershell
Get-ChildItem scripts\test-*.cjs | Where-Object Name -NotMatch 'e2e' | ForEach-Object {
  node $_.FullName
  if($LASTEXITCODE -ne 0){ throw "Failed: $($_.Name)" }
}
```

Expected: every script prints its PASS message and the command exits zero.

- [ ] **Step 2: Run the hub browser test**

```powershell
node scripts/test-academy-hubs-e2e.cjs
```

Expected: `academy hubs browser layout: PASS` and eight screenshots.

- [ ] **Step 3: Inspect the eight screenshots**

Verify each image in `test-results/academy-hubs/`:

- Mother shell is recognizable in both hubs.
- DTMM remains warm, editorial and geometric.
- Inglés remains black/red, broadcast and collective.
- Avatar shares only the eyebrow row; titles use full width.
- Featured and row cards obscure, blur and soften motifs behind them.
- First learning row begins inside the desktop viewport.
- Mobile drawer replaces the desktop nav before overlap.
- No horizontal clipping at 390 px.

- [ ] **Step 4: Confirm only intended files are changed**

```powershell
git status --short
git diff --stat HEAD
```

Expected: no hub implementation files remain uncommitted. Existing Grammar Grill
changes may still appear and must remain untouched.

- [ ] **Step 5: Run one final targeted status check**

```powershell
git log --oneline -7
git diff --check HEAD~5..HEAD
```

Expected: the Academy hub commits are present and `git diff --check` prints no
whitespace errors.

### Task 8: Push the isolated hub commits

**Files:**
- No file modifications.

- [ ] **Step 1: Confirm the current branch and remote**

```powershell
git branch --show-current
git remote -v
```

Expected: branch `main`; `origin` points to
`https://github.com/JavierMillan/De-tu-mente-al-mundo.git`.

- [ ] **Step 2: Push without staging any unrelated work**

```powershell
git push origin main
```

Expected: Git reports the new commit range pushed to `origin/main`.

- [ ] **Step 3: Verify local working changes remain intact**

```powershell
git status --short
```

Expected: the pre-existing Grammar Grill and editor-local changes remain exactly
as they were; no hub implementation file is dirty.
