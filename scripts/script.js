/* =====================================================================
   DE TU MENTE AL MUNDO — "El hilo de luz"  ·  JS narrativo (reescrito)
   Preloader · cursor · smooth scroll (Lenis) · split de texto ·
   hilo de progreso · escena anclada · scroll horizontal · embudo ·
   botón magnético · captación de leads -> WhatsApp.
   ===================================================================== */

// === CONFIG =========================================================
// TODO: confirmar lada. México = 52; algunos móviles viejos requieren 521.
const WHATSAPP_NUMBER = '526221424577'; // 52 + 6221424577

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

    if (RM || !window.gsap) {
        pre.classList.add('done');
        pre.style.display = 'none';
        onDone();
        return;
    }

    document.body.classList.add('is-locked');
    const spans = pre.querySelectorAll('.pre-line span');
    const bar = pre.querySelector('.pre-bar i');
    const count = pre.querySelector('.pre-count');
    const counter = { v: 0 };

    const tl = gsap.timeline({ onComplete: () => { pre.classList.add('done'); document.body.classList.remove('is-locked'); onDone(); } });
    tl.to(spans, { yPercent: -100, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.1)
      .to(bar, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.2)
      .to(counter, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: () => { if (count) count.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0.2)
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.25')
      .set(pre, { display: 'none' });
}

/* ===================================================================
   CURSOR CUSTOM
   =================================================================== */
function initCursor() {
    if (RM || !isDesktop() || 'ontouchstart' in window) return;
    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; }, { passive: true });

    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();

    document.querySelectorAll('a, button, .magnetic, input, textarea, [data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
}

/* ===================================================================
   NAVBAR
   =================================================================== */
function initNavbar() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let last = 0;
    const onScroll = () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 24);
        if (y > last && y > 300) nav.classList.add('hidden-up');
        else nav.classList.remove('hidden-up');
        last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ===================================================================
   MENÚ MÓVIL
   =================================================================== */
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
            if (lenis) lenis.scrollTo(target, { offset: -70 });
            else target.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
        });
    });
}

/* ===================================================================
   SPLIT DE TEXTO (palabras en máscara)
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
    // El hero lo maneja revealHero(); el resto entra con scrub
    const reveals = document.querySelectorAll('.reveal:not(.hero-in)');

    if (RM || !hasGSAP()) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
        // marcar contenedores que dependen de pin como fallback estático
        document.querySelectorAll('.scene').forEach((s) => s.classList.add('no-pin'));
        document.querySelectorAll('.h-scroll').forEach((s) => s.classList.add('no-pin'));
        runFunnel(true);
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('gsap-ready');

    // Reveal genérico ATADO AL SCROLL (scrub bidireccional): cada bloque
    // sube y aparece según tu posición de scroll, y se "rebobina" al subir.
    reveals.forEach((el) => {
        gsap.fromTo(el,
            { y: 60, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 60%', scrub: true } });
    });

    // Titulares palabra por palabra, con stagger atado al scroll
    document.querySelectorAll('.split-words').forEach((el) => {
        const words = splitWords(el);
        gsap.fromTo(words, { yPercent: 110 },
            { yPercent: 0, ease: 'none', stagger: 0.06,
              scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 55%', scrub: true } });
    });

    // Parallax por capas
    document.querySelectorAll('[data-parallax]').forEach((el) => {
        gsap.to(el, { yPercent: parseFloat(el.dataset.parallax) || -10, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Blindados: si uno falla, no tumba a los demás
    [initThread, initHeroExit, initBgShift, initProblemScene, initHorizontalPlan, initSystemScene, initStakesScene, initFunnelTrigger]
        .forEach((fn) => { try { fn(); } catch (e) { console.warn('[scroll init]', fn.name, e); } });

    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ===================================================================
   HELPERS de escena: barra de progreso + contador (reusable)
   =================================================================== */
