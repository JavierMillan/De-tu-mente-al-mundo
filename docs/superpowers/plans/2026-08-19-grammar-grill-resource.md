# Grammar Grill Resource Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build an English-only self-service kiosk where students can create a customer order or prepare a randomly generated delivery order and receive deterministic feedback.

**Architecture:** Catalog rules and pure order functions live in a UMD model that runs in Node tests and the browser. DOM state and rendering live in a separate UI file, styles live in a resource-specific stylesheet, and the page is published through the existing JSON registry.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js built-in assertions, Playwright/Edge.

---

### Task 1: Define model behavior with failing tests

**Files:**
- Create: scripts/test-grammar-grill.cjs
- Test: scripts/test-grammar-grill.cjs

- [ ] **Step 1: Write the model tests**

~~~js
const assert = require('node:assert/strict');
const model = require('../ingles/recursos/grammar-grill-model.js');
const { CATALOG, calculateTotal, normalizeOrder, compareOrders, createRandomOrder } = model;

assert.equal(CATALOG.length, 13);
assert.equal(CATALOG.filter((item) => item.requiresSize).length, 5);
assert.equal(CATALOG.find((item) => item.id === 'big-mac').prices.default, 75);
assert.deepEqual(CATALOG.find((item) => item.id === 'big-mac-combo').prices,
  { small: 100, medium: 110, large: 120 });

const a = { items: [
  { productId: 'soda', size: 'large', quantity: 1 },
  { productId: 'big-mac', size: null, quantity: 2 }
] };
const b = { items: [
  { productId: 'big-mac', quantity: 1 },
  { productId: 'big-mac', size: null, quantity: 1 },
  { productId: 'soda', size: 'large', quantity: 1 }
] };
assert.deepEqual(normalizeOrder(a), normalizeOrder(b));
assert.equal(compareOrders(a, b).matches, true);
assert.equal(calculateTotal(a, CATALOG), 185);

assert.deepEqual(
  compareOrders(
    { items: [{ productId: 'fries', size: 'large', quantity: 1 }] },
    { items: [{ productId: 'fries', size: 'small', quantity: 1 }] }
  ).feedback,
  ['Change Fries to Large']
);
assert.deepEqual(
  compareOrders(
    { items: [{ productId: 'cheeseburger', size: null, quantity: 2 }] },
    { items: [{ productId: 'cheeseburger', size: null, quantity: 1 }] }
  ).feedback,
  ['You need 2 Cheeseburgers']
);
assert.deepEqual(
  compareOrders(
    { items: [{ productId: 'fries', size: 'large', quantity: 1 }] },
    { items: [
      { productId: 'fries', size: 'large', quantity: 1 },
      { productId: 'fries', size: 'small', quantity: 1 }
    ] }
  ).feedback,
  ['Remove: 1 Small Fries']
);

for (let i = 0; i < 100; i += 1) {
  let n = (i + 1) / 101;
  const random = () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
  const order = createRandomOrder(CATALOG, random);
  assert.ok(order.items.length >= 1 && order.items.length <= 4);
  assert.ok(order.items.some((line) => {
    const item = CATALOG.find((entry) => entry.id === line.productId);
    return item.category === 'burgers' || item.category === 'combos';
  }));
  order.items.forEach((line) => {
    const item = CATALOG.find((entry) => entry.id === line.productId);
    assert.ok(item);
    assert.ok(line.quantity === 1 || line.quantity === 2);
    assert.equal(item.requiresSize, line.size !== null);
  });
}

console.log('grammar-grill model: PASS');
~~~

- [ ] **Step 2: Run the test and verify the missing-module failure**

~~~powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/test-grammar-grill.cjs
~~~

Expected: FAIL because grammar-grill-model.js does not exist.

- [ ] **Step 3: Commit the failing test**

~~~powershell
git add scripts/test-grammar-grill.cjs
git commit -m "test: define Grammar Grill order model"
~~~

### Task 2: Implement catalog and pure order functions

