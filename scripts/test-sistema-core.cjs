const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('./sistema-core.js');
const sample = { business: '  Pine Studio  ', request: 'Quotes', channel: 'Website / ads', volume: '20–50 / week', details: 'Location, project, date', criteria: 'Austin only', name: 'Alex', email: 'alex@example.com', phone: '+1 555 0100' };

test('validates the step and rejects empty answers or invalid email', () => {
  assert.deepEqual(core.validateStep(0, sample), []);
  assert.ok(core.validateStep(0, {...sample, business: '   '}).includes('business'));
  assert.ok(core.validateStep(3, {...sample, email: 'alex@'}).includes('email'));
  assert.deepEqual(core.validateStep(3, {...sample, phone: ''}), []);
});
test('WhatsApp handoff contains ALL answers even if Sheets delivery fails', () => {
  const message = core.buildMessage(sample, 'en');
  for (const value of Object.values(sample)) assert.ok(message.includes(value.trim()), value);
  assert.ok(message.includes('US$2,500'));
  assert.ok(!message.includes('already received'));
  const es = core.buildMessage(sample, 'es');
  assert.ok(es.includes('CONTACTO') && es.includes('EL NEGOCIO'));
  // El telefono va arriba: quien contesta no deberia leer todo para responder.
  assert.ok(es.indexOf(sample.phone) < es.indexOf(sample.criteria));
});
test('maps the contact and screening data to the deployed Sheets contract', () => {
  const payload = core.buildPayload(sample, 'es', '?utm_source=meta&utm_campaign=us-test');
  assert.equal(payload.negocio, 'Pine Studio');
  assert.equal(payload.tel, '+1 555 0100');
  assert.equal(payload.email, 'alex@example.com');
  assert.equal(payload.criterio, 'Austin only');
  assert.equal(payload.idioma, 'es');
  assert.ok(payload.origen.includes('lang=es'));
  assert.ok(payload.origen.includes('utm_campaign=us-test'));
});
test('attribution excludes arbitrary query parameters and formula prefixes are escaped for Sheets', () => {
  const payload = core.buildPayload({...sample, business: '=IMPORTXML("x")'}, 'en', '?email=private&token=secret&utm_source=meta');
  assert.ok(payload.negocio.startsWith("'="));
  assert.ok(!payload.origen.includes('private'));
  assert.ok(!payload.origen.includes('secret'));
});

test('industry is optional: it never blocks a step and travels when present', () => {
  // Sin giro el formulario debe dejar avanzar igual.
  assert.deepEqual(core.validateStep(0, {business: 'Pine Studio', request: 'Quote requests'}), []);
  const sinGiro = core.buildPayload({business: 'Pine Studio'}, 'en', '');
  assert.equal(sinGiro.industria, '');
  // Con giro, viaja a la hoja y al mensaje.
  const conGiro = {...sample, industry: 'Roofing'};
  assert.equal(core.buildPayload(conGiro, 'en', '').industria, 'Roofing');
  assert.ok(core.buildMessage(conGiro, 'en').includes('Industry: Roofing'));
});

test('the loss estimate scales with volume instead of flattening', () => {
  // El tope viejo era de 4 trabajos fijos y aplastaba tres de las cuatro
  // opciones: 20, 60 y 120 consultas daban exactamente lo mismo.
  const a = core.estimateLoss(500, 15);
  const b = core.estimateLoss(500, 30);
  const c = core.estimateLoss(500, 60);
  assert.ok(a.mes < b.mes, 'mas volumen, mas perdida: ' + a.mes + ' vs ' + b.mes);
  assert.ok(b.mes < c.mes, 'mas volumen, mas perdida: ' + b.mes + ' vs ' + c.mes);
  // Pero nunca suelta una cifra que nadie creeria.
  const extremo = core.estimateLoss(3000, 200);
  assert.ok(extremo.mes <= 10000, 'capped: ' + extremo.mes);
  assert.equal(extremo.topado, true);
  // Sin los datos del prospecto no inventamos nada.
  assert.equal(core.estimateLoss(0, 20), null);
  assert.equal(core.estimateLoss(500, 0), null);
  // La cuenta usa el ticket recibido, no un promedio nuestro.
  assert.equal(core.estimateLoss(180, 20).mes, 779);
});
