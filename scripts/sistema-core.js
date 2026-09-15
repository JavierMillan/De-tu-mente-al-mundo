/* Pure request logic shared by the page and Node tests. */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.DTMMSystem = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    var clean = function (value) { return String(value || '').trim(); };
    var fields = ['business', 'industry', 'request', 'channel', 'volume', 'details', 'criteria', 'name', 'email', 'phone'];
    var required = [['business', 'request'], ['channel', 'volume'], ['details', 'criteria'], ['name', 'email']];
    function validateStep(step, data) {
        return required[step].filter(function (key) {
            var value = clean(data[key]);
            if (!value) return true;
            return key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        });
    }
    function buildMessage(data, lang) {
        var es = lang === 'es';
        var linea = function (etiqueta, valor) {
            return clean(valor) ? etiqueta + ': ' + clean(valor) : '';
        };
        var t = es ? {
            saludo: 'Hola, quiero una página para mi negocio en Estados Unidos.',
            contacto: 'CONTACTO', negocio: 'EL NEGOCIO', detalle: 'LO QUE NECESITA',
            nombre: 'Nombre', tel: 'Teléfono', email: 'Email', giro: 'Giro',
            queHace: 'Qué hace', solicitudes: 'Tarea manual', canal: 'Le llegan por',
            volumen: 'Volumen semanal', datos: 'Datos que pide', criterio: 'Buen cliente para él',
            cierre: 'Inversión de referencia: US$2,500, pago único. Alcance por confirmar.'
        } : {
            saludo: 'Hi, I’m interested in a page for my US business.',
            contacto: 'CONTACT', negocio: 'THE BUSINESS', detalle: 'WHAT THEY NEED',
            nombre: 'Name', tel: 'Phone', email: 'Email', giro: 'Industry',
            queHace: 'What they do', solicitudes: 'Manual task', canal: 'They arrive via',
            volumen: 'Weekly volume', datos: 'Details they ask for', criterio: 'Good client for them',
            cierre: 'Reference investment: US$2,500 one time. Scope to be confirmed.'
        };
        var partes = [t.saludo, ''];
        var seccion = function (titulo, filas) {
            var vivas = filas.filter(function (f) { return f; });
            if (!vivas.length) return;
            partes = partes.concat([titulo], vivas, ['']);
        };
        seccion(t.contacto, [
            linea(t.nombre, data.name),
            linea(t.tel, data.phone),
            linea(t.email, data.email)
        ]);
        seccion(t.negocio, [
            linea(t.queHace, data.business),
            linea(t.giro, data.industry),
            linea(t.canal, data.channel),
            linea(t.volumen, data.volume)
        ]);
        seccion(t.detalle, [
            linea(t.solicitudes, data.request),
            linea(t.datos, data.details),
            linea(t.criterio, data.criteria)
        ]);
        partes.push(t.cierre);
        return partes.join('\n');
    }
    /* El costo de no hacer nada. Deliberadamente conservador: el estudio de
       Blazeo (2026) mide 73% de citas agendadas contestando en menos de un
       minuto contra 4% pasados 30, y aqui solo asumimos recuperar el 15% de
       los leads que hoy se enfrian. Si el numero se siente inflado, el
       cliente deja de creer el resto de la pagina. */
    /* El ticket ya no lo estimamos nosotros: lo pone el prospecto. Los
       promedios por industria eran invencion nuestra y un dentista con
       ticket de $180 veia "$500" y dejaba de creer el resto de la pagina.

       El 5% recuperable si tiene respaldo. El estudio MIT/InsideSales
       (Oldroyd, 6 empresas, 15,000+ leads) midio que calificar un lead
       contestando a los 5 minutos contra 30 es 21 veces mas probable, y
       HBR (2011, 2,241 empresas auditadas) encontro 42 horas de respuesta
       promedio y 23% que nunca contestan. Recuperar 1 de cada 20 es muy
       por debajo de lo que sugieren esas cifras.

       El tope de 4 trabajos no es un dato: es un freno de credibilidad.
       Sin el, 100 consultas semanales daban cifras absurdas. */
    var RECUPERA = 0.05;
    var TOPE_TRABAJOS = 4;
    var PRECIO = 2500;

    function estimateLoss(ticketPromedio, leadsPerWeek) {
        var ticket = Number(ticketPromedio) || 0;
        var semanales = Number(leadsPerWeek) || 0;
        if (ticket <= 0 || semanales <= 0) return null;
        var mensuales = semanales * 4.33;
        var trabajos = Math.min(mensuales * RECUPERA, TOPE_TRABAJOS);
        var mes = Math.round(trabajos * ticket);
        return {
            ticket: ticket,
            trabajosMes: Math.round(trabajos * 10) / 10,
            mes: mes,
            anio: mes * 12,
            mesesParaPagarse: mes > 0 ? Math.round((PRECIO / mes) * 10) / 10 : null
        };
    }

    function sheetSafe(value) {
        var text = clean(value);
        return /^[=+@-]/.test(text) ? "'" + text : text;
    }
    function buildPayload(data, lang, search) {
        var params = new URLSearchParams(search || '');
        var attribution = new URLSearchParams({lang: lang === 'es' ? 'es' : 'en'});
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
            if (params.has(key)) attribution.set(key, params.get(key).slice(0, 160));
        });
        var payload = {
            nombre: clean(data.name), email: clean(data.email), tel: clean(data.phone),
            negocio: clean(data.business), industria: clean(data.industry),
            solicitudes: clean(data.request), canal: clean(data.channel),
            volumen: clean(data.volume), datos: clean(data.details),
            criterio: clean(data.criteria), idioma: lang === 'es' ? 'es' : 'en',
            origen: 'sistema.html?' + attribution.toString()
        };
        Object.keys(payload).forEach(function (key) {
            if (key !== 'tel') payload[key] = sheetSafe(payload[key]);
        });
        return payload;
    }
    return { validateStep: validateStep, buildMessage: buildMessage, buildPayload: buildPayload, estimateLoss: estimateLoss };
});
