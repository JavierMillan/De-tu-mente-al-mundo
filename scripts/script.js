/* =====================================================================
   DE TU MENTE AL MUNDO — "La hamburguesa que no pediste"  ·  JS
   Preloader · cursor · Lenis · split de texto · hilo de progreso ·
   FIRMA: la hamburguesa se arma capa por capa (cada capa = un acto) ·
   countdown a la masterclass · botón magnético · CTA grupo WhatsApp.
   ===================================================================== */

// === CONFIG =========================================================
// Primera sesión de la masterclass (la que alimenta el countdown).
// 26 jun 2026, 7:30 PM, hora del centro de México (UTC-6, sin DST).
const MASTERCLASS_DATE = new Date('2026-06-26T19:30:00-06:00');

// Grupos de WhatsApp — UNO POR HORARIO.
// TODO: pegar aquí los enlaces reales de invitación cuando se creen los grupos.
const WHATSAPP_GROUP_26 = 'https://chat.whatsapp.com/KdxeIeohnrp3v8hJHzU68J';   // Jueves 26 jun · 7:30 PM
const WHATSAPP_GROUP_27 = 'https://chat.whatsapp.com/CqCcTClOV2zHMI2QQ4y2VI';  // Viernes 27 jun · 11:00 AM
// Fallback mientras no existan los grupos: mensaje directo, indicando el horario elegido.
const waFallback = (horario) => 'https://wa.me/526221424577?text=' +
    encodeURIComponent(`Hola, quiero apartar mi lugar en la masterclass "Por qué nadie te escribe" — horario: ${horario}.`);

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => window.innerWidth >= 860;
const hasGSAP = () => !!(window.gsap && window.ScrollTrigger);

let lenis = null;

/* ===================================================================
   PRELOADER
   =================================================================== */
function runPreloader(onDone) {
    const pre = document.getElementById('preloader');
    if (!pre) { onDone(); return; }

    // Garantiza que el sitio SIEMPRE se desbloquee, aunque la animación falle.
    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        pre.classList.add('done');
        pre.style.display = 'none';
        document.body.classList.remove('is-locked');
        onDone();
    };

    if (RM || !window.gsap) { finish(); return; }

    document.body.classList.add('is-locked');
    const spans = pre.querySelectorAll('.pre-line span');
    const bar = pre.querySelector('.pre-bar i');
    const count = pre.querySelector('.pre-count');
    const counter = { v: 0 };

    // Red de seguridad: si la timeline no termina en 4.5s (pestaña en 2º plano,
    // GSAP atascado, rAF throttled…), forzamos la entrada de todos modos.
    const safety = setTimeout(finish, 4500);

    const tl = gsap.timeline({ onComplete: () => { clearTimeout(safety); finish(); } });
    tl.to(spans, { yPercent: -100, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.1)
      .to(bar, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.2)
      .to(counter, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => { if (count) count.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0.2)
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.25');
}

/* ===================================================================
   CURSOR
   =================================================================== */
function initCursor() {
    if (RM || !isDesktop() || 'ontouchstart' in window) return;
    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; }, { passive: true });
    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
    document.querySelectorAll('a, button, .magnetic, input, textarea, [data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
}

/* ===================================================================
   NAVBAR · MENÚ MÓVIL
   =================================================================== */
function initNavbar() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let last = 0;
    const onScroll = () => {
        const y = scrollY;
        nav.classList.toggle('scrolled', y > 24);
        if (y > last && y > 300) nav.classList.add('hidden-up'); else nav.classList.remove('hidden-up');
        last = y;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}
function initMobileMenu() {
    const btn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => { const o = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ===================================================================
   SMOOTH SCROLL (Lenis) + anclas
   =================================================================== */
function initSmoothScroll() {
    if (!RM && window.Lenis) {
        lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1 });
        if (hasGSAP()) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((t) => lenis.raf(t * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }
    }
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            if (lenis) lenis.scrollTo(target, { offset: -68 });
            else target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
        });
    });
}

/* ===================================================================
   SPLIT DE TEXTO
   =================================================================== */
function splitWords(el) {
    if (el.dataset.split === 'done') return el.querySelectorAll('.word-inner');
    const text = el.textContent;
    el.textContent = '';
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((chunk) => {
        if (chunk.trim() === '') { frag.appendChild(document.createTextNode(chunk)); return; }
        const mask = document.createElement('span'); mask.className = 'word-mask';
        const inner = document.createElement('span'); inner.className = 'word-inner';
        inner.textContent = chunk; mask.appendChild(inner); frag.appendChild(mask);
    });
    el.appendChild(frag);
    el.dataset.split = 'done';
    return el.querySelectorAll('.word-inner');
}

