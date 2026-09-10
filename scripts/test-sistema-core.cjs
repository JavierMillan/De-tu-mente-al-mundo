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
  assert.ok(core.buildMessage(sample, 'es').includes('Mi negocio'));
});
test('maps the contact and screening data to the deployed Sheets contract', () => {
  const payload = core.buildPayload(sample, 'es', '?utm_source=meta&utm_campaign=us-test');
  assert.equal(payload.giro, 'Pine Studio');
  assert.equal(payload.tel, '+1 555 0100');
  assert.ok(payload.proceso.includes('alex@example.com'));
  assert.ok(payload.proceso.includes('Austin only'));
  assert.ok(payload.origen.includes('lang=es'));
  assert.ok(payload.origen.includes('utm_campaign=us-test'));
});
test('attribution excludes arbitrary query parameters and formula prefixes are escaped for Sheets', () => {
  const payload = core.buildPayload({...sample, business: '=IMPORTXML("x")'}, 'en', '?email=private&token=secret&utm_source=meta');
  assert.ok(payload.giro.startsWith("'="));
  assert.ok(!payload.origen.includes('private'));
  assert.ok(!payload.origen.includes('secret'));
});