function addSceneRail(pinEl, total) {
    const rail = document.createElement('div'); rail.className = 'scene-rail';
    const fill = document.createElement('div'); fill.className = 'scene-rail-fill';
    rail.appendChild(fill);
    const count = document.createElement('div'); count.className = 'scene-count';
    const pad = (n) => String(n).padStart(2, '0');
    count.innerHTML = `<b>01</b> &mdash; ${pad(total)}`;
    pinEl.appendChild(rail); pinEl.appendChild(count);
    return {
        update: (progress, index) => {
            fill.style.width = Math.max(0, Math.min(1, progress)) * 100 + '%';
            if (typeof index === 'number') count.innerHTML = `<b>${pad(index + 1)}</b> &mdash; ${pad(total)}`;
        },
    };
}

/* ===================================================================
   HERO: salida cinematográfica (sube y se desvanece con el scroll)
   =================================================================== */
function initHeroExit() {
    const hero = document.getElementById('inicio');
    if (!hero) return;
    const content = hero.querySelector('.container-page');
    if (!content) return;
    gsap.to(content, { y: -90, autoAlpha: 0.0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'center top', end: 'bottom top', scrub: true } });
}

/* ===================================================================
   CONTINUIDAD DE FONDO: el body cambia de tono entre capítulos
   =================================================================== */
function initBgShift() {
    const warm = '#0d0b08';   // cálido (capítulos emocionales)
    const cold = '#08080a';   // base
    const set = (c) => gsap.to(document.body, { backgroundColor: c, ease: 'none', duration: 0.6, overwrite: 'auto' });
    [['#historia', warm], ['#equipo', warm], ['#comunidad', warm]].forEach(([sel, color]) => {
        const el = document.querySelector(sel); if (!el) return;
        ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 40%',
            onEnter: () => set(color), onEnterBack: () => set(color),
            onLeave: () => set(cold), onLeaveBack: () => set(cold) });
    });
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
            onUpdate: (self) => {
                const p = self.progress * 100;
                fill.style.height = p + '%';
                if (head) head.style.top = p + '%';
            },
        });
    }

    if (tagWrap && chapters.length) {
        chapters.forEach((sec) => {
            ScrollTrigger.create({
                trigger: sec, start: 'top center', end: 'bottom center',
                onToggle: (self) => { if (self.isActive) {
                    tagWrap.innerHTML = `<b>${sec.dataset.num || ''}</b>&nbsp;&nbsp;${sec.dataset.chapter}`;
                } },
            });
        });
    }
}

/* ===================================================================
   ESCENA ANCLADA — EL PROBLEMA
   =================================================================== */
function initProblemScene() {
    const scene = document.getElementById('scene-problema');
    if (!scene || !isDesktop()) { if (scene) scene.classList.add('no-pin'); return; }
    const pin = scene.querySelector('.scene-pin');
    const beats = Array.from(scene.querySelectorAll('.scene-beat'));
    if (!pin || !beats.length) return;

    const rail = addSceneRail(pin, beats.length);
    let current = -1;
    const setActive = (idx) => {
        if (idx === current) return;
        current = idx;
        beats.forEach((b, i) => b.classList.toggle('active', i === idx));
    };
    setActive(0);

    ScrollTrigger.create({
        trigger: scene, start: 'top top', end: '+=' + (beats.length * 100) + '%',
        pin: pin, scrub: true, anticipatePin: 1,
        onUpdate: (self) => {
            const idx = Math.min(beats.length - 1, Math.floor(self.progress * beats.length));
            setActive(idx);
            rail.update(self.progress, idx);
        },
    });
}

/* ===================================================================
   SCROLL HORIZONTAL — EL PLAN
   =================================================================== */
