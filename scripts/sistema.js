/* =====================================================================
   SISTEMA — lógica de la landing de servicio
   1) Calculadora del dolor: que el número lo diga el cliente, no nosotros.
   2) Formulario de precalificación por pasos → resumen a WhatsApp.
   ===================================================================== */
(function () {
    'use strict';

    var WA_NUMBER = '526221424577';

    // URL del despliegue de Google Apps Script (ver apps-script/Code.gs).
    // Mientras esté vacío no se guarda nada en Drive: el WhatsApp sigue igual.
    var APPS_SCRIPT_URL = '';

    // Lo que la calculadora midió, para que el formulario lo mande a la hoja.
    var horasMedidas = { mes: 0, anio: 0 };

    /* ---------------------------------------------------------------
       1 · CALCULADORA DEL DOLOR
       --------------------------------------------------------------- */
    var elMsgs = document.getElementById('c-msgs');
    var elMins = document.getElementById('c-mins');

    if (elMsgs && elMins) {
        var elHours = document.getElementById('c-hours');
        var elYear = document.getElementById('c-year');
        var elWeeks = document.getElementById('c-weeks');
        var elLibre = document.getElementById('c-libre');
        var elDias = document.getElementById('c-dias');
        var elVerdict = document.getElementById('c-verdict');

        var fmt = function (n, decimals) {
            return n.toLocaleString('es-MX', {
                minimumFractionDigits: decimals || 0,
                maximumFractionDigits: decimals || 0
            });
        };

        var clamp = function (v, min, max) {
            if (isNaN(v)) return min;
            return Math.min(Math.max(v, min), max);
        };

        // Lo usa el selector de mercado para mantener coherentes los precios
        // que se muestran en el HTML.
        // Lo fija el selector de mercado (bloque 4). Si no hay selector, MXN.
        var PRECIO_SISTEMA = 9500;
        window.dtmmPrecio = function (n) { PRECIO_SISTEMA = n; recalc(); };

        // Cuánto de lo repetitivo puede absorber el sistema. No es todo: las
        // preguntas de siempre y la captura de datos sí, la plática real no.
        var ABSORBE = 0.8;

        // El veredicto habla de lo que gana, no de lo que pierde: el tiempo
        // libre es el producto, la fuga es solo el síntoma.
        var verdictFor = function (horasLibresAnio) {
            if (horasLibresAnio <= 0) {
                return 'Pon tus números arriba y te decimos cuánto de tu semana se puede hacer solo.';
            }
            if (horasLibresAnio < 40) {
                return 'Con ese volumen todavía no se justifica, y preferimos decírtelo. Cuando te llegue más movimiento, esta es la primera pieza que conviene ordenar.';
            }
            if (horasLibresAnio < 150) {
                return 'Es tiempo real. Alcanza para atender mejor a los que ya te compran, o para no llevarte el trabajo a la casa el fin de semana.';
            }
            if (horasLibresAnio < 500) {
                return 'Eso ya son semanas completas al año. Tiempo para vender, para entrenar a alguien, o simplemente para no estar pegado al teléfono.';
            }
            return 'A ese volumen ya no es cuestión de organizarte mejor. O el negocio deja de depender de que tú contestes, o deja de crecer.';
        };


        var recalc = function () {
            var msgs = clamp(parseFloat(elMsgs.value), 0, 10000);
            var mins = clamp(parseFloat(elMins.value), 0, 240);

            var monthHours = (msgs * mins) / 60;
            var yearHours = monthHours * 12;
            var weeks = yearHours / 40;

            elHours.textContent = fmt(monthHours, monthHours < 10 ? 1 : 0) + (monthHours === 1 ? ' hora al mes' : ' horas al mes');
            elYear.textContent = fmt(yearHours) + ' horas';
            elWeeks.textContent = fmt(weeks, 1) + (weeks === 1 ? ' semana' : ' semanas');
            // El tiempo que el sistema puede absorber, dicho en unidades que se
            // sienten: días completos de trabajo y horas por semana. Un número de
            // horas al año no le dice nada a nadie; "12 días" sí.
            var libresMes = monthHours * ABSORBE;
            var libresAnio = yearHours * ABSORBE;
            var dias = libresAnio / 8;

            if (elLibre) elLibre.textContent = fmt(libresMes, libresMes < 10 ? 1 : 0) + (libresMes === 1 ? ' hora al mes' : ' horas al mes');
            if (elDias) elDias.textContent = fmt(dias, dias < 10 ? 1 : 0) + (dias === 1 ? ' día' : ' días');

            elVerdict.textContent = verdictFor(libresAnio);

            horasMedidas.mes = Math.round(monthHours);
            horasMedidas.anio = Math.round(yearHours);
        };

        window.dtmmRecalc = recalc;
        elMsgs.addEventListener('input', recalc);
        elMins.addEventListener('input', recalc);
        recalc();
    }

    /* ---------------------------------------------------------------
       2 · FORMULARIO DE PRECALIFICACIÓN
       --------------------------------------------------------------- */
    var form = document.getElementById('qform');
    if (!form) return;

    var steps = Array.prototype.slice.call(form.querySelectorAll('.q'));
    var btnNext = document.getElementById('qnext');
    var btnBack = document.getElementById('qback');
    var bar = document.getElementById('fbar');
    var pasos = document.getElementById('fsteps');
    var label = document.getElementById('fstep');
    var done = document.getElementById('fdone');
    var waLink = document.getElementById('wa-send');
    var nav = form.querySelector('.q-nav');

    var current = 0;
    var total = steps.length;

    var render = function () {
        steps.forEach(function (s, i) {
            s.classList.toggle('active', i === current);
        });

        var pct = ((current) / total) * 100;
        bar.style.width = pct + '%';

        // Rayitas: llenas las contestadas, tenue la actual.
        if (pasos) {
            Array.prototype.slice.call(pasos.children).forEach(function (r, i) {
                r.classList.toggle('done', i < current);
                r.classList.toggle('now', i === current);
            });
        }
        label.textContent = 'Pregunta ' + (current + 1) + ' de ' + total;

        btnBack.hidden = current === 0;
        btnNext.firstChild.nodeValue = current === total - 1 ? 'Terminar ' : 'Siguiente ';

        var field = steps[current].querySelector('.q-textarea, .q-input');
        if (field) {
            // Enfocar sin robar el scroll en móvil al entrar a la sección.
            window.setTimeout(function () { field.focus({ preventScroll: true }); }, 120);
        }
    };

    var valuesOf = function (step) {
        return Array.prototype.slice.call(step.querySelectorAll('[data-name]')).map(function (f) {
            return { name: f.getAttribute('data-name'), value: (f.value || '').trim() };
        });
    };

    var validate = function () {
        var step = steps[current];
        var err = step.querySelector('.q-err');
        var fields = valuesOf(step);
        var ok = fields.every(function (f) { return f.value.length > 0; });

        err.classList.toggle('show', !ok);
        if (!ok) {
            var first = step.querySelector('[data-name]');
            if (first && !first.value.trim()) first.focus();
        }
        return ok;
    };

    var collect = function () {
        var out = {};
        steps.forEach(function (s) {
            valuesOf(s).forEach(function (f) { out[f.name] = f.value; });
        });
        return out;
    };

    // El mensaje es un aviso, no un expediente: las respuestas completas quedan
    // en la hoja de Drive. Aquí solo va lo necesario para abrir la conversación
    // sin tener que leer nada.
    var recorta = function (texto, max) {
        var t = (texto || '').replace(/\s+/g, ' ').trim();
        return t.length > max ? t.slice(0, max - 1).trim() + '\u2026' : t;
    };

    var buildMessage = function (data) {
        var lines = ['Hola, ya llené las 7 preguntas en la página.', ''];

        lines.push('*Soy:* ' + (data.nombre || ''));
        if (data.giro) lines.push('*Mi negocio:* ' + recorta(data.giro, 90));
        if (data.manual) lines.push('*Lo que hago a mano:* ' + recorta(data.manual, 110));
        if (data.volumen) lines.push('*Volumen:* ' + recorta(data.volumen, 60));

        if (horasMedidas.anio > 0) {
            lines.push('*Según la calculadora:* ' + horasMedidas.anio + ' horas al año');
        }

        lines.push('');
        lines.push('Lo demás ya se los mandé completo desde la página.');
        return lines.join('\n');
    };

    // Respaldo en Drive. Va en no-cors: no podemos leer la respuesta, pero
    // tampoco necesitamos bloquear al cliente esperándola.
    var guardarEnDrive = function (data) {
        if (!APPS_SCRIPT_URL) return;
        try {
            window.fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    nombre: data.nombre || '',
                    tel: data.tel || '',
                    giro: data.giro || '',
                    canal: data.canal || '',
                    proceso: data.proceso || '',
                    manual: data.manual || '',
                    repetidas: data.repetidas || '',
                    volumen: data.volumen || '',
                    horasMes: horasMedidas.mes || '',
                    horasAnio: horasMedidas.anio || '',
                    origen: 'sistema.html'
                })
            }).catch(function () { /* sin conexión: el WhatsApp sigue funcionando */ });
        } catch (e) { /* fetch bloqueado: no rompemos el flujo */ }
    };

    var finish = function () {
        var data = collect();
        var msg = buildMessage(data);

        waLink.setAttribute('href', 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg));

        // Las respuestas completas se van a la hoja; el WhatsApp solo avisa.
        guardarEnDrive(data);

        form.style.display = 'none';
        document.getElementById('fprog').style.display = 'none';
        done.classList.add('show');
        bar.style.width = '100%';

        // Guardar localmente por si cierra WhatsApp sin enviar.
        try {
            window.localStorage.setItem('dtmm_diag', JSON.stringify({ at: Date.now(), data: data }));
        } catch (e) { /* modo privado o storage bloqueado: seguimos igual */ }
    };

    btnNext.addEventListener('click', function () {
        if (!validate()) return;
        if (current === total - 1) { finish(); return; }
        current += 1;
        render();
    });

    btnBack.addEventListener('click', function () {
        if (current === 0) return;
        current -= 1;
        render();
    });

    // Enter avanza en campos de una línea; en textarea deja escribir saltos.
    form.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        if (e.target.tagName === 'TEXTAREA' && !e.metaKey && !e.ctrlKey) return;
        e.preventDefault();
        btnNext.click();
    });

    // Limpiar el error en cuanto empieza a escribir.
    form.addEventListener('input', function (e) {
        if (!e.target.matches('[data-name]')) return;
        var err = steps[current].querySelector('.q-err');
        if (err) err.classList.remove('show');
    });

    render();
})();