**Files:**
- Create: ingles/recursos/grammar-grill-model.js
- Test: scripts/test-grammar-grill.cjs

- [ ] **Step 1: Define the complete 13-item catalog**

~~~js
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrammarGrillModel = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

const CATALOG = [
  { id:'hamburger', category:'burgers', name:'Hamburger', description:'Beef patty, pickles and onions.', prices:{default:35}, requiresSize:false },
  { id:'cheeseburger', category:'burgers', name:'Cheeseburger', description:'Beef patty with melted cheese.', prices:{default:40}, requiresSize:false },
  { id:'big-mac', category:'burgers', name:'Big Mac', description:'Two patties and special sauce.', prices:{default:75}, requiresSize:false, featured:true },
  { id:'quarter-pounder', category:'burgers', name:'Quarter Pounder', description:'Quarter-pound beef patty and cheese.', prices:{default:85}, requiresSize:false },
  { id:'mcchicken', category:'burgers', name:'McChicken', description:'Crispy chicken, lettuce and mayo.', prices:{default:65}, requiresSize:false },
  { id:'fries', category:'sides', name:'Fries', description:'Golden and crispy.', prices:{small:30,medium:40,large:50}, requiresSize:true },
  { id:'apple-slices', category:'sides', name:'Apple Slices', description:'Fresh sliced apple.', prices:{default:25}, requiresSize:false },
  { id:'soda', category:'drinks', name:'Soda', description:'Cold fountain drink.', prices:{small:25,medium:30,large:35}, requiresSize:true },
  { id:'coffee', category:'drinks', name:'Coffee', description:'Freshly brewed coffee.', prices:{default:30}, requiresSize:false },
  { id:'bottled-water', category:'drinks', name:'Bottled Water', description:'Chilled bottled water.', prices:{default:25}, requiresSize:false },
  { id:'big-mac-combo', category:'combos', name:'Big Mac Combo', description:'Big Mac, fries and soda.', prices:{small:100,medium:110,large:120}, requiresSize:true, comboContents:['big-mac','fries','soda'] },
  { id:'quarter-pounder-combo', category:'combos', name:'Quarter Pounder Combo', description:'Quarter Pounder, fries and soda.', prices:{small:110,medium:120,large:130}, requiresSize:true, comboContents:['quarter-pounder','fries','soda'] },
  { id:'mcchicken-combo', category:'combos', name:'McChicken Combo', description:'McChicken, fries and soda.', prices:{small:85,medium:95,large:105}, requiresSize:true, comboContents:['mcchicken','fries','soda'] }
];
~~~

- [ ] **Step 2: Implement the pure API in a UMD wrapper**

~~~js
function lineKey(line) { return line.productId + '::' + (line.size || ''); }

function normalizeOrder(order) {
  const grouped = new Map();
  (order.items || []).forEach((line) => {
    const clean = {
      productId: String(line.productId),
      size: line.size || null,
      quantity: Math.max(1, Number(line.quantity) || 1)
    };
    const key = lineKey(clean);
    grouped.set(key, { ...clean, quantity: (grouped.get(key)?.quantity || 0) + clean.quantity });
  });
  return { items: [...grouped.values()].sort((x, y) => lineKey(x).localeCompare(lineKey(y))) };
}

function itemById(id, catalog = CATALOG) {
  return catalog.find((item) => item.id === id);
}

function unitPrice(line, catalog = CATALOG) {
  const item = itemById(line.productId, catalog);
  if (!item) throw new Error('Unknown product: ' + line.productId);
  const key = item.requiresSize ? line.size : 'default';
  if (!key || item.prices[key] == null) throw new Error('Invalid size for ' + item.name);
  return item.prices[key];
}

function calculateTotal(order, catalog = CATALOG) {
  return normalizeOrder(order).items.reduce(
    (sum, line) => sum + unitPrice(line, catalog) * line.quantity, 0
  );
}

