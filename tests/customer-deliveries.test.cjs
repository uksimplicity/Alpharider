const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { customerDelivery, customerDeliveryGroup, loadCustomerDeliveries, loadCustomerDelivery } = require('../src/lib/customer-deliveries.ts');
const originalFetch = global.fetch, originalStorage = global.localStorage;
afterEach(() => { global.fetch = originalFetch; global.localStorage = originalStorage; });
const json = (data, status = 200) => new Response(JSON.stringify({ success: true, data }), { status });
function fixture(list = []) {
  global.localStorage = { getItem: () => 'customer-token' };
  global.fetch = async (url, init) => {
    assert.equal(init.headers.Authorization, 'Bearer customer-token');
    return url.endsWith('/user/profile') ? json({ id: 'customer-1' }) : json({ deliveries: list });
  };
}

test('customer history excludes other customers and legacy passenger requests', async () => {
  fixture([
    { id: 'own', customer_id: 'customer-1', status: 'requested' },
    { id: 'foreign', customer_id: 'customer-2', status: 'requested' },
    { id: 'ride', customer_id: 'customer-1', notes: 'Ride type: Basic' },
  ]);
  assert.deepEqual((await loadCustomerDeliveries()).map(item => item.id), ['own']);
});

test('missing customer identity is an explicit history error, not an empty list', async () => {
  for (const customer_id of ['', '00000000-0000-0000-0000-000000000000', undefined]) {
    fixture([{ id: 'bad', customer_id }]);
    await assert.rejects(loadCustomerDeliveries(), /customer ownership/);
  }
});

test('denied customer history preserves backend status and does not try alternative endpoints', async () => {
  fixture(); let calls = 0;
  global.fetch = async url => {
    calls++;
    return url.endsWith('/user/profile') ? json({ id: 'customer-1' }) : new Response(JSON.stringify({ success: false, error: 'Insufficient permissions' }), { status: 403 });
  };
  await assert.rejects(loadCustomerDeliveries(), error => error.status === 403 && /permissions/.test(error.message));
  assert.equal(calls, 2);
});

test('history validates pagination and rejects repeated delivery records', async () => {
  fixture(); const calls = [], page = Array.from({ length: 100 }, (_, i) => ({ id: `d${i}`, customer_id: 'customer-1' }));
  global.fetch = async url => {
    if (url.endsWith('/user/profile')) return json({ id: 'customer-1' });
    calls.push(url); return json({ deliveries: page });
  };
  await assert.rejects(loadCustomerDeliveries(), /did not advance/);
  assert.ok(calls[1].endsWith('offset=100'));
});

test('an account change during history loading discards previous-account data', async () => {
  fixture(); let token = 'old'; global.localStorage = { getItem: () => token };
  global.fetch = async () => { token = 'new'; return json({ id: 'customer-1' }); };
  await assert.rejects(loadCustomerDeliveries(), /account changed/);
});

test('customer detail reads the customer endpoint and rejects a mismatched returned ID', async () => {
  fixture(); global.fetch = async (url, init) => {
    assert.ok(url.endsWith('/rider-app/deliveries/job%2F1'));
    assert.equal(init.headers.Authorization, 'Bearer customer-token');
    return json({ delivery: { id: 'job/1', status: 'on_the_way' } });
  };
  assert.equal((await loadCustomerDelivery('job/1')).status, 'on_the_way');
  global.fetch = async () => json({ delivery: { id: 'wrong' } });
  await assert.rejects(loadCustomerDelivery('job/1'), /different or unreadable/);
});

test('missing fields stay explicit while a reported zero fee remains zero', () => {
  const delivery = customerDelivery({ id: 'd1', delivery_number: '', reference: '', pickup_address: '', fee: 0 });
  assert.equal(delivery.reference, 'd1');
  assert.equal(delivery.pickup, 'Pickup not reported');
  assert.equal(delivery.destination, 'Destination not reported');
  assert.equal(delivery.fee, 0);
  assert.equal(delivery.riderId, '');
  assert.equal(delivery.paymentStatus, '');
});

test('unknown states are separated from active deliveries and completed history', () => {
  assert.equal(customerDeliveryGroup('requested'), 'active');
  assert.equal(customerDeliveryGroup('on_the_way'), 'active');
  for (const status of ['completed', 'delivered', 'cancelled', 'expired']) assert.equal(customerDeliveryGroup(status), 'history');
  assert.equal(customerDeliveryGroup(''), 'unknown');
  assert.equal(customerDeliveryGroup('unrecognized'), 'unknown');
});