/* =====================================================================
   3 · BARRA DE CTA — aparece al pasar el hero, se esconde al llegar al
   formulario. Se actualiza por rAF mientras la pestaña está visible, y
   además con listeners de scroll/resize: el navegador congela rAF en
   pestañas de fondo, y con Lenis el evento 'scroll' no siempre dispara.
   Entre los dos, siempre queda uno vivo.
   ===================================================================== */
(function () {
    'use strict';

    var bar = document.getElementById('cta-bar');
    var form = document.getElementById('diagnostico');
    var hero = document.querySelector('.hero');
    if (!bar || !form || !hero) return;

    var visible = null;
    var looping = false;

    var update = function () {
        var pasoElHero = hero.getBoundingClientRect().bottom < 0;
        var formALaVista = form.getBoundingClientRect().top < window.innerHeight - 120;
        var deberiaVerse = pasoElHero && !formALaVista;

        if (deberiaVerse !== visible) {
            visible = deberiaVerse;
            bar.classList.toggle('show', deberiaVerse);
        }
    };

    var loop = function () {
        update();
        if (looping) window.requestAnimationFrame(loop);
    };

    var startLoop = function () {
        if (looping || document.hidden) return;
        looping = true;
        window.requestAnimationFrame(loop);
    };

    var stopLoop = function () { looping = false; };

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stopLoop(); } else { startLoop(); }
        update();
    });

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    startLoop();
    update();
})();