function pluralName(item, quantity) {
  return quantity === 1 ? item.name : item.name + (item.name.endsWith('s') ? '' : 's');
}

function labelLine(line, catalog = CATALOG) {
  const item = itemById(line.productId, catalog);
  const size = line.size ? line.size[0].toUpperCase() + line.size.slice(1) + ' ' : '';
  return line.quantity + ' ' + size + pluralName(item, line.quantity);
}

function compareOrders(target, attempt, catalog = CATALOG) {
  const wanted = normalizeOrder(target).items;
  const actual = normalizeOrder(attempt).items;
  const feedback = [];
  const unmatchedActual = new Map(actual.map((line) => [lineKey(line), line]));

  wanted.forEach((line) => {
    const exact = unmatchedActual.get(lineKey(line));
    const item = itemById(line.productId, catalog);
    if (exact) {
      unmatchedActual.delete(lineKey(line));
      if (line.quantity !== exact.quantity) {
        feedback.push('You need ' + line.quantity + ' ' + pluralName(item, line.quantity));
      }
      return;
    }
    const wrongSize = [...unmatchedActual.values()].find((candidate) => candidate.productId === line.productId);
    if (wrongSize) {
      unmatchedActual.delete(lineKey(wrongSize));
      feedback.push('Change ' + item.name + ' to ' + line.size[0].toUpperCase() + line.size.slice(1));
      return;
    }
    feedback.push('Missing: ' + labelLine(line, catalog));
  });
  unmatchedActual.forEach((line) => {
    feedback.push('Remove: ' + labelLine(line, catalog));
  });
  return { matches: feedback.length === 0, feedback };
}

function pick(list, random) { return list[Math.floor(random() * list.length)]; }

function createRandomOrder(catalog = CATALOG, random = Math.random) {
  const mains = catalog.filter((item) => item.category === 'burgers' || item.category === 'combos');
  const first = pick(mains, random);
  const desiredCount = 1 + Math.floor(random() * 4);
  const pool = catalog.filter((item) => item.id !== first.id);
  const selected = [first];
  while (selected.length < desiredCount && pool.length) {
    selected.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
  }
  return { items: selected.map((item) => ({
    productId: item.id,
    size: item.requiresSize ? pick(['small','medium','large'], random) : null,
    quantity: random() > .72 ? 2 : 1
  })) };
}

return { CATALOG, normalizeOrder, calculateTotal, compareOrders, createRandomOrder, labelLine };
}));
~~~

- [ ] **Step 3: Run tests and commit**

~~~powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/test-grammar-grill.cjs
git add ingles/recursos/grammar-grill-model.js scripts/test-grammar-grill.cjs
git commit -m "feat: add Grammar Grill order model"
~~~

Expected: grammar-grill model: PASS.

### Task 3: Build the branded kiosk shell

**Files:**
- Create: ingles/recursos/grammar-grill.html
- Create: ingles/recursos/grammar-grill.css
- Create: ingles/recursos/grammar-grill.js

- [ ] **Step 1: Create the HTML document**

~~~html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#0a0a0a">
  <link rel="icon" type="image/png" href="../../assets/imgs/reddeluz.png">
  <title>Grammar Grill — ¡Hablemos Inglés!</title>
  <link rel="stylesheet" href="grammar-grill.css">
</head>
<body>
  <header class="topbar">
    <a class="back" href="../recursos.html">‹ Resources</a>
    <div class="wordmark"><b>Grammar Grill</b><span>Build it. Say it. Serve it.</span></div>
    <button class="reset" id="reset-app" type="button">Start over</button>
  </header>
  <main id="app" tabindex="-1">
    <p class="load-error">The kiosk could not start. Reload the page to try again.</p>
    <noscript>This kiosk needs JavaScript to build and check orders.</noscript>
  </main>
  <div class="confetti" id="confetti" aria-hidden="true"></div>
  <div class="sr-status" id="sr-status" aria-live="polite"></div>
  <script src="grammar-grill-model.js"></script>
  <script src="grammar-grill.js"></script>
