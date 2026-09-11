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
        var labels = es
            ? ['Mi negocio', 'Giro', 'Solicitudes', 'Canal', 'Volumen semanal', 'Datos necesarios', 'Criterios de encaje', 'Nombre', 'Email', 'Teléfono']
            : ['My business', 'Industry', 'Requests', 'Channel', 'Weekly volume', 'Details needed', 'Fit criteria', 'Name', 'Email', 'Phone'];
        return [es ? 'Hola, me interesa una página para mi negocio en Estados Unidos.' : 'Hi, I’m interested in a page for my US business.', '',
            es ? 'Inversión de referencia: US$2,500, pago único. Alcance por confirmar.' : 'Reference investment: US$2,500 one time. Scope to be confirmed.', '',
            ...fields.filter(function (key) { return clean(data[key]); }).map(function (key) {
                return labels[fields.indexOf(key)] + ': ' + clean(data[key]);
            })].join('\n');
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
    return { validateStep: validateStep, buildMessage: buildMessage, buildPayload: buildPayload };
});
