# Session 5 Immersive Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Convert slide 6 of the English session 5 deck into a full-screen, restaurant-like digital menu board while preserving deck navigation and mobile readability.

**Architecture:** Keep the feature local to \`ingles/sesion-5.html\`, because its markup and styles are unique to this deck. Add a dependency-free structural test that protects the three-panel contract, then verify the actual render with a headless browser at three target viewports.

**Tech Stack:** HTML5, CSS, shared DTMM deck engine, Node.js built-in assertions, Playwright/Edge for visual verification.

---

### Task 1: Lock the immersive-board DOM contract

**Files:**
- Create: \`scripts/test-session-5-menu.cjs\`
- Test: \`scripts/test-session-5-menu.cjs\`

- [ ] **Step 1: Write the structural test**

\`\`\`js
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
assert.match(source, /class="menu-rig"/);
assert.equal((source.match(/class="menu-panel/g) || []).length, 3);
assert.match(source, />Burgers</);
assert.match(source, />Sides &amp; Drinks</);
assert.match(source, />Combos</);
assert.match(source, /ORDER HERE · WHAT CAN I GET FOR YOU\?/);
assert.match(source, /TEACHER = CASHIER · STUDENT = CUSTOMER/);
assert.doesNotMatch(source, /<h2 class="h1">/);

console.log('session-5 menu structure: PASS');
\`\`\`

- [ ] **Step 2: Run the test and confirm it fails against the current card layout**

Run:

\`\`\`powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/test-session-5-menu.cjs
\`\`\`

Expected: FAIL because \`.restaurant-scene\` and \`.menu-rig\` do not exist.

- [ ] **Step 3: Commit the failing contract test**

\`\`\`powershell
git add scripts/test-session-5-menu.cjs
git commit -m "test: define immersive menu board contract"
\`\`\`

### Task 2: Replace the card with the restaurant scene

**Files:**
- Modify: \`ingles/sesion-5.html:44-127\`
- Modify: \`ingles/sesion-5.html:244-281\`
- Test: \`scripts/test-session-5-menu.cjs\`

- [ ] **Step 1: Replace slide 6 with this physical hierarchy**

\`\`\`html
<section class="slide menu-slide" data-notes="El role-play central, 20 min. El profesor hace de cajero, el alumno de cliente.">
  <div class="restaurant-scene">
    <div class="ceiling-rail" aria-hidden="true"><i></i><i></i></div>
    <div class="scene-meta">ROLE-PLAY · 20 MIN · TEACHER = CASHIER · STUDENT = CUSTOMER</div>
    <div class="menu-rig" role="group" aria-label="McDonald's practice menu">
      <div class="menu-panel">
        <div class="panel-head"><span>Burgers</span><small>Made to order</small></div>
        <div class="item"><span class="nombre">Hamburger</span><span class="puntos"></span><span class="precio">$35</span></div>
        <div class="item"><span class="nombre">Cheeseburger</span><span class="puntos"></span><span class="precio">$40</span></div>
        <div class="item destacado"><span class="estrella">★ Most ordered</span><span class="nombre">Big Mac</span><span class="puntos"></span><span class="precio">$75</span></div>
        <div class="item"><span class="nombre">Quarter Pounder</span><span class="puntos"></span><span class="precio">$85</span></div>
        <div class="item"><span class="nombre">McChicken</span><span class="puntos"></span><span class="precio">$65</span></div>
      </div>
      <div class="menu-panel">
        <div class="panel-head"><span>Sides &amp; Drinks</span><small>Choose your size</small></div>
        <div class="item"><span class="nombre">Fries</span><span class="puntos"></span><span class="precio">S $30 · M $40 · L $50</span></div>
        <div class="item"><span class="nombre">Apple Slices</span><span class="puntos"></span><span class="precio">$25</span></div>
        <div class="item"><span class="nombre">Soda</span><span class="puntos"></span><span class="precio">S $25 · M $30 · L $35</span></div>
        <div class="item"><span class="nombre">Coffee</span><span class="puntos"></span><span class="precio">$30</span></div>
        <div class="item"><span class="nombre">Bottled Water</span><span class="puntos"></span><span class="precio">$25</span></div>
      </div>
      <div class="menu-panel">
        <div class="panel-head"><span>Combos</span><small>Burger + fries + soda</small></div>
        <div class="item"><span class="nombre">Big Mac Combo</span><span class="puntos"></span><span class="precio">$110</span></div>
        <div class="item"><span class="nombre">Quarter Pounder Combo</span><span class="puntos"></span><span class="precio">$120</span></div>
        <div class="item"><span class="nombre">McChicken Combo</span><span class="puntos"></span><span class="precio">$95</span></div>
      </div>
    </div>
    <div class="order-counter">
      <span class="counter-mark" aria-hidden="true">M</span>
      <strong>ORDER HERE · WHAT CAN I GET FOR YOU?</strong>
      <span>PRICES MXN</span>
    </div>
  </div>
</section>
\`\`\`

This markup keeps all 13 products in the DOM and preserves the prices taught in the dialogue.

- [ ] **Step 2: Replace the current menu CSS with the scene styles**

\`\`\`css
.menu-slide{padding:0!important;background:#242321!important;justify-content:center}
.restaurant-scene{position:relative;width:100%;height:100%;display:flex;flex-direction:column;
  justify-content:center;padding:clamp(4rem,9vh,6.5rem) clamp(2rem,5vw,5rem) clamp(5.5rem,10vh,7.5rem);
  background:linear-gradient(180deg,#d7d4cd 0 16%,#292826 16% 86%,#aaa59b 86% 100%)}
.restaurant-scene::after{content:"";position:absolute;inset:16% 0 14%;pointer-events:none;
  background:radial-gradient(ellipse at 50% 0,rgba(255,255,255,.1),transparent 55%)}
.ceiling-rail{position:absolute;z-index:2;top:8.5%;left:4%;right:4%;height:10px;background:#151515;
  box-shadow:0 8px 20px rgba(0,0,0,.55)}
.ceiling-rail i{position:absolute;top:10px;width:4px;height:clamp(1.6rem,5vh,3.4rem);background:#222}
.ceiling-rail i:first-child{left:13%}.ceiling-rail i:last-child{right:13%}
.scene-meta{position:relative;z-index:3;margin:0 0 .65rem;font-family:var(--font-mono);font-size:.56rem;
  letter-spacing:.19em;color:#ddd8d0;text-transform:uppercase}
.menu-rig{position:relative;z-index:3;width:100%;display:grid;grid-template-columns:1fr 1.12fr 1fr;
  gap:5px;padding:5px;background:#0a0a0a;box-shadow:0 22px 50px rgba(0,0,0,.7)}
.menu-panel{min-width:0;background:#f5f3ed;color:#151515;padding:clamp(.85rem,1.6vw,1.35rem);
  box-shadow:inset 0 0 30px rgba(255,255,255,.8)}
.panel-head{display:flex;align-items:flex-end;justify-content:space-between;gap:.6rem;padding-bottom:.65rem;
  margin-bottom:.3rem;border-bottom:5px solid #c8102e;font-family:var(--font-display);text-transform:uppercase}
.panel-head small{font-family:var(--font-mono);font-size:.42rem;letter-spacing:.04em;color:#706d67;text-align:right}
.menu-panel .item{display:flex;align-items:baseline;gap:.35rem;padding:clamp(.38rem,.7vw,.58rem) 0;
  border-top:1px dotted rgba(20,20,20,.24)}
.menu-panel .item:first-of-type{border-top:0}
.menu-panel .nombre{font-family:var(--font-display);font-size:clamp(.62rem,.92vw,.8rem);text-transform:uppercase}
.menu-panel .puntos{flex:1;border-bottom:2px dotted rgba(20,20,20,.28);transform:translateY(-.3em)}
.menu-panel .precio,.menu-panel .talla{font-family:var(--font-mono);font-size:clamp(.62rem,.9vw,.8rem);font-weight:600}
.menu-panel .destacado{position:relative;margin:.25rem -.35rem;padding:.65rem .35rem;border:2px solid #c8102e;background:#fff3f4}
.menu-panel .estrella{position:absolute;right:.3rem;top:-.45rem;background:#c8102e;color:#fff;padding:.15rem .35rem;
  font-family:var(--font-mono);font-size:.4rem;letter-spacing:.06em}
.order-counter{position:relative;z-index:3;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:1rem;
  min-height:3.4rem;padding:.6rem 1rem;background:#c8102e;color:#fff;box-shadow:0 14px 28px rgba(0,0,0,.45)}
.order-counter strong{font-family:var(--font-display);font-size:clamp(.72rem,1.4vw,1.05rem);text-align:center}
.order-counter>span:last-child{font-family:var(--font-mono);font-size:.52rem;letter-spacing:.12em}
.counter-mark{font-family:var(--font-display);font-size:1.5rem;color:#ffbc0d}
@media(max-width:820px){
  .menu-slide{overflow-y:auto!important;justify-content:flex-start!important}
  .restaurant-scene{height:auto;min-height:100%;padding:4.5rem 1.25rem 6.5rem;background:#242321}
  .ceiling-rail{display:none}.menu-rig{grid-template-columns:1fr;gap:.65rem;background:transparent;padding:0}
  .scene-meta{line-height:1.5}.order-counter{grid-template-columns:auto 1fr;margin-top:.65rem}
  .order-counter>span:last-child{display:none}.menu-panel .nombre{font-size:.76rem}
}
@media(prefers-reduced-motion:no-preference){
  .slide.active .menu-panel{animation:panel-on .45s both}
  .slide.active .menu-panel:nth-child(2){animation-delay:.08s}
  .slide.active .menu-panel:nth-child(3){animation-delay:.16s}
  @keyframes panel-on{from{opacity:.25;filter:brightness(.45)}to{opacity:1;filter:brightness(1)}}
}
\`\`\`

- [ ] **Step 3: Run the structural test**

Run the Task 1 command.

Expected: \`session-5 menu structure: PASS\`.

- [ ] **Step 4: Commit the immersive scene**

\`\`\`powershell
git add ingles/sesion-5.html scripts/test-session-5-menu.cjs
git commit -m "feat: make session menu an immersive restaurant board"
\`\`\`

### Task 3: Verify responsive rendering and deck behavior

**Files:**
- Modify if verification exposes a defect: \`ingles/sesion-5.html\`
- Test: \`scripts/test-session-5-menu.cjs\`

- [ ] **Step 1: Confirm the local server**

\`\`\`powershell
Invoke-WebRequest -UseBasicParsing 'http://localhost:4173/ingles/sesion-5.html#6' -TimeoutSec 5 | Select-Object StatusCode
\`\`\`

Expected: \`StatusCode 200\`.

- [ ] **Step 2: Capture and measure required viewports**

Use Playwright with Edge at 1440×900, 1280×720 and 390×844. Evaluate:

\`\`\`js
const slide = document.querySelector('.slide.active');
const rig = document.querySelector('.menu-rig');
return {
  activeSlide: [...document.querySelectorAll('.slide')].indexOf(slide) + 1,
  panels: document.querySelectorAll('.menu-panel').length,
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  rig: rig.getBoundingClientRect().toJSON()
};
\`\`\`

Expected at all sizes: \`activeSlide: 6\`, \`panels: 3\`, \`horizontalOverflow: false\`. At desktop sizes, the rig rectangle stays inside the viewport. Save screenshots under the writable visualization directory, not the repository.

- [ ] **Step 3: Exercise keyboard navigation**

From slide 6, press \`ArrowRight\`, then \`ArrowLeft\`, then \`N\`. Confirm slide 7 opens, slide 6 returns, and notes toggle without page errors.

- [ ] **Step 4: Fix only observed responsive or navigation defects**

Adjust the existing scene selectors, then repeat Tasks 1 and 3. Do not add a second layout system.

- [ ] **Step 5: Run final checks and commit verification fixes if needed**

\`\`\`powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/test-session-5-menu.cjs
git diff --check -- ingles/sesion-5.html scripts/test-session-5-menu.cjs
git add ingles/sesion-5.html scripts/test-session-5-menu.cjs
git commit -m "fix: polish immersive menu responsiveness"
\`\`\`

Expected: structural test passes and \`git diff --check\` emits no errors.
