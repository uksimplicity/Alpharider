const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { deliveryContacts } = require('../src/lib/delivery-contacts.ts');
const { openDeliveryConversation, sendConversationMessage, markConversationRead } = require('../src/lib/delivery-chat.ts');
const originalFetch = global.fetch, originalStorage = global.localStorage;
let requests;
beforeEach(() => {
  requests = [];
  global.localStorage = { getItem: key => key === 'alpharider_token' ? 'synthetic-token' : null };
  global.fetch = async (url, init) => {
    requests.push({ path: new URL(url).pathname, auth: init.headers.Authorization, method: init.method, body: init.body && JSON.parse(init.body) });
    return new Response(JSON.stringify({ success: true, data: { id: 'conversation/1', type: 'delivery', context_id: 'delivery-1' } }), { status: 200 });
  };
});
afterEach(() => { global.fetch = originalFetch; global.localStorage = originalStorage; });

test('marketplace contacts display separate buyer and seller fields and never use the buyer as pickup seller', () => {
  const contacts = deliveryContacts({ source: 'marketplace', seller_name: 'Seller Ada', seller_phone: '+2348000000001', buyer: { first_name: 'Buyer', last_name: 'Emeka', phone: '+2348000000002' } });
  assert.equal(contacts.pickup.name, 'Seller Ada');
  assert.equal(contacts.pickup.phone, '+2348000000001');
  assert.equal(contacts.dropoff.name, 'Buyer Emeka');
  assert.equal(contacts.dropoff.phone, '+2348000000002');
  const missing = deliveryContacts({ source: 'marketplace', customer: { name: 'Only buyer', phone: '+2348000000002' } });
  assert.equal(missing.pickup.name, ''); assert.equal(missing.pickup.phone, '');
  assert.equal(missing.dropoff.name, 'Only buyer'); assert.equal(missing.dropoff.phone, '+2348000000002');
});

test('order contacts, nested user details and structured pickup contacts remain readable', () => {
  const nested = deliveryContacts({ source: 'marketplace', seller: {}, seller_name: '', order: { seller: { user: { first_name: 'Real', last_name: 'Seller', phone_number: '08000000001' } }, buyer: { name: 'Real buyer', phone: '08000000002' } } });
  assert.equal(nested.pickup.name, 'Real Seller'); assert.equal(nested.pickup.phone, '08000000001');
  assert.equal(nested.dropoff.name, 'Real buyer'); assert.equal(nested.dropoff.phone, '08000000002');
  const structured = deliveryContacts({ pickup_contact: { name: 'Pickup person', phone: '08000000003' }, dropoff_contact: '08000000004' });
  assert.equal(structured.pickup.name, 'Pickup person'); assert.equal(structured.pickup.phone, '08000000003');
  assert.equal(structured.dropoff.phone, '08000000004');
  assert.equal(deliveryContacts({ customer_id: '00000000-0000-0000-0000-000000000000' }).pickup.name, '');
});

test('names are resolved from nested buyer and seller profiles with Marketplace field casing', () => {
  const contacts = deliveryContacts({
    source: 'marketplace', pickup_contact: '+2348000000001', dropoff_contact: '08000000002',
    Seller: { Name: '', User: { Profile: { firstName: 'Ada', lastName: 'Seller' } } },
    Order: { Buyer: { name: '', profile: { user: { FirstName: 'Emeka', LastName: 'Buyer' } } } },
  });
  assert.equal(contacts.pickup.name, 'Ada Seller');
  assert.equal(contacts.dropoff.name, 'Emeka Buyer');
  assert.equal(contacts.pickup.phone, '+2348000000001');
  assert.equal(contacts.dropoff.phone, '08000000002');
  const aliases = deliveryContacts({ seller_name: '', sellerName: 'Actual seller', buyer: {}, buyer_profile: { data: { profile: { fullName: 'Actual buyer' } } } });
  assert.equal(aliases.pickup.name, 'Actual seller');
  assert.equal(aliases.dropoff.name, 'Actual buyer');
});

test('nested contact names never come from the rider or the opposite party', () => {
  const contacts = deliveryContacts({ source: 'marketplace', rider: { profile: { name: 'Rider name' } }, buyer: { profile: { name: 'Buyer name' } }, seller: { products: [{ name: 'Product name' }] } });
  assert.equal(contacts.pickup.name, '');
  assert.equal(contacts.dropoff.name, 'Buyer name');
  const cyclic = {}; cyclic.profile = cyclic;
  assert.equal(deliveryContacts({ source: 'marketplace', seller: cyclic }).pickup.name, '');
});

test('rider delivery chat uses the documented context payload and authenticated message/read endpoints', async () => {
  const id = await openDeliveryConversation('delivery-1');
  await sendConversationMessage(id, '  Arriving at pickup  ');
  await markConversationRead(id);
  assert.deepEqual(requests.map(r => r.path), ['/api/v1/chat/conversations', '/api/v1/chat/conversations/conversation%2F1/messages', '/api/v1/chat/conversations/conversation%2F1/read']);
  assert.deepEqual(requests[0].body, { type: 'delivery', context_id: 'delivery-1' });
  assert.deepEqual(requests[1].body, { body: 'Arriving at pickup' });
  assert.ok(requests.every(r => r.method === 'POST' && r.auth === 'Bearer synthetic-token'));
});

test('denied chat creation stays denied without alternate participants or endpoints', async () => {
  let calls = 0;
  global.fetch = async () => { calls++; return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 }); };
  await assert.rejects(openDeliveryConversation('delivery-1'), error => error.status === 403);
  assert.equal(calls, 1);
});

test('a mismatched conversation is rejected and empty messages never post', async () => {
  global.fetch = async () => new Response(JSON.stringify({ data: { id: 'wrong', type: 'delivery', context_id: 'different-delivery' } }), { status: 200 });
  await assert.rejects(openDeliveryConversation('delivery-1'), /could not be confirmed/);
  await assert.rejects(sendConversationMessage('thread', '  '), /Enter a message/);
  assert.equal(requests.length, 0);
});