/* ===================================================================
   ANIMACIONES DE SCROLL
   =================================================================== */
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal:not(.hero-in)');

    if (RM || !hasGSAP()) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
        document.querySelectorAll('.assembler').forEach((s) => s.classList.add('no-pin'));
        revealBurgerStatic();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('gsap-ready');

    reveals.forEach((el) => {
        gsap.fromTo(el, { y: 56, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 62%', scrub: true } });
    });

    document.querySelectorAll('.split-words').forEach((el) => {
        const words = splitWords(el);
        gsap.fromTo(words, { yPercent: 110 },
            { yPercent: 0, ease: 'none', stagger: 0.06,
              scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 55%', scrub: true } });
    });

    [initThread, initHeroExit, initBgShift, initBurgerAssembler]
        .forEach((fn) => { try { fn(); } catch (e) { console.warn('[scroll init]', fn.name, e); } });

    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ===================================================================
   HERO: salida cinematográfica
   =================================================================== */
function initHeroExit() {
    const hero = document.getElementById('inicio');
    if (!hero) return;
    const content = hero.querySelector('.wrap');
    const burger = hero.querySelector('.hero-burger');
    if (content) gsap.to(content, { y: -90, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'center top', end: 'bottom top', scrub: true } });
    if (burger) gsap.to(burger, { y: 120, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
}

/* ===================================================================
   CONTINUIDAD DE FONDO entre tonos (sutil; las clases ya pintan el grueso)
   =================================================================== */
function initBgShift() {
    // El body es carbón; las secciones .on-light pintan su propio fondo.
    // Aquí solo damos un empujón de calidez al cruzar la sección mago/clic.
    return;
}

/* ===================================================================
   HILO DE LUZ + INDICADOR DE CAPÍTULO
   =================================================================== */
function initThread() {
    const fill = document.querySelector('.thread-fill');
    const head = document.querySelector('.thread-head');
    const tagWrap = document.querySelector('.chapter-tag');
    const chapters = Array.from(document.querySelectorAll('[data-chapter]'));

    if (fill) {
        ScrollTrigger.create({
            trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true,
            onUpdate: (self) => { const p = self.progress * 100; fill.style.height = p + '%'; if (head) head.style.top = p + '%'; },
        });
    }
    if (tagWrap && chapters.length) {
        chapters.forEach((sec) => {
            ScrollTrigger.create({ trigger: sec, start: 'top center', end: 'bottom center',
                onToggle: (self) => { if (self.isActive) tagWrap.innerHTML = `<b>${sec.dataset.num || ''}</b>&nbsp;&nbsp;${sec.dataset.chapter}`; } });
        });
    }
}

/* ===================================================================
   FIRMA — LA HAMBURGUESA SE ARMA (cada capa = un acto)
   =================================================================== */
function initBurgerAssembler() {
    const scene = document.getElementById('arma');
    // El pin funciona en todas las pantallas; el layout (lado-a-lado vs
    // apilado vertical) lo decide el CSS. Solo se desactiva sin GSAP / RM.
    if (!scene) return;

    const pin = scene.querySelector('.assembler-pin');
    const acts = Array.from(scene.querySelectorAll('.act'));
    // capas ordenadas por data-layer (0 = pan de arriba, cae primero)
    const layers = Array.from(scene.querySelectorAll('.layer'))
        .sort((a, b) => (+a.dataset.layer) - (+b.dataset.layer));
    if (!pin || !acts.length || !layers.length) { scene.classList.add('no-pin'); revealBurgerStatic(); return; }

    const N = acts.length; // 4 capas = 4 actos

    // Estado inicial: cada capa arriba y transparente; se "deja caer" por scroll.
    layers.forEach((ly) => gsap.set(ly, { yPercent: -260, autoAlpha: 0 }));

    // riel de progreso + contador
    const rail = document.createElement('div'); rail.className = 'assembler-rail';
    const railFill = document.createElement('div'); railFill.className = 'assembler-rail-fill';
    rail.appendChild(railFill);
    const count = document.createElement('div'); count.className = 'assembler-count';
    const pad = (n) => String(n).padStart(2, '0');
    count.innerHTML = `<b>01</b> &mdash; ${pad(N)}`;
    pin.appendChild(rail); pin.appendChild(count);

    let current = -1;
    const setAct = (idx) => {
        if (idx === current) return;
        current = idx;
        acts.forEach((a, i) => a.classList.toggle('active', i === idx));
        count.innerHTML = `<b>${pad(idx + 1)}</b> &mdash; ${pad(N)}`;
    };
    setAct(0);

    // Timeline atada al scroll: por cada "tramo" cae una capa y cambia el acto.
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: scene, start: 'top top', end: '+=' + (N * 105) + '%',
            pin: pin, scrub: 0.6, anticipatePin: 1,
            onToggle: (self) => document.body.classList.toggle('section-pinned', self.isActive),
            onUpdate: (self) => {
                railFill.style.width = (self.progress * 100) + '%';
                const idx = Math.min(N - 1, Math.floor(self.progress * N + 0.0001));
                setAct(idx);
            },
        },
    });
    layers.forEach((ly) => {
        tl.to(ly, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.5)' })
          .to(ly, { duration: 0.3 }); // respiro entre capas
    });
}

// Fallback estático (mobile / sin GSAP / reduce-motion): hamburguesa armada y actos visibles
function revealBurgerStatic() {
    document.querySelectorAll('#arma .layer').forEach((ly) => { ly.style.transform = 'none'; ly.style.opacity = '1'; });
    document.querySelectorAll('#arma .act').forEach((a) => a.classList.add('active'));
}

/* ===================================================================
   COUNTDOWN a la masterclass (dos relojes sincronizados)
   =================================================================== */
function initCountdown() {
    const clocks = Array.from(document.querySelectorAll('#countdown, #countdown-2'));
    if (!clocks.length) return;
    const label = document.getElementById('cd-label');

    const write = (root, d, h, m, s) => {
        const set = (k, v) => { const el = root.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = String(v).padStart(2, '0'); };
        set('days', d); set('hours', h); set('mins', m); set('secs', s);
    };

    const tick = () => {
        const diff = MASTERCLASS_DATE.getTime() - Date.now();
        if (diff <= 0) {
            clocks.forEach((c) => { c.classList.add('live'); write(c, 0, 0, 0, 0); });
            if (label) label.textContent = '¡Estamos en vivo! Entra al grupo de tu horario';
            clearInterval(timer);
            return;
        }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        clocks.forEach((c) => write(c, days, hours, mins, secs));
    };
    tick();
    const timer = setInterval(tick, 1000);
}

/* ===================================================================
   CTA grupo WhatsApp (usa link real si existe; si no, fallback DM)
   =================================================================== */
function initWhatsApp() {
    const modal = document.getElementById('horario-modal');
    if (!modal) return;
    const opt26 = document.getElementById('opt-26');
    const opt27 = document.getElementById('opt-27');

    // Asigna el link real del grupo si existe; si no, cae al DM con el horario.
    const setLink = (el, url, horario) => {
        if (!el) return;
        const valid = url && !/XXXX/.test(url);
        el.href = valid ? url : waFallback(horario);
    };
    setLink(opt26, WHATSAPP_GROUP_26, 'Jueves 26 de junio, 7:30 PM');
    setLink(opt27, WHATSAPP_GROUP_27, 'Viernes 27 de junio, 11:00 AM');

    let lastFocus = null;
    const open = () => {
        lastFocus = document.activeElement;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
        const first = modal.querySelector('.modal-opt');
        if (first) first.focus();
    };
    const close = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    document.querySelectorAll('[data-open-horario]').forEach((btn) =>
        btn.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    modal.querySelectorAll('[data-modal-close]').forEach((el) =>
        el.addEventListener('click', close));
    // al elegir un horario, cerramos el modal (el link abre en pestaña nueva)
    [opt26, opt27].forEach((o) => o && o.addEventListener('click', () => setTimeout(close, 80)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
}

/* ===================================================================
   BOTÓN MAGNÉTICO
   =================================================================== */
function initMagneticButtons() {
    if (RM || !isDesktop() || 'ontouchstart' in window) return;
    document.querySelectorAll('.magnetic').forEach((wrap) => {
        const el = wrap.querySelector('.btn') || wrap.firstElementChild;
        if (!el) return;
        wrap.addEventListener('mousemove', (e) => {
            const r = wrap.getBoundingClientRect();
            el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.32}px, ${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
        });
        wrap.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

/* ===================================================================
   AÑO · REVEAL DEL HERO
   =================================================================== */
function initYear() { const el = document.getElementById('year'); if (el) el.textContent = new Date().getFullYear(); }

function revealHero() {
    const heroLines = document.querySelectorAll('.hero-title .line-inner');
    if (RM || !window.gsap || !heroLines.length) { document.querySelectorAll('.hero-in').forEach((el) => el.classList.add('is-in')); return; }
    const tl = gsap.timeline();
    tl.to(heroLines, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.12 })
      .add(() => document.querySelectorAll('.hero-in').forEach((el) => el.classList.add('is-in')), '-=0.55');
}

/* ===================================================================
   INIT
   =================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    if (window.gsap && !RM) gsap.set('.hero-title .line-inner', { yPercent: 110 });

    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initCursor();
    initMagneticButtons();
    initCountdown();
    initWhatsApp();
    initYear();

    runPreloader(() => {
        revealHero();
        initScrollAnimations();
    });
});

addEventListener('load', () => { if (hasGSAP()) ScrollTrigger.refresh(); });