function initHorizontalPlan() {
    const wrap = document.getElementById('plan');
    if (!wrap || !isDesktop()) { if (wrap) wrap.classList.add('no-pin'); return; }
    const pin = wrap.querySelector('.h-pin');
    const track = wrap.querySelector('.h-track');
    if (!pin || !track) return;

    const panels = wrap.querySelectorAll('.h-panel').length || 3;
    const rail = addSceneRail(pin, panels);
    // recorrido horizontal real (cuánto viaja el track de izq. a der.)
    const distance = () => track.scrollWidth - window.innerWidth + 120;
    // recorrido vertical de scroll: más largo que el horizontal => sensación
    // pausada y cinematográfica (antes era 1:1 y se sentía muy breve)
    const scrollLen = () => distance() * 2.4;
    gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top top', end: () => '+=' + scrollLen(),
            pin: pin, scrub: 1, invalidateOnRefresh: true,
            // mientras el plan está anclado, ocultamos el indicador vertical
            // global para que no se encime con la tarjeta de la derecha
            onToggle: (self) => document.body.classList.toggle('section-pinned', self.isActive),
            onUpdate: (self) => rail.update(self.progress, Math.min(panels - 1, Math.floor(self.progress * panels))) },
    });
}

/* ===================================================================
   EL SISTEMA — media pegajosa (embudo) + pasos que se encienden
   =================================================================== */
function initSystemScene() {
    const section = document.getElementById('sistema');
    if (!section) return;
    const steps = Array.from(section.querySelectorAll('.sys-step'));
    const liquid = section.querySelector('.funnel-liquid');
    if (!steps.length) return;

    if (!isDesktop()) {
        steps.forEach((s) => s.classList.add('active'));
        if (liquid) liquid.style.height = '90%';
        return;
    }

    let active = -1;
    const setActive = (idx) => {
        if (idx === active) return;
        active = idx;
        steps.forEach((s, i) => s.classList.toggle('active', i <= idx));
        if (liquid) gsap.to(liquid, { height: ((idx + 1) / steps.length) * 100 + '%', duration: 0.5, ease: 'power2.out' });
    };

    steps.forEach((step, i) => {
        ScrollTrigger.create({ trigger: step, start: 'top 68%', end: 'bottom 50%',
            onEnter: () => setActive(i), onEnterBack: () => setActive(i) });
    });
    setActive(0);
}

/* ===================================================================
   EN JUEGO — las dos columnas entran desde lados opuestos
   =================================================================== */
function initStakesScene() {
    const sec = document.getElementById('stakes');
    if (!sec || !isDesktop()) return;
    const fail = sec.querySelector('.stake-fail');
    const win = sec.querySelector('.stake-win');
    const st = { trigger: sec, start: 'top 78%', end: 'top 42%', scrub: true };
    if (fail) gsap.fromTo(fail, { x: -70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'none', scrollTrigger: st });
    if (win) gsap.fromTo(win, { x: 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'none', scrollTrigger: st });
}

/* ===================================================================
   EMBUDO — EL SISTEMA
   =================================================================== */
function runFunnel(staticMode) {
    const wrap = document.getElementById('funnel');
    if (!wrap) return;
    const layer = wrap.querySelector('.funnel-particles');
    if (!layer) return;
    layer.innerHTML = '';

    // De cada lote que "entra", la mayoría es rechazada (gris) y pocos pasan (oro).
    const total = 9;
    for (let i = 0; i < total; i++) {
        const p = document.createElement('span');
        const pass = i % 3 === 0;                 // ~1 de cada 3 pasa
        p.className = 'funnel-particle' + (pass ? '' : ' reject');
        p.style.left = (15 + Math.random() * 70) + '%';
        layer.appendChild(p);

        if (staticMode || RM || !window.gsap) {
            p.style.top = pass ? '92%' : '46%';
            p.style.opacity = pass ? '1' : '0.35';
            continue;
        }
        const tl = gsap.timeline({ repeat: -1, delay: i * 0.45 });
        if (pass) {
            tl.fromTo(p, { top: '-4%', left: p.style.left, opacity: 0 }, { opacity: 1, duration: 0.2 })
              .to(p, { top: '94%', left: '50%', duration: 2.4, ease: 'power1.in' })
              .to(p, { opacity: 0, duration: 0.3 });
        } else {
            tl.fromTo(p, { top: '-4%', opacity: 0 }, { opacity: 0.6, duration: 0.2 })
              .to(p, { top: (38 + Math.random() * 12) + '%', duration: 1.1, ease: 'power1.in' })
              .to(p, { opacity: 0, x: (Math.random() > 0.5 ? 40 : -40), duration: 0.5 });
        }
    }
}
function initFunnelTrigger() {
    const wrap = document.getElementById('funnel');
    if (!wrap) return;
    ScrollTrigger.create({ trigger: wrap, start: 'top 70%', once: true, onEnter: () => runFunnel(false) });
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
            el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.35}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
        });
        wrap.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

