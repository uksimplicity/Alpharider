const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const data = require('../src/lib/backend-data.ts');
const api = require('../src/lib/api.ts');
const rider = require('../src/lib/rider-api.ts');
const deliveries = require('../src/lib/deliveries-api.ts');
const uploads = require('../src/lib/upload-api.ts');
const user = require('../src/lib/user-api.ts');
const account = require('../src/lib/account-client.ts');
const payouts = require('../src/lib/payout-api.ts');
const auth = require('../src/lib/auth-api.ts');
const location = require('../src/lib/rider-location.ts');
const documents = require('../src/lib/rider-documents.ts');
const originalFetch = global.fetch, originalStorage = global.localStorage;
const originalNavigator = Object.getOwnPropertyDescriptor(global, 'navigator');
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
afterEach(() => { global.fetch = originalFetch; global.localStorage = originalStorage; if (originalNavigator) Object.defineProperty(global, 'navigator', originalNavigator); else delete global.navigator; });

test('profile normalizes nested user/profile responses instead of returning a blank account', async () => {
  for (const payload of [{ data: { user: { id: 'u1', first_name: 'Ada', last_name: 'Okafor', email: 'ada@example.test' } } }, { data: { profile: { user: { id: 'u1', firstName: 'Ada', lastName: 'Okafor', email: 'ada@example.test' } } } }]) {
    global.fetch = async (url, init) => { assert.ok(url.endsWith('/user/profile')); assert.equal(init.headers.Authorization, 'Bearer token'); return json(payload); };
    const profile = await user.getUserProfile('token'); assert.equal(data.profileName(profile), 'Ada Okafor'); assert.equal(profile.email, 'ada@example.test');
  }
  assert.throws(() => data.normalizeProfile({ data: { message: 'wrong shape' } }), /unreadable profile/);
});
test('availability uses real server states and never defaults an unknown response to offline', () => {
  for (const status of ['available', 'busy', 'offline']) assert.equal(data.availability({ data: { rider: { status } } }), status);
  assert.equal(data.availability({ data: { is_online: false } }), 'offline');
  assert.equal(data.availability({ data: { status: 'approved' } }), null);
});
test('unknown money stays unavailable while zero remains a real balance', () => {
  assert.equal(data.amount({ data: { balance: '0' } }), 0);
  for (const value of [null, '', true, {}, undefined]) { assert.equal(data.numeric(value), null); assert.equal(data.money(value), 'Unavailable'); }
  assert.equal(data.amount({ data: { wallet: { balance: '234.50' } } }), 234.5);
  assert.equal(data.amount({ data: { balance: 1000 } }, ['available_balance', 'available_to_withdraw']), null);
});
test('list parsing accepts explicit empty pages and rejects malformed successful responses', () => {
  for (const payload of [{ data: [] }, { data: { records: [] } }, { data: { earnings: [{ id: 'e1' }] } }]) assert.ok(Array.isArray(data.rows(payload)));
  assert.throws(() => data.rows({ success: true, data: null }), /unreadable list/);
});
test('online/offline writes use the documented endpoint once without auth-error fallbacks', async () => {
  for (const status of ['available', 'offline', 'busy']) {
    const calls = []; global.fetch = async (url, init) => { calls.push({ url, init }); return json({ success: true }); };
    await rider.updateRiderStatus('token', status); assert.equal(calls.length, 1); assert.ok(calls[0].url.endsWith('/rider/go-online')); assert.equal(calls[0].init.method, 'PUT'); assert.deepEqual(JSON.parse(calls[0].init.body), { status });
  }
  let count = 0; global.fetch = async () => { count++; return json({ error: 'KYC required' }, 403); };
  await assert.rejects(rider.updateRiderStatus('token', 'available'), /KYC required/); assert.equal(count, 1);
});
test('rider registration posts to KYC exactly once when the backend rejects it', async () => {
  const calls = []; global.fetch = async (url, init) => { calls.push({ url, init }); return json({ error: 'Service unavailable' }, 500); };
  await assert.rejects(rider.registerRider('token', { vehicle_type: 'bike', vehicle_number: 'ABC123' }), /Service unavailable/);
  assert.equal(calls.length, 1); assert.ok(calls[0].url.endsWith('/rider/kyc'));
});
test('requested deliveries use the dedicated rider route and preserve backend errors', async () => {
  let calls = 0; global.fetch = async url => { calls++; assert.ok(url.endsWith('/rider/deliveries/requested?limit=20&offset=0')); return json({ data: [] }); };
  assert.deepEqual(await deliveries.getPendingDeliveries('token'), []); assert.equal(calls, 1);
  calls = 0; global.fetch = async () => { calls++; return json({ error: 'Unavailable' }, 500); };
  await assert.rejects(deliveries.getPendingDeliveries('token'), /Unavailable/); assert.equal(calls, 1);
});
test('delivery history advances real pagination and rejects a server that repeats the same page', async () => {
  const calls = [], page = Array.from({ length: 100 }, (_, i) => ({ id: 'd' + i }));
  global.fetch = async url => { calls.push(url); return json({ data: calls.length === 1 ? page : [{ id: 'last' }] }); };
  assert.equal((await deliveries.getMyDeliveries('token')).length, 101); assert.match(calls[1], /offset=100/);
  global.fetch = async () => json({ data: page }); await assert.rejects(deliveries.getMyDeliveries('token'), /did not advance/);
});
test('delivery detail unwraps the server record and safely encodes its ID', async () => {
  global.fetch = async url => { assert.ok(url.endsWith('/rider/deliveries/job%2F1')); return json({ data: { delivery: { id: 'job/1', pickup_address: 'Airport' } } }); };
  assert.equal((await deliveries.getDeliveryById('token', 'job/1')).pickup_address, 'Airport');
});
test('delivery completion preserves the customer code and rejects unsupported states before writing', async () => {
  let count = 0; global.fetch = async (url, init) => { count++; assert.ok(url.endsWith('/rider/deliveries/job/status')); assert.deepEqual(JSON.parse(init.body), { status: 'completed', completed_code: '001234' }); return json({ success: true }); };
  await deliveries.updateDeliveryStatus('token', 'job', 'completed', '001234');
  for (const status of ['in_progress', 'declined']) assert.throws(() => deliveries.updateDeliveryStatus('token', 'job', status), /not supported/);
  assert.equal(count, 1);
});
test('uploads use backend multipart and normalize nested returned URLs', async () => {
  const file = new File(['image'], 'photo.png', { type: 'image/png' });
  global.fetch = async (url, init) => { assert.ok(url.endsWith('/upload/file')); assert.equal(init.headers.Authorization, 'Bearer token'); assert.equal(init.headers['Content-Type'], undefined); assert.equal(init.body.get('folder'), 'profiles'); return json({ data: { file: { file_url: 'https://files.example.test/photo.png', id: 'file1' } } }); };
  const result = await uploads.uploadFile('token', file, 'profiles'); assert.equal(result.url, 'https://files.example.test/photo.png');
  global.fetch = async () => json({ data: { file: {} } }); await assert.rejects(uploads.uploadFile('token', file), /usable file URL/);
});
test('HTTP 200 business failures and unreadable responses cannot be treated as successful writes', async () => {
  global.fetch = async () => json({ success: false, error: 'Account not verified' }); await assert.rejects(api.requestJson('/rider/go-online', { method: 'PUT' }), /Account not verified/);
  global.fetch = async () => new Response('<html>Sign in</html>', { status: 200 }); await assert.rejects(api.requestJson('/user/profile'), /unreadable response/);
});
test('account requests require sign in, forward only that token, and discard responses after an account switch', async () => {
  let token = ''; global.localStorage = { getItem: () => token };
  await assert.rejects(account.accountRequest('/user/profile'), /sign in/);
  token = 'one'; global.fetch = async (url, init) => { assert.equal(init.headers.Authorization, 'Bearer one'); assert.equal(init.redirect, 'error'); token = 'two'; return json({ data: { first_name: 'Old account' } }); };
  await assert.rejects(account.accountRequest('/user/profile'), /account changed/);
});
test('withdrawals recheck the backend balance before a single write and refuse unknown balances', async () => {
  global.localStorage = { getItem: () => 'token' };
  const calls = []; global.fetch = async (url, init) => { calls.push({ url, init }); return json(calls.length === 1 ? { data: { available_to_withdraw: '500.25' } } : { data: { id: 'w1' } }); };
  await payouts.requestWithdrawal(500.25); assert.equal(calls.length, 2); assert.ok(calls[0].url.endsWith('/payouts/summary')); assert.deepEqual(JSON.parse(calls[1].init.body), { amount: 500.25 });
  for (const payload of [{ data: { balance: 10000 } }, { data: { available_balance: 20 } }]) { let count = 0; global.fetch = async () => { count++; return json(payload); }; await assert.rejects(payouts.requestWithdrawal(100), /balance/); assert.equal(count, 1); }
});
test('invalid withdrawal amounts never reach the backend and a failed withdrawal is not replayed', async () => {
  global.localStorage = { getItem: () => 'token' }; let count = 0;
  global.fetch = async () => { count++; return json({ data: { available_balance: 10000 } }); };
  for (const value of [-1, 0, NaN, Infinity, 0.001]) await assert.rejects(payouts.requestWithdrawal(value), /positive amount/);
  assert.equal(count, 0);
  global.fetch = async () => { count++; return count === 1 ? json({ data: { available_balance: 10000 } }) : json({ error: 'Lost response' }, 502); };
  await assert.rejects(payouts.requestWithdrawal(100), /Lost response/); assert.equal(count, 2);
});
test('phone verification identifies the account by email and phone resends use the documented type', async () => {
  const calls = []; global.fetch = async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return json({ success: true }); };
  await auth.verifyPhoneOtp({ email: 'ada@example.test', otp: '001234' });
  await auth.resendOtp({ email: 'ada@example.test', phone: '+2348000000000', type: 'phone' });
  assert.ok(calls[0].url.endsWith('/auth/verify-phone')); assert.deepEqual(calls[0].body, { email: 'ada@example.test', otp: '001234' });
  assert.deepEqual(calls[1].body, { email: 'ada@example.test', phone: '+2348000000000', type: 'phone' });
});
test('going online saves actual device coordinates before availability; going offline does not request location', async () => {
  global.localStorage = { getItem: () => 'token' }; let geoCalls = 0;
  Object.defineProperty(global, 'navigator', { configurable: true, value: { geolocation: { getCurrentPosition: success => { geoCalls++; success({ coords: { latitude: 6.58, longitude: 3.32 } }); } } } });
  const calls = []; global.fetch = async (url, init) => { if (url.endsWith('/rider/profile')) return json({ data: { rider: { is_verified: true, status: 'offline' } } }); calls.push({ url, body: JSON.parse(init.body) }); return json({ success: true }); };
  await location.setAvailabilityFromDevice('available');
  assert.ok(calls[0].url.endsWith('/rider/location')); assert.deepEqual(calls[0].body, { latitude: 6.58, longitude: 3.32 });
  assert.ok(calls[1].url.endsWith('/rider/go-online')); assert.deepEqual(calls[1].body, { status: 'available' });
  await location.setAvailabilityFromDevice('offline'); assert.equal(geoCalls, 1); assert.deepEqual(calls[2].body, { status: 'offline' });
});
test('denied location or an account change while locating prevents going online', async () => {
  let token = 'one', callback, calls = 0; global.localStorage = { getItem: () => token }; global.fetch = async url => { if (url.endsWith('/rider/profile')) return json({ data: { rider: { is_verified: true } } }); calls++; return json({ success: true }); };
  Object.defineProperty(global, 'navigator', { configurable: true, value: { geolocation: { getCurrentPosition: (success, error) => error({ code: 1 }) } } });
  await assert.rejects(location.setAvailabilityFromDevice('available'), /Allow location access/); assert.equal(calls, 0);
  navigator.geolocation.getCurrentPosition = success => { callback = success; };
  const pending = location.setAvailabilityFromDevice('available'); await new Promise(setImmediate); token = 'two'; callback({ coords: { latitude: 6, longitude: 3 } });
  await assert.rejects(pending, /account changed/); assert.equal(calls, 0);
});
test('document uploads reuse successful uploads when a later file fails and retain the correct folder', async () => {
  global.localStorage = { getItem: () => 'token' };
  const first = new File(['pdf'], 'license.pdf', { type: 'application/pdf' }), second = new File(['photo'], 'vehicle.png', { type: 'image/png' }), cache = new Map();
  const calls = []; let fail = true;
  global.fetch = async (url, init) => { const file = init.body.get('file'); calls.push(file.name); assert.equal(init.body.get('folder'), 'rider-documents'); return file.name === 'vehicle.png' && fail ? json({ error: 'Upload failed' }, 422) : json({ data: { file: { fileUrl: 'https://files.example.test/' + file.name } } }); };
  await assert.rejects(documents.uploadRiderDocuments([first, second], 'token', cache), /Upload failed/);
  fail = false; assert.deepEqual(await documents.uploadRiderDocuments([first, second], 'token', cache), ['https://files.example.test/license.pdf', 'https://files.example.test/vehicle.png']);
  assert.deepEqual(calls, ['license.pdf', 'vehicle.png', 'vehicle.png']);
});
test('all documents are validated before any upload starts', async () => {
  let calls = 0; global.fetch = async () => { calls++; return json({}); };
  const valid = new File(['pdf'], 'license.pdf', { type: 'application/pdf' }), invalid = new File(['code'], 'app.exe', { type: 'application/octet-stream' });
  await assert.rejects(documents.uploadRiderDocuments([valid, invalid], 'token', new Map()), /PDF or image/); assert.equal(calls, 0);
});
