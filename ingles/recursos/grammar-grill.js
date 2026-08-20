(function () {
  'use strict';

  const model = window.GrammarGrillModel;
  const app = document.getElementById('app');
  const status = document.getElementById('sr-status');
  const categories = ['burgers', 'sides', 'drinks', 'combos'];
  const sizes = ['small', 'medium', 'large'];

  const state = {
    role: null,
    category: 'burgers',
    cart: { items: [] },
    target: null,
    ticketNumber: null,
    feedback: [],
    success: false,
    phraseCheck: null,   // { productId, size, options, correct, wrongPick }
    phraseScore: { correct: 0, attempts: 0 }
  };

  function money(value) {
    return '$' + value.toLocaleString('en-US');
  }

  function titleCase(value) {
    return value[0].toUpperCase() + value.slice(1);
  }

  function announce(message) {
    status.textContent = '';
    window.setTimeout(() => { status.textContent = message; }, 20);
  }

  function newTicketNumber() {
    return String(100 + Math.floor(Math.random() * 900));
  }

  function resetState() {
    Object.assign(state, {
      role: null,
      category: 'burgers',
      cart: { items: [] },
      target: null,
      ticketNumber: null,
      feedback: [],
      success: false,
      phraseCheck: null,
      phraseScore: { correct: 0, attempts: 0 }
    });
    render(true);
  }

  function startRole(role) {
    state.role = role;
    state.category = 'burgers';
    state.cart = { items: [] };
    state.feedback = [];
    state.success = false;
    state.phraseCheck = null;
    state.phraseScore = { correct: 0, attempts: 0 };
    state.target = role === 'delivery'
      ? model.createRandomOrder(model.CATALOG, Math.random)
      : null;
    state.ticketNumber = role === 'delivery' ? newTicketNumber() : null;
    render(true);
  }

  function renderRoleSelect() {
    app.innerHTML =
      '<section class="role-screen" aria-labelledby="role-title">' +
        '<div class="role-intro">' +
          '<p class="eyebrow">WELCOME TO GRAMMAR GRILL</p>' +
          '<h1 class="display" id="role-title">Choose your role</h1>' +
          '<p class="lead">Practice ordering food or prove you can prepare exactly what the ticket says.</p>' +
        '</div>' +
        '<div class="role-grid">' +
          '<button class="role-card" type="button" data-role="customer">' +
            '<span class="role-label">CUSTOMER</span><span class="role-icon" aria-hidden="true">01</span>' +
            '<strong>I\'m ordering food</strong><small>Explore the menu and create any order you like.</small>' +
          '</button>' +
          '<button class="role-card" type="button" data-role="delivery">' +
            '<span class="role-label">DELIVERY CREW</span><span class="role-icon" aria-hidden="true">02</span>' +
            '<strong>I\'m preparing an order</strong><small>Read the ticket and build it exactly. No guessing.</small>' +
          '</button>' +
        '</div>' +
      '</section>';

    app.querySelectorAll('[data-role]').forEach((button) => {
      button.addEventListener('click', () => startRole(button.dataset.role));
    });
  }

  // arte placeholder por categoría — hasta tener fotos reales del menú,
  // un emoji grande basta y no distrae de la parte que importa (la frase)
  const FOOD_EMOJI = {
    hamburger:'🍔', cheeseburger:'🍔', 'big-mac':'🍔', 'quarter-pounder':'🍔', mcchicken:'🍗',
    fries:'🍟', 'apple-slices':'🍎', soda:'🥤', coffee:'☕', 'bottled-water':'💧',
    'big-mac-combo':'🍔', 'quarter-pounder-combo':'🍔', 'mcchicken-combo':'🍗'
  };
  function foodArt(item) {
    const emoji = FOOD_EMOJI[item.id] || '🍽️';
    return '<span class="food-emoji" aria-hidden="true">' + emoji + '</span>';
  }

  function priceFor(item, size) {
    return item.prices[item.requiresSize ? size : 'default'];
  }

  function renderProduct(item) {
    // los botones ya no agregan directo — abren primero el reto de
    // la frase (data-order en vez de data-add). "ADD" sin decir nada
    // en inglés no enseña nada; esto convierte cada click en una
    // producción de lenguaje real, tomada del vocabulario del deck.
    const actions = item.requiresSize
      ? sizes.map((size) =>
          '<button class="size-button" type="button" data-order="' + item.id + '" data-size="' + size + '" ' +
          'aria-label="Order ' + titleCase(size) + ' ' + item.name + '">' +
          size[0].toUpperCase() + ' · ' + money(item.prices[size]) + '</button>'
        ).join('')
      : '<button class="primary" type="button" data-order="' + item.id + '" data-size="" ' +
        'aria-label="Order ' + item.name + '">ORDER IT · ' + money(item.prices.default) + '</button>';

    return '<article class="product-card">' +
      (item.featured ? '<span class="featured">★ MOST ORDERED</span>' : '') +
      '<div class="food-art">' + foodArt(item) + '</div>' +
      '<h3>' + item.name + '</h3><p>' + item.description + '</p>' +
      '<div class="product-actions">' + actions + '</div>' +
      '</article>';
  }

  // paso 1: antes de agregar, el jugador debe elegir la frase correcta
  // para pedir ese producto — mismo vocabulario que el diálogo modelo
  // de Sesión 5 ("I'd like a...", "Can I get a...", "as a combo?")
  function openPhraseCheck(productId, size) {
    const item = model.CATALOG.find((entry) => entry.id === productId);
    const cleanSize = item.requiresSize ? size : null;
    const { correct, options } = model.phraseOptionsFor(item, cleanSize, Math.random);
    state.phraseCheck = { productId, size: cleanSize, item, correct, options, wrongPick: null };
    render(false);
  }

  function closePhraseCheck() {
    state.phraseCheck = null;
    render(false);
  }

  function resolvePhrase(picked) {
    const check = state.phraseCheck;
    if (!check) return;
    state.phraseScore.attempts += 1;
    if (picked === check.correct) {
      state.phraseScore.correct += 1;
      addLine(check.productId, check.size);
      state.phraseCheck = null;
      announce('Correct! Added ' + (check.size ? titleCase(check.size) + ' ' : '') + check.item.name);
      render(false);
    } else {
      check.wrongPick = picked;
      announce('Not quite — try again.');
      render(false);
    }
  }

  function addLine(productId, size) {
    const item = model.CATALOG.find((entry) => entry.id === productId);
    const cleanSize = item.requiresSize ? size : null;
    const existing = state.cart.items.find(
      (line) => line.productId === productId && line.size === cleanSize
    );
    if (existing) existing.quantity += 1;
    else state.cart.items.push({ productId, size: cleanSize, quantity: 1 });
    state.feedback = [];
  }

  function changeQuantity(productId, size, delta) {
    const line = state.cart.items.find(
      (entry) => entry.productId === productId && entry.size === size
    );
    if (!line) return;
    line.quantity += delta;
    if (line.quantity <= 0) {
      state.cart.items = state.cart.items.filter((entry) => entry !== line);
    }
    state.feedback = [];
    render(false);
  }

  function renderCartLines(interactive) {
    if (!state.cart.items.length) return '<p class="empty">Your order is empty.</p>';

    return '<ul class="cart-lines">' + state.cart.items.map((line) => {
      const item = model.CATALOG.find((entry) => entry.id === line.productId);
      const lineName = (line.size ? titleCase(line.size) + ' ' : '') + item.name;
      const controls = interactive
        ? '<span class="stepper">' +
            '<button type="button" data-change="-1" data-id="' + line.productId + '" data-size="' + (line.size || '') + '" aria-label="Remove one ' + lineName + '">−</button>' +
            '<b>' + line.quantity + '</b>' +
            '<button type="button" data-change="1" data-id="' + line.productId + '" data-size="' + (line.size || '') + '" aria-label="Add one ' + lineName + '">+</button>' +
          '</span>'
        : '<b>× ' + line.quantity + '</b>';

      return '<li class="cart-line"><span>' + lineName +
        '<small>' + money(priceFor(item, line.size) * line.quantity) + '</small></span>' +
        controls + '</li>';
    }).join('') + '</ul>';
  }

  function renderTicket() {
    if (!state.target) return '';

    return '<section class="ticket" aria-labelledby="ticket-title">' +
      '<div class="ticket-meta"><span>GRAMMAR GRILL</span><span>ORDER #' + state.ticketNumber + '</span></div>' +
      '<h2 id="ticket-title">Prepare this order</h2>' +
      '<p class="ticket-note">Select every item, size and quantity shown below.</p>' +
      '<ul class="ticket-lines">' +
      state.target.items.map((line) => '<li>' + model.labelLine(line, model.CATALOG) + '</li>').join('') +
      '</ul></section>';
  }

  function submitOrder() {
    if (!state.cart.items.length) {
      state.feedback = ['Your order is empty. Add at least one item.'];
      announce(state.feedback[0]);
      render(false);
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

    render(state.success);
    if (state.success) launchConfetti();
  }

  // el reto de frase, como overlay: se ve la tarjeta del producto
  // detrás para que quede claro qué se está pidiendo, y las opciones
  // dan feedback inmediato (verde/rojo) sin perder el progreso
  function renderPhraseModal() {
    const check = state.phraseCheck;
    if (!check) return '';

    const optionsHtml = check.options.map((text) => {
      let cls = 'phrase-option';
      if (check.wrongPick) {
        if (text === check.correct) cls += ' right';
        else if (text === check.wrongPick) cls += ' wrong';
      }
      return '<button type="button" class="' + cls + '" data-phrase="' + encodeURIComponent(text) + '">' +
        text + '</button>';
    }).join('');

    return '<div class="phrase-overlay" role="dialog" aria-modal="true" aria-labelledby="phrase-title">' +
      '<div class="phrase-card">' +
        '<p class="eyebrow">SAY IT TO ORDER</p>' +
        '<h2 id="phrase-title">How do you ask for ' +
          (check.size ? 'a ' + titleCase(check.size) + ' ' : 'a ') + check.item.name + '?</h2>' +
        '<div class="phrase-options">' + optionsHtml + '</div>' +
        (check.wrongPick ? '<p class="phrase-hint">Not quite — listen to the pattern and try the right one.</p>' : '') +
        '<button type="button" class="phrase-cancel" id="phrase-cancel">‹ Back to menu</button>' +
      '</div>' +
    '</div>';
  }

  function wirePhraseModal() {
    const overlay = document.querySelector('.phrase-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('[data-phrase]').forEach((button) => {
      button.addEventListener('click', () => resolvePhrase(decodeURIComponent(button.dataset.phrase)));
    });
    const cancel = document.getElementById('phrase-cancel');
    if (cancel) cancel.addEventListener('click', closePhraseCheck);
  }

  function renderKiosk() {
    const tabs = categories.map((category) =>
      '<button class="tab' + (state.category === category ? ' active' : '') + '" type="button" ' +
      'data-category="' + category + '" aria-pressed="' + (state.category === category) + '">' +
      category.toUpperCase() + '</button>'
    ).join('');

    const products = model.CATALOG
      .filter((item) => item.category === state.category)
      .map(renderProduct)
      .join('');

    const feedback = state.feedback.length
      ? '<ul class="feedback" aria-label="Check your order">' +
        state.feedback.map((message) => '<li>' + message + '</li>').join('') + '</ul>'
      : '';

    const scorePill = '<span class="score-pill" title="Phrases you got right on the first try">' +
      '<i></i>' + state.phraseScore.correct + '/' + state.phraseScore.attempts + ' PHRASES' +
      '</span>';

    app.innerHTML =
      '<section class="kiosk" aria-labelledby="kiosk-title">' +
        '<div class="kiosk-head"><div><p class="eyebrow">' +
          (state.role === 'customer' ? 'CUSTOMER MODE' : 'DELIVERY CREW MODE') +
          '</p><h1 id="kiosk-title">' +
          (state.role === 'customer' ? 'Create your order' : 'Prepare the ticket') +
          '</h1></div><span class="mode-pill"><i></i>KIOSK OPEN</span>' + scorePill + '</div>' +
        '<div class="kiosk-grid">' +
          '<div class="catalog"><nav class="tabs" aria-label="Menu categories">' + tabs + '</nav>' +
            '<div class="products">' + products + '</div></div>' +
          '<aside class="kiosk-side">' + renderTicket() +
            '<section class="cart" aria-labelledby="cart-title"><h2 id="cart-title">My order</h2>' +
              renderCartLines(true) + feedback +
              '<p class="cart-total"><span>Total</span><b>' +
                money(model.calculateTotal(state.cart, model.CATALOG)) +
              '</b></p>' +
              '<button class="primary submit-order" id="submit-order" type="button">' +
                (state.role === 'customer' ? 'CREATE ORDER' : 'CHECK ORDER') +
              '</button>' +
            '</section>' +
          '</aside>' +
        '</div>' +
      '</section>' +
      renderPhraseModal();

    app.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        state.category = button.dataset.category;
        render(false);
      });
    });
    app.querySelectorAll('[data-order]').forEach((button) => {
      button.addEventListener('click', () => {
        openPhraseCheck(button.dataset.order, button.dataset.size || null);
      });
    });
    wirePhraseModal();
    app.querySelectorAll('[data-change]').forEach((button) => {
      button.addEventListener('click', () => {
        changeQuantity(
          button.dataset.id,
          button.dataset.size || null,
          Number(button.dataset.change)
        );
      });
    });
    document.getElementById('submit-order').addEventListener('click', submitOrder);
  }

  function renderSuccess() {
    const customer = state.role === 'customer';
    app.innerHTML =
      '<section class="success" aria-labelledby="success-title">' +
        '<div class="success-mark" aria-hidden="true">✓</div>' +
        '<p class="eyebrow">GRAMMAR GRILL</p>' +
        '<h1 class="display" id="success-title">' +
          (customer ? 'ORDER CREATED!' : 'ORDER READY!') +
        '</h1>' +
        '<p class="lead">' +
          (customer ? 'Your order has been created.' : 'You prepared the ticket correctly.') +
        '</p>' +
        '<div class="success-summary">' + renderCartLines(false) +
          '<p class="success-total"><span>Total</span><b>' +
            money(model.calculateTotal(state.cart, model.CATALOG)) +
          '</b></p></div>' +
        '<div class="actions">' +
          '<button class="primary" id="another-order" type="button">' +
            (customer ? 'CREATE ANOTHER ORDER' : 'PREPARE ANOTHER ORDER') +
          '</button>' +
          '<button class="secondary" id="change-role" type="button">BACK TO ROLE SELECT</button>' +
        '</div>' +
      '</section>';

    document.getElementById('another-order').addEventListener('click', () => {
      state.cart = { items: [] };
      state.category = 'burgers';
      state.feedback = [];
      state.success = false;
      if (!customer) {
        state.target = model.createRandomOrder(model.CATALOG, Math.random);
        state.ticketNumber = newTicketNumber();
      }
      render(true);
    });
    document.getElementById('change-role').addEventListener('click', resetState);
  }

  function launchConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.getElementById('confetti');
    const colors = ['#c8102e', '#ffbc0d', '#39a96b', '#f2f0ec'];
    layer.innerHTML = Array.from({ length: 72 }, (_, index) =>
      '<i style="left:' + (Math.random() * 100) + '%;background:' +
      colors[index % colors.length] + ';--drift:' + ((Math.random() - .5) * 240) +
      'px;animation-delay:' + (Math.random() * .35) + 's"></i>'
    ).join('');
    window.setTimeout(() => { layer.innerHTML = ''; }, 2100);
  }

  function render(focusHeading) {
    if (state.success) renderSuccess();
    else if (!state.role) renderRoleSelect();
    else renderKiosk();

    if (focusHeading) {
      const heading = app.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }

  document.getElementById('reset-app').addEventListener('click', resetState);
  render(true);
}());