</body>
</html>
~~~

- [ ] **Step 2: Implement the visual contracts in CSS**

Use the approved tokens: black #0a0a0a, red #c8102e, warm white #f2f0ec, kiosk yellow #ffbc0d and success green #39a96b. Implement:
- A 68px sticky top bar.
- A centered two-card role screen.
- Desktop kiosk grid with catalog left and 330px sticky ticket/cart right.
- Four horizontal category tabs.
- Three product columns above 820px, two below 820px and one below 480px.
- Warm-white paper ticket with red top rule.
- Yellow pill primary actions, dark secondary actions and visible yellow focus rings.
- A full-screen success panel.
- Seventy-two falling confetti pieces with a 1.6-second animation.
- No confetti under reduced motion.
- No horizontal overflow at 390px.

Use this stylesheet as the base implementation:

~~~css
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Spline+Sans:wght@400;500;600;700&family=Martian+Mono:wght@400;500;600&display=swap');
:root{--black:#0a0a0a;--panel:#171515;--paper:#f2f0ec;--red:#c8102e;--yellow:#ffbc0d;--green:#39a96b;
  --line:rgba(242,240,236,.16);--display:'Archivo Black',sans-serif;--body:'Spline Sans',sans-serif;--mono:'Martian Mono',monospace}
*{box-sizing:border-box}body{margin:0;min-height:100svh;background:var(--black);color:var(--paper);font-family:var(--body)}
button,a{font:inherit}.topbar{position:sticky;top:0;z-index:20;display:grid;grid-template-columns:auto 1fr auto;align-items:center;
  gap:1rem;min-height:68px;padding:.65rem clamp(1rem,3vw,2.5rem);background:#0a0a0aee;border-bottom:1px solid var(--line)}
.back,.reset,.secondary{color:var(--paper);background:#242222;border:1px solid var(--line);border-radius:999px;padding:.65rem .9rem;text-decoration:none}
.wordmark{text-align:center}.wordmark b{display:block;font-family:var(--display);text-transform:uppercase}.wordmark span{font-family:var(--mono);font-size:.52rem;color:var(--yellow)}
#app{min-height:calc(100svh - 68px);padding:clamp(1.2rem,4vw,3rem)}h1,h2,h3{font-family:var(--display);text-transform:uppercase;line-height:1}
.role-screen{max-width:960px;margin:auto;text-align:center}.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem}
.role-card,.product-card{border:1px solid var(--line);background:var(--panel);color:var(--paper);border-radius:14px;text-align:left}
.role-card{padding:clamp(1.2rem,3vw,2rem);min-height:210px}.role-card strong,.role-card small{display:block}.role-card strong{font-family:var(--display);font-size:clamp(1.3rem,3vw,2rem);margin:.6rem 0}
.kiosk{max-width:1180px;margin:auto}.kiosk-head{display:flex;justify-content:space-between;gap:1rem;align-items:end;margin-bottom:1.2rem}
.kiosk-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:1rem}.tabs{display:flex;gap:.4rem;overflow:auto;margin-bottom:1rem}
.tab,.size-button{white-space:nowrap;border:1px solid var(--line);border-radius:999px;padding:.6rem .9rem;background:#272424;color:var(--paper)}
.tab.active,.primary{background:var(--yellow);color:#111;font-weight:700;border:0}.products{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem}
.product-card{position:relative;padding:1rem}.food-art{height:90px;border-radius:10px;margin-bottom:.8rem;background:linear-gradient(#edaa4c 0 24%,#633820 25% 48%,#69a83f 49% 60%,#e8a449 61%)}
.featured{position:absolute;top:.65rem;left:.65rem;background:var(--red);padding:.25rem .4rem;font-family:var(--mono);font-size:.5rem}.product-actions{display:flex;flex-wrap:wrap;gap:.4rem}
.primary{border-radius:999px;padding:.75rem 1rem;cursor:pointer}.ticket,.cart{position:sticky;top:84px;background:var(--paper);color:#161616;border-radius:5px;padding:1rem;box-shadow:0 20px 45px #0008}
.ticket{position:relative;top:auto;margin-bottom:.8rem;border-top:8px solid var(--red)}.ticket-lines,.cart-lines{list-style:none;padding:0;margin:0}
.ticket li,.cart-line{display:flex;justify-content:space-between;gap:.6rem;padding:.65rem 0;border-bottom:1px dashed #aaa}.cart-line small{display:block;color:#625e58}
.stepper{display:flex;align-items:center;gap:.4rem}.stepper button{width:28px;height:28px;border-radius:50%;border:1px solid #aaa;background:#fff}.cart-total{display:flex;justify-content:space-between;font-family:var(--mono)}
.submit-order{width:100%}.feedback{padding-left:1.2rem;color:#a50020}.success{max-width:680px;margin:auto;text-align:center;padding:clamp(2rem,8vw,6rem) 1rem}
.success-mark{width:82px;height:82px;display:grid;place-items:center;margin:auto;border-radius:50%;background:var(--green);font-size:2.4rem}.actions{display:flex;justify-content:center;gap:.6rem;flex-wrap:wrap}
.confetti{position:fixed;z-index:50;inset:0;pointer-events:none;overflow:hidden}.confetti i{position:absolute;top:-20px;width:9px;height:16px;animation:fall 1.6s linear forwards}
@keyframes fall{to{transform:translate(var(--drift),110vh) rotate(720deg)}}.sr-status{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
:focus-visible{outline:3px solid var(--yellow);outline-offset:3px}button:disabled{opacity:.45;cursor:not-allowed}
@media(max-width:820px){.topbar{grid-template-columns:auto 1fr}.reset{display:none}.wordmark{text-align:right}.role-grid,.kiosk-grid{grid-template-columns:1fr}
  .products{grid-template-columns:repeat(2,minmax(0,1fr))}.ticket,.cart{position:static}.kiosk-side{order:-1}}
@media(max-width:480px){#app{padding:1rem}.products{grid-template-columns:1fr}.wordmark span{display:none}}
@media(prefers-reduced-motion:reduce){.confetti{display:none!important}}
~~~

- [ ] **Step 3: Add initial UI state and role selection**

~~~js
(function () {
  'use strict';
  const model = window.GrammarGrillModel;
  const app = document.getElementById('app');
  const status = document.getElementById('sr-status');
  const state = { role:null, category:'burgers', cart:{items:[]}, target:null, feedback:[], success:false };

  function money(value) { return '$' + value.toLocaleString('en-US'); }
  function announce(message) { status.textContent = message; }
  function resetState() {
    Object.assign(state, { role:null, category:'burgers', cart:{items:[]}, target:null, feedback:[], success:false });
    render();
  }

  function renderRoleSelect() {
    app.innerHTML =
      '<section class="role-screen" aria-labelledby="role-title">' +
      '<p>WELCOME TO GRAMMAR GRILL</p><h1 id="role-title">Choose your role</h1>' +
      '<p>Build it. Say it. Serve it.</p><div class="role-grid">' +
      '<button class="role-card" data-role="customer"><span>CUSTOMER</span><strong>I\\'m ordering food</strong><small>Create any order you like.</small></button>' +
      '<button class="role-card" data-role="delivery"><span>DELIVERY CREW</span><strong>I\\'m preparing an order</strong><small>Read the ticket and build it exactly.</small></button>' +
      '</div></section>';
    app.querySelectorAll('[data-role]').forEach((button) => button.addEventListener('click', () => {
      state.role = button.dataset.role;
      state.cart = { items:[] };
      state.target = state.role === 'delivery' ? model.createRandomOrder(model.CATALOG, Math.random) : null;
      render();
    }));
  }
~~~

- [ ] **Step 4: Commit the shell**

~~~powershell
git add ingles/recursos/grammar-grill.html ingles/recursos/grammar-grill.css ingles/recursos/grammar-grill.js
git commit -m "feat: add Grammar Grill kiosk shell"
~~~

### Task 4: Complete catalog, cart, validation and success

**Files:**
- Modify: ingles/recursos/grammar-grill.js
- Test: scripts/test-grammar-grill.cjs

- [ ] **Step 1: Add cart mutations and submission**

~~~js
function addLine(productId, size) {
  const item = model.CATALOG.find((entry) => entry.id === productId);
  const cleanSize = item.requiresSize ? size : null;
  const existing = state.cart.items.find((line) => line.productId === productId && line.size === cleanSize);
  if (existing) existing.quantity += 1;
  else state.cart.items.push({ productId, size:cleanSize, quantity:1 });
  state.feedback = [];
  render();
}

function changeQuantity(productId, size, delta) {
  const line = state.cart.items.find((entry) => entry.productId === productId && entry.size === size);
  if (!line) return;
  line.quantity += delta;
  if (line.quantity <= 0) state.cart.items = state.cart.items.filter((entry) => entry !== line);
  state.feedback = [];
  render();
}

function submitOrder() {
  if (!state.cart.items.length) {
    state.feedback = ['Your order is empty. Add at least one item.'];
    announce(state.feedback[0]);
    render();
    return;
  }
  if (state.role === 'delivery') {
    const result = model.compareOrders(state.target, state.cart);
    state.feedback = result.feedback;
    state.success = result.matches;
    announce(result.matches ? 'Order ready!' : result.feedback.join('. '));
  } else {
    state.feedback = [];
    state.success = true;
    announce('Order created!');
  }
  render();
  if (state.success) launchConfetti();
}
~~~

- [ ] **Step 2: Implement renderKiosk**

~~~js
function priceFor(item, size) {
  return item.prices[item.requiresSize ? size : 'default'];
}

function renderProduct(item) {
  const actions = item.requiresSize
    ? Object.keys(item.prices).map((size) =>
        '<button class="size-button" data-add="' + item.id + '" data-size="' + size + '">' +
          size[0].toUpperCase() + size.slice(1) + ' · ' + money(item.prices[size]) +
        '</button>'
      ).join('')
    : '<button class="primary" data-add="' + item.id + '" data-size="">ADD · ' + money(item.prices.default) + '</button>';
  return '<article class="product-card"><div class="food-art food-art--' + item.category + '" aria-hidden="true"></div>' +
    (item.featured ? '<span class="featured">★ MOST ORDERED</span>' : '') +
    '<h3>' + item.name + '</h3><p>' + item.description + '</p><div class="product-actions">' + actions + '</div></article>';
}

function renderCartLines(interactive) {
  if (!state.cart.items.length) return '<p class="empty">Your order is empty.</p>';
  return '<ul class="cart-lines">' + state.cart.items.map((line) => {
    const item = model.CATALOG.find((entry) => entry.id === line.productId);
    const controls = interactive
      ? '<span class="stepper"><button data-change="-1" data-id="' + line.productId + '" data-size="' + (line.size || '') + '">−</button>' +
        '<b>' + line.quantity + '</b><button data-change="1" data-id="' + line.productId + '" data-size="' + (line.size || '') + '">+</button></span>'
      : '<b>× ' + line.quantity + '</b>';
    return '<li class="cart-line"><span>' + (line.size ? line.size[0].toUpperCase() + line.size.slice(1) + ' ' : '') + item.name +
      '<small>' + money(priceFor(item, line.size) * line.quantity) + '</small></span>' + controls + '</li>';
  }).join('') + '</ul>';
}

function renderTicket() {
  if (!state.target) return '';
  return '<section class="ticket" aria-labelledby="ticket-title"><p>GRAMMAR GRILL · ORDER TICKET</p>' +
    '<h2 id="ticket-title">Prepare this order</h2><ul class="ticket-lines">' +
    state.target.items.map((line) => '<li>' + model.labelLine(line, model.CATALOG) + '</li>').join('') +
    '</ul></section>';
}

function renderKiosk() {
  const categories = ['burgers','sides','drinks','combos'];
  const tabs = categories.map((category) =>
    '<button class="tab' + (state.category === category ? ' active' : '') + '" data-category="' + category + '">' +
      category.toUpperCase() + '</button>'
  ).join('');
  const products = model.CATALOG.filter((item) => item.category === state.category).map(renderProduct).join('');
  const feedback = state.feedback.length
    ? '<ul class="feedback">' + state.feedback.map((message) => '<li>' + message + '</li>').join('') + '</ul>'
    : '';
  app.innerHTML = '<section class="kiosk" aria-labelledby="kiosk-title"><div class="kiosk-head">' +
    '<div><p>' + (state.role === 'customer' ? 'CUSTOMER' : 'DELIVERY CREW') + '</p><h1 id="kiosk-title">' +
    (state.role === 'customer' ? 'Create your order' : 'Prepare the ticket') + '</h1></div></div>' +
    '<div class="kiosk-grid"><div class="catalog"><nav class="tabs" aria-label="Menu categories">' + tabs + '</nav>' +
    '<div class="products">' + products + '</div></div><aside class="kiosk-side">' + renderTicket() +
    '<section class="cart"><h2>My order</h2>' + renderCartLines(true) + feedback +
    '<p class="cart-total"><span>Total</span><b>' + money(model.calculateTotal(state.cart, model.CATALOG)) + '</b></p>' +
    '<button class="primary submit-order" id="submit-order">' + (state.role === 'customer' ? 'CREATE ORDER' : 'CHECK ORDER') +
    '</button></section></aside></div></section>';

  app.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
    state.category = button.dataset.category;
    render();
  }));
  app.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => {
    addLine(button.dataset.add, button.dataset.size || null);
  }));
  app.querySelectorAll('[data-change]').forEach((button) => button.addEventListener('click', () => {
    changeQuantity(button.dataset.id, button.dataset.size || null, Number(button.dataset.change));
  }));
  document.getElementById('submit-order').addEventListener('click', submitOrder);
}
~~~

- [ ] **Step 3: Implement success and confetti**

~~~js
function launchConfetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.getElementById('confetti');
  const colors = ['#c8102e','#ffbc0d','#39a96b','#f2f0ec'];
  layer.innerHTML = Array.from({ length:72 }, (_, index) =>
    '<i style="left:' + Math.random()*100 + '%;background:' + colors[index%colors.length] +
    ';--drift:' + ((Math.random()-.5)*240) + 'px;animation-delay:' + Math.random()*.35 + 's"></i>'
  ).join('');
  window.setTimeout(() => { layer.innerHTML = ''; }, 2100);
}

function renderSuccess() {
  const customer = state.role === 'customer';
  app.innerHTML = '<section class="success" aria-labelledby="success-title"><div class="success-mark">✓</div>' +
    '<p>GRAMMAR GRILL</p><h1 id="success-title">' + (customer ? 'ORDER CREATED!' : 'ORDER READY!') + '</h1>' +
    '<p>' + (customer ? 'Your order has been created.' : 'You prepared the ticket correctly.') + '</p>' +
    renderCartLines(false) +
    '<p>Total · ' + money(model.calculateTotal(state.cart, model.CATALOG)) + '</p>' +
    '<div class="actions"><button class="primary" id="another-order">' +
    (customer ? 'CREATE ANOTHER ORDER' : 'PREPARE ANOTHER ORDER') +
    '</button><button class="secondary" id="change-role">BACK TO ROLE SELECT</button></div></section>';

  document.getElementById('another-order').addEventListener('click', () => {
    state.cart = { items:[] };
    state.feedback = [];
    state.success = false;
    state.target = customer ? null : model.createRandomOrder(model.CATALOG, Math.random);
    render();
  });
  document.getElementById('change-role').addEventListener('click', resetState);
}
~~~

- [ ] **Step 4: Finish the render entry point**

~~~js
function render() {
  if (state.success) renderSuccess();
  else if (!state.role) renderRoleSelect();
  else renderKiosk();
  const heading = app.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll:true });
  }
}

document.getElementById('reset-app').addEventListener('click', resetState);
render();
}());
~~~

- [ ] **Step 5: Run tests and commit**

~~~powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/test-grammar-grill.cjs
git diff --check -- ingles/recursos/grammar-grill.html ingles/recursos/grammar-grill.css ingles/recursos/grammar-grill.js ingles/recursos/grammar-grill-model.js
git add ingles/recursos/grammar-grill.html ingles/recursos/grammar-grill.css ingles/recursos/grammar-grill.js ingles/recursos/grammar-grill-model.js scripts/test-grammar-grill.cjs
git commit -m "feat: make Grammar Grill orders interactive"
~~~

Expected: model test passes and diff check is silent.

### Task 5: Publish the resource

**Files:**
- Modify: ingles/recursos.json

- [ ] **Step 1: Add this object as the first resource**

~~~json
{
  "id": "grammar-grill",
  "icono": "▦",
  "titulo": "Grammar Grill · kiosco de pedidos",
  "descripcion": "Practica en inglés como cliente o prepara exactamente la orden del ticket en este restaurante de autoservicio.",
  "url": "recursos/grammar-grill.html"
}
~~~

- [ ] **Step 2: Validate the registry**

~~~powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('ingles/recursos.json','utf8'));const r=d.recursos.find(x=>x.id==='grammar-grill');if(!r||r.url!=='recursos/grammar-grill.html')process.exit(1);console.log('resource registry: PASS')"
~~~

