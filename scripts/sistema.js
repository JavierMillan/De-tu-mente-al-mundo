/* US landing controller: language, illustrative animation and explicit request handoff. */
(function () {
  'use strict';
  const core = window.DTMMSystem;
  const WA_NUMBER = '16232399551';
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgbthSlAW4dm33eJ-djoexecT5Xfjg-Dwvl4ElYYZ4NTIciUhqY5DwKSDBJKxSnAGo/exec';
  const dialog = document.getElementById('request-dialog');
  const form = document.getElementById('request-form');
  const formView = document.getElementById('form-view');
  const previewView = document.getElementById('preview-view');
  const summary = document.getElementById('request-summary');
  const sendLink = document.getElementById('send-request');
  const smsLink = document.getElementById('send-sms');
  const isPhone = navigator.userAgentData ? navigator.userAgentData.mobile : /iPhone|Android.*Mobile/i.test(navigator.userAgent);
  smsLink.setAttribute('aria-controls', 'sms-qr-panel');
  const status = document.getElementById('send-status');
  const error = document.getElementById('form-error');
  const steps = [...form.querySelectorAll('[data-step]')];
  const language = document.querySelectorAll('[data-lang]');
  const translations = [...document.querySelectorAll('[data-es]')];
  const labels = [...document.querySelectorAll('[data-label-es]')];
  const placeholders = [...document.querySelectorAll('[data-placeholder-es]')];
  const dialogStage = document.getElementById('dialog-stage');
  translations.forEach(el => { el.dataset.en = el.innerHTML; });
  labels.forEach(el => { el.dataset.labelEn = el.getAttribute('aria-label'); });
  placeholders.forEach(el => { el.dataset.placeholderEn = el.placeholder; });
  let lang = new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : 'en';
  let step = 0;
  let opener;
  let submissionState = '';
  let submittedKey = '';
  const stageCopy = {
    en: ['First, we find where the process gets stuck.', 'Then we map where inquiries come from.', 'Then we identify what your team keeps asking.', 'Finally, we show you the message your team would receive.'],
    es: ['Primero ubicamos dónde se atasca el proceso.', 'Después ubicamos de dónde llegan las consultas.', 'Luego identificamos qué pregunta tu equipo una y otra vez.', 'Al final te mostramos el mensaje que recibiría tu equipo.']
  };
  let animationTimer;
  const copy = {
    en: {
      next: 'Continue →', preview: 'Preview my request →', step: n => `Step ${n} of 4`,
      error: 'Please complete the highlighted fields. Use a valid email address.',
      fit: 'These answers describe your workflow. We’ll confirm which rules and connections fit the US$2,500 founding scope.',
      low: 'With fewer than 10 inquiries a week, this may not be your next investment. We can review the fit before you commit.',
      sending: 'Opening your messaging app and attempting to save your request…',
      attempted: 'Finish by tapping Send in your messaging app. Your full request is included in the message.',
      failed: 'We couldn’t save the form. Your complete request is still in the prepared message—tap Send there, or copy the summary.',
      copied: 'Summary copied.', copyFailed: 'Copy wasn’t available. Select the summary above to copy it manually.',
      title: 'Stop repeating the same questions | De tu mente al mundo',
      description: 'Stop repeating the same questions. A custom page collects the details your team needs and hands each inquiry off in context. US$2,500 founding offer, one time, for 5 businesses.',
      social: 'Stop repeating the same questions.'
    },
    es: {
      next: 'Continuar →', preview: 'Ver mi solicitud →', step: n => `Paso ${n} de 4`,
      error: 'Completa los campos marcados. Usa un email válido.',
      fit: 'Estas respuestas describen tu proceso. Confirmaremos qué reglas y conexiones encajan en la oferta fundadora de US$2,500.',
      low: 'Con menos de 10 consultas por semana, quizá esta no sea tu siguiente inversión. Podemos revisar el encaje antes de contratar.',
      sending: 'Abriendo tu app de mensajes e intentando guardar tu solicitud…',
      attempted: 'Termina pulsando Enviar en tu app de mensajes. El mensaje incluye tu solicitud completa.',
      failed: 'No pudimos guardar el formulario. Tu solicitud completa sigue en el mensaje preparado: pulsa Enviar ahí o copia el resumen.',
      copied: 'Resumen copiado.', copyFailed: 'No fue posible copiar. Selecciona el resumen de arriba para copiarlo manualmente.',
      title: 'Deja de repetir las mismas preguntas | De tu mente al mundo',
      description: 'Deja de repetir las mismas preguntas. Una página recoge los datos que tu equipo necesita y entrega cada solicitud con contexto. Oferta fundadora de US$2,500, pago único, para 5 negocios.',
      social: 'Deja de repetir las mismas preguntas.'
    }
  };
  // Anonymous lifecycle hook only. No tracking service or contact data is sent here.
  function track(name) {
    window.dispatchEvent(new CustomEvent('dtmm:analytics', {detail: {event: name, language: lang, step: step + 1}}));
  }
  function values(display = false) {
    return Object.fromEntries([...form.querySelectorAll('[name]')].map(field => [field.name,
      display && field.tagName === 'SELECT' && field.value ? field.selectedOptions[0].textContent.trim() : field.value.trim()
    ]));
  }
  function resetFormScroll() {
    dialog.scrollTop = 0;
    document.querySelector('.phone-page').scrollTop = 0;
  }
  function renderStep(focus) {
    steps.forEach((el, index) => { el.hidden = index !== step; });
    document.getElementById('step-label').textContent = copy[lang].step(step + 1);
    document.getElementById('progress-fill').style.width = `${((step + 1) / 4) * 100}%`;
    document.getElementById('form-back').hidden = step === 0;
    document.getElementById('form-next').textContent = step === 3 ? copy[lang].preview : copy[lang].next;
    if (dialogStage) dialogStage.textContent = stageCopy[lang][step];
    if (focus) {
      steps[step].querySelector('input, select, textarea').focus({preventScroll: true});
      resetFormScroll();
    }
  }
  /* El costo de no hacer nada, calculado con lo que el mismo acaba de decir.
     Se actualiza al vuelo: si el numero aparece cuando ya cerro el paso, no
     lo ve. */
  const VOLUMEN_SEMANAL = {'Fewer than 10': 6, '10–30': 20, '31–100': 60, 'More than 100': 120};
  function renderRoi() {
    const box = document.getElementById('roi');
    if (!box) return;
    const industria = (document.getElementById('industry') || {}).value || '';
    const volumen = (document.getElementById('volume') || {}).value || '';
    const semanales = VOLUMEN_SEMANAL[volumen];
    const est = semanales ? core.estimateLoss(industria, semanales) : null;
    if (!est || est.mes < 500) { box.hidden = true; return; }
    const money = n => '$' + Number(n).toLocaleString('en-US');
    document.getElementById('roi-amount').textContent = money(est.mes);
    const nota = lang === 'es'
      ? 'Son ' + est.trabajosMes + ' trabajos al mes a ' + money(est.ticket) + ' cada uno. El sistema se paga con '
        + (est.mesesParaPagarse < 1 ? 'menos de un mes' : est.mesesParaPagarse + ' meses') + ' de eso.'
      : 'That is ' + est.trabajosMes + ' jobs a month at ' + money(est.ticket) + ' each. The system pays for itself with '
        + (est.mesesParaPagarse < 1 ? 'less than one month' : est.mesesParaPagarse + ' months') + ' of that.';
    document.getElementById('roi-note').textContent = nota;
    box.hidden = false;
  }

  function renderPreview() {
    document.getElementById('sms-qr-panel').hidden = true;
    smsLink.setAttribute('aria-expanded', 'false');
    const message = core.buildMessage(values(true), lang);
    summary.textContent = message;
    sendLink.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    smsLink.href = `sms:+${WA_NUMBER}${/iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(message)}`;
    document.getElementById('fit-note').textContent = values().volume === 'Fewer than 10' ? copy[lang].low : copy[lang].fit;
    status.textContent = submissionState ? copy[lang][submissionState] : '';
  }
  function setLanguage(next, changeUrl) {
    lang = next === 'es' ? 'es' : 'en';
    document.documentElement.lang = lang;
    translations.forEach(el => {
      const text = lang === 'en' ? el.dataset.en : el.dataset.es;
      el.innerHTML = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&lt;br&gt;/g, '<br>')
        // Unica etiqueta con atributo permitida: el (opcional) de las labels.
        .replace(/&lt;span class=['"]optional['"]&gt;/g, '<span class="optional">')
        .replace(/&lt;\/span&gt;/g, '</span>')
        .replace(/&lt;strong&gt;/g, '<strong>')
        .replace(/&lt;\/strong&gt;/g, '</strong>');
    });
    labels.forEach(el => el.setAttribute('aria-label', el.dataset[lang === 'es' ? 'labelEs' : 'labelEn']));
    placeholders.forEach(el => { el.placeholder = el.dataset[lang === 'es' ? 'placeholderEs' : 'placeholderEn']; });
    language.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
    document.title = copy[lang].title;
    renderRoi();
    document.querySelector('meta[name="description"]').content = copy[lang].description;
    document.querySelector('meta[property="og:title"]').content = copy[lang].social;
    document.querySelector('meta[property="og:description"]').content = copy[lang].description;
    if (changeUrl) {
      const url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url);
    }
    renderStep(false);
    if (!error.hidden) error.textContent = copy[lang].error;
    if (!previewView.hidden) renderPreview();
    document.getElementById('copy-status').textContent = '';
  }
  language.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang, true)));
  setLanguage(lang, false);
  renderRoi();

  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    dialog.showModal();
    if (previewView.hidden) renderStep(true);
    else {
      previewView.querySelector('h3').focus({preventScroll: true});
      resetFormScroll();
    }
    track('form_open');
  }));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (opener) opener.focus({preventScroll: true}); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')]
      .filter(el => el.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  document.getElementById('form-back').addEventListener('click', () => {
    if (step > 0) step--;
    error.hidden = true;
    renderStep(true);
  });
  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    event.target.removeAttribute('aria-describedby');
    error.hidden = true;
    submissionState = '';
    if (event.target.id === 'industry' || event.target.id === 'volume') renderRoi();
  });
  form.addEventListener('change', event => {
    if (event.target.id === 'industry' || event.target.id === 'volume') renderRoi();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = core.validateStep(step, values());
    steps[step].querySelectorAll('[name]').forEach(field => {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    });
    if (invalid.length) {
      error.hidden = false;
      error.textContent = copy[lang].error;
      invalid.forEach(name => {
        form.elements[name].setAttribute('aria-invalid', 'true');
        form.elements[name].setAttribute('aria-describedby', 'form-error');
      });
      form.elements[invalid[0]].focus();
      return;
    }
    error.hidden = true;
    if (step < 3) { step++; renderStep(true); track('form_step'); return; }
    formView.hidden = true;
    previewView.hidden = false;
    renderPreview();
    const heading = previewView.querySelector('h3');
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
    resetFormScroll();
    track('request_preview');
  });
  document.getElementById('edit-request').addEventListener('click', () => {
    previewView.hidden = true;
    formView.hidden = false;
    step = 0;
    renderStep(true);
  });
  [sendLink, smsLink].forEach(link => link.addEventListener('click', event => {
    if (link === smsLink && !isPhone) {
      event.preventDefault();
      const panel = document.getElementById('sms-qr-panel');
      panel.hidden = false;
      smsLink.setAttribute('aria-expanded', 'true');
      const target = document.getElementById('sms-qr');
      target.replaceChildren();
      try {
        const qr = qrcode(0, 'L');
        qr.addData(smsLink.href);
        qr.make();
        target.innerHTML = qr.createSvgTag({cellSize: 4, margin: 4, scalable: true});
        document.getElementById('sms-qr-error').hidden = true;
      } catch (_) {
        document.getElementById('sms-qr-error').hidden = false;
      }
    }
    // Default link action opens WhatsApp during the user's gesture. No automatic send.
    track(link === smsLink ? 'sms_click' : 'whatsapp_click');
    const payload = core.buildPayload(values(true), lang, location.search);
    const key = JSON.stringify(payload);
    if (key === submittedKey) return;
    submittedKey = key;
    submissionState = 'sending';
    status.textContent = copy[lang].sending;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    window.fetch(APPS_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors', credentials: 'omit',
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      body: key, signal: controller.signal, keepalive: true
    }).then(() => {
      if (submittedKey !== key) return;
      submissionState = 'attempted';
      status.textContent = copy[lang].attempted;
      track('request_delivery_attempted');
    }).catch(() => {
      if (submittedKey !== key) return;
      submittedKey = '';
      submissionState = 'failed';
      status.textContent = copy[lang].failed;
      track('request_delivery_failed');
    }).finally(() => clearTimeout(timeout));
  }));
  document.getElementById('copy-request').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary.textContent);
      document.getElementById('copy-status').textContent = copy[lang].copied;
    } catch (_) {
      document.getElementById('copy-status').textContent = copy[lang].copyFailed;
    }
  });

  const demo = document.getElementById('demo');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stageButtons = [...document.querySelectorAll('[data-demo-stage]')];
  stageButtons.forEach(button => button.addEventListener('click', () => {
    const panel = demo.children[Number(button.dataset.demoStage)];
    const left = demo.scrollLeft + panel.getBoundingClientRect().left - demo.getBoundingClientRect().left;
    demo.scrollTo({left, behavior: motion.matches ? 'instant' : 'smooth'});
  }));
  demo.addEventListener('scroll', () => {
    const left = demo.getBoundingClientRect().left;
    const distances = [...demo.children].map(panel => Math.abs(panel.getBoundingClientRect().left - left));
    const index = distances.indexOf(Math.min(...distances));
    stageButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }, {passive: true});
  function play() {
    clearTimeout(animationTimer);
    demo.classList.remove('playing');
    if (motion.matches) return;
    void demo.offsetWidth;
    demo.classList.add('playing');
    animationTimer = setTimeout(() => demo.classList.remove('playing'), 4400);
  }
  document.getElementById('replay').addEventListener('click', play);
  motion.addEventListener('change', () => { if (motion.matches) { clearTimeout(animationTimer); demo.classList.remove('playing'); } });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { play(); observer.disconnect(); }
    }, {threshold: .15});
    observer.observe(demo);
  }
})();

// El boton flotante aparece cuando el CTA del hero ya salio de pantalla.
(function () {
  const floating = document.querySelector('.global-cta');
  const heroCta = document.querySelector('.hero-actions .button.primary');
  if (!floating || !heroCta) return;
  if (!('IntersectionObserver' in window)) { floating.classList.add('is-visible'); return; }
  new IntersectionObserver(entries => {
    entries.forEach(entry => floating.classList.toggle('is-visible', !entry.isIntersecting));
  }, {threshold: 0}).observe(heroCta);
})();