/* ===================================================================
   CAPTACIÓN DE LEADS -> WHATSAPP
   =================================================================== */
function initLeadForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

    const setStatus = (msg, type) => { if (statusEl) { statusEl.textContent = msg; statusEl.className = `form-status show ${type}`; } };
    const fieldErr = (name, msg) => {
        const input = form.elements[name];
        const errEl = form.querySelector(`[data-error-for="${name}"]`);
        if (input) input.classList.toggle('invalid', !!msg);
        if (errEl) errEl.textContent = msg || '';
    };
    ['nombre', 'mensaje', 'ayuda'].forEach((n) => { const i = form.elements[n]; if (i) i.addEventListener('input', () => fieldErr(n, '')); });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.elements['website'] && form.elements['website'].value) { setStatus('Gracias, recibí tu mensaje.', 'success'); form.reset(); return; }

        const nombre = form.elements['nombre'].value.trim();
        const mensaje = form.elements['mensaje'].value.trim();
        const ayuda = form.elements['ayuda'] ? form.elements['ayuda'].value.trim() : '';

        let ok = true;
        if (nombre.length < 2) { fieldErr('nombre', 'Dime cómo te llamas.'); ok = false; } else fieldErr('nombre', '');
        if (mensaje.length < 5) { fieldErr('mensaje', 'Cuéntame un poco más.'); ok = false; } else fieldErr('mensaje', '');
        if (!ok) { setStatus('Revisa los campos marcados.', 'error'); return; }

        if (submitBtn) submitBtn.classList.add('loading');
        if (submitLabel) submitLabel.innerHTML = '<span class="spinner"></span>&nbsp; Abriendo WhatsApp…';

        const lines = ['Hola, quiero reservar mi lugar en la masterclass De tu mente al mundo.', '', `Nombre: ${nombre}`, `A qué me dedico / mi idea: ${mensaje}`];
        if (ayuda) lines.push(`En qué me puedes ayudar: ${ayuda}`);
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

        setTimeout(() => {
            const win = window.open(url, '_blank');
            if (submitBtn) submitBtn.classList.remove('loading');
            if (submitLabel) submitLabel.textContent = 'Enviar por WhatsApp';
            if (win) { setStatus('Listo. Sigamos la conversación en WhatsApp.', 'success'); form.reset(); }
            else { setStatus('Tu navegador bloqueó la ventana. Toca aquí para abrir WhatsApp.', 'error'); if (statusEl) { statusEl.style.cursor = 'pointer'; statusEl.onclick = () => { window.location.href = url; }; } }
        }, 450);
    });
}

/* ===================================================================
   AÑO
   =================================================================== */
function initYear() { const el = document.getElementById('year'); if (el) el.textContent = new Date().getFullYear(); }

/* ===================================================================
   REVELADO DEL HERO (tras preloader)
   =================================================================== */
function revealHero() {
    const heroLines = document.querySelectorAll('.hero-title .line-inner');
    if (RM || !window.gsap || heroLines.length === 0) { document.querySelectorAll('.hero-in').forEach((el) => el.classList.add('is-in')); return; }
    const tl = gsap.timeline();
    tl.to(heroLines, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.12 })
      .add(() => document.querySelectorAll('.hero-in').forEach((el) => el.classList.add('is-in')), '-=0.55');
}

/* ===================================================================
   INIT
   =================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Ocultar líneas del hero para revelarlas al terminar el preloader
    if (window.gsap && !RM) gsap.set('.hero-title .line-inner', { yPercent: 110 });

    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initCursor();
    initMagneticButtons();
    initLeadForm();
    initYear();

    runPreloader(() => {
        revealHero();
        initScrollAnimations();
    });
});

window.addEventListener('load', () => { if (hasGSAP()) ScrollTrigger.refresh(); });