/* =====================================================================
   4 · CAMBIO DE MERCADO (temporal)
   Mientras se decide si van dos landings separadas o una sola con
   detección de país, este botón deja al equipo ver ambas versiones.
   Los precios viven en data-mx / data-us, no aquí: así se corrigen en el
   HTML sin tocar lógica.
   ===================================================================== */
(function () {
    'use strict';

    var botones = Array.prototype.slice.call(document.querySelectorAll('.mkt-b'));
    if (!botones.length) return;

    var aplicar = function (mkt) {
        var attr = 'data-' + mkt;
        document.querySelectorAll('[data-mx][data-us]').forEach(function (el) {
            var v = el.getAttribute(attr);
            if (v) el.textContent = v;
        });
        botones.forEach(function (b) {
            var on = b.getAttribute('data-mkt') === mkt;
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        // La calculadora divide el precio entre los días recuperados: si no se
        // entera del cambio, mostraría dólares divididos entre un precio en pesos.
        if (window.dtmmPrecio) window.dtmmPrecio(mkt === 'us' ? 1497 : 9500);

        try { window.localStorage.setItem('dtmm_mkt', mkt); } catch (e) { /* storage bloqueado */ }
    };

    botones.forEach(function (b) {
        b.addEventListener('click', function () { aplicar(b.getAttribute('data-mkt')); });
    });

    // Recordar la elección entre recargas mientras el equipo lo revisa.
    var guardado = null;
    try { guardado = window.localStorage.getItem('dtmm_mkt'); } catch (e) { /* sin storage */ }
    aplicar(guardado === 'us' ? 'us' : 'mx');
})();