Expected: resource registry: PASS.

- [ ] **Step 3: Commit**

~~~powershell
git add ingles/recursos.json
git commit -m "feat: publish Grammar Grill resource"
~~~

### Task 6: Verify both roles end to end

**Files:**
- Modify if a verified defect exists: ingles/recursos/grammar-grill.css
- Modify if a verified defect exists: ingles/recursos/grammar-grill.js
- Test: scripts/test-grammar-grill.cjs

- [ ] **Step 1: Verify Customer at 1440×900 and 390×844**

At each viewport: choose Customer, add Big Mac, Medium Fries and two Small Sodas, confirm total $165, create order, assert ORDER CREATED!, create another order and assert the cart is empty. Confirm there are no page errors or horizontal overflow.

- [ ] **Step 2: Verify Delivery failure and success**

Choose Delivery Crew. Submit an incomplete attempt and assert concrete feedback. Build the exact visible ticket using catalog controls. Submit and assert ORDER READY!. Prepare another order and assert the ticket changes and cart clears.

- [ ] **Step 3: Verify accessibility**

Using keyboard only, enter both roles, change tabs, add sized and unsized products, change quantity and submit. Confirm focus moves to each current screen heading, aria-live announces results, and reduced-motion mode creates no confetti.

- [ ] **Step 4: Run the final commands**

~~~powershell
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/test-grammar-grill.cjs
& 'C:\Users\Usuario\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -e "const fs=require('fs');JSON.parse(fs.readFileSync('ingles/recursos.json','utf8'));console.log('resource JSON: PASS')"
git diff --check -- ingles/recursos.json ingles/recursos/grammar-grill.html ingles/recursos/grammar-grill.css ingles/recursos/grammar-grill.js ingles/recursos/grammar-grill-model.js scripts/test-grammar-grill.cjs
~~~

Expected: both checks pass and diff check is silent.

- [ ] **Step 5: Commit verified fixes if the browser checks required changes**

~~~powershell
git add ingles/recursos.json ingles/recursos/grammar-grill.html ingles/recursos/grammar-grill.css ingles/recursos/grammar-grill.js ingles/recursos/grammar-grill-model.js scripts/test-grammar-grill.cjs
git commit -m "fix: polish Grammar Grill kiosk experience"
~~~
