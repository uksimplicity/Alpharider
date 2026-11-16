const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { riderJob, mergeRiderJobs } = require('../src/lib/rider-job.ts');
const actionsPath = require.resolve('../src/lib/rider-job-actions.ts');
const actions = require(actionsPath);
const { performReviewedAction, needsActionReview, reviewAction } = require('../src/lib/reviewed-action.ts');
const { loadRiderInbox } = require('../src/lib/rider-inbox.ts');
const { riderAccess, riderProfileMissing, getRiderAccess } = require('../src/lib/rider-access.ts');
const { setAvailabilityFromDevice } = require('../src/lib/rider-location.ts');
const originalFetch = global.fetch, originalStorage = global.localStorage;
let disk, token, account, job, writes, fail, riderProfile, sequence = 0;
const json = (data, status = 200) => new Response(JSON.stringify({ data }), { status });
beforeEach(() => {
  disk = new Map(); token = 'parity-token-' + ++sequence; account = 'rider-' + sequence;
  job = { id: 'job1', status: 'requested', source: 'marketplace' }; writes = []; fail = 0;
  riderProfile = { is_verified: true, status: 'offline' };
  global.localStorage = { getItem: key => key === 'alpharider_token' ? token : disk.get(key) ?? null, setItem: (key, value) => disk.set(key, value), removeItem: key => disk.delete(key) };
  global.fetch = async (url, init = {}) => {
    const path = new URL(url).pathname;
    if (path.endsWith('/user/profile')) return json({ user: { id: account, email: account + '@example.test' } });
    if (path.endsWith('/rider/profile')) return json({ rider: riderProfile });
    if (path.endsWith('/rider/deliveries/job1')) return json({ delivery: job });
    writes.push({ path, body: init.body ? JSON.parse(init.body) : null });
    if (fail) return new Response(JSON.stringify({ error: 'Write failed' }), { status: fail });
    if (path.endsWith('/accept')) job = { ...job, status: 'assigned' };
    else if (init.body) job = { ...job, ...JSON.parse(init.body) };
    return json(job);
  };
});
afterEach(() => { global.fetch = originalFetch; global.localStorage = originalStorage; });

test('job classification separates passengers, parcels and marketplace jobs without guessing from order IDs', () => {
  assert.equal(riderJob({ source: 'marketplace', job_type: 'passenger' }).kind, 'package');
  assert.equal(riderJob({ source: 'rider_app', job_type: 'passenger_ride' }).requiresCode, false);
  assert.equal(riderJob({ notes: 'Ride type: Standard | Riders: 1' }).kind, 'passenger');
  assert.equal(riderJob({ items: [{ name: 'Ride' }] }).source, 'alpharide');
  assert.equal(riderJob({ source: 'alpharide' }).kind, 'package');
  assert.equal(riderJob({ order_id: 'order1' }).source, 'unknown');
  assert.equal(riderJob({ order_id: 'order1' }).requiresCode, true);
});
test('schedule and expiry checks use actual backend fields and legacy schedule notes, never creation date', () => {
  const now = Date.parse('2026-11-14T10:00:00Z');
  assert.equal(riderJob({ created_at: '2026-11-15T10:00:00Z' }, now).future, false);
  assert.equal(riderJob({ notes: 'Ride type: Standard | Scheduled for: 2026-11-15T10:00:00Z' }, now).future, true);
  assert.equal(riderJob({ scheduled_for: '2026-11-13T10:00:00Z', notes: 'Scheduled for: 2026-11-15T10:00:00Z' }, now).future, false);
  assert.equal(riderJob({ status: 'requested', expires_at: '2026-11-14T09:59:00Z' }, now).expired, true);
  assert.equal(riderJob({ status: 'assigned', expires_at: '2026-11-14T09:59:00Z' }, now).expired, false);
});

test('request source labels preserve blank/unknown sources and recognize reported origins', () => {
  for (const source of ['', 'unexpected_origin']) {
    const result = riderJob({ source, order_id: 'marketplace-looking-order', status: 'requested' });
    assert.equal(result.source, 'unknown');
    assert.equal(result.sourceLabel, 'Source not reported');
    assert.equal(result.needsAcceptance, true);
  }
  assert.equal(riderJob({ source: 'marketplace' }).sourceLabel, 'Marketplace');
  assert.equal(riderJob({ delivery_source: 'marketplace' }).sourceLabel, 'Marketplace');
  assert.equal(riderJob({ source: 'rider_app' }).sourceLabel, 'AlphaRide');
});

test('unassigned request detail uses rider authorization and backend denial prevents acceptance writes', async () => {
  const detailPath = '/api/v1/rider/deliveries/job1';
  const original = global.fetch;
  let denied = true;
  global.fetch = async (url, init = {}) => {
    if (new URL(url).pathname === detailPath && !init.method) {
      assert.equal(init.headers.Authorization, `Bearer ${token}`);
      return denied
        ? new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 404 })
        : json({ delivery: { ...job, rider_id: null, source: '' } });
    }
    return original(url, init);
  };
  const { accountRequest } = require('../src/lib/account-client.ts');
  await assert.rejects(accountRequest('/rider/deliveries/job1'), error => error.status === 404 && error.message === 'Unauthorized');
  await assert.rejects(actions.performJobAction('job1', 'accept'), /Unauthorized/);
  assert.equal(writes.length, 0);
  denied = false;
  const detail = await accountRequest('/rider/deliveries/job1');
  assert.equal(detail.data.delivery.rider_id, null);
  assert.equal(riderJob(detail.data.delivery).sourceLabel, 'Source not reported');
  await actions.performJobAction('job1', 'accept');
  assert.equal(writes.length, 1);
  assert.equal(writes[0].path, '/api/v1/rider/deliveries/job1/accept');
});
test('assigned invitations require acceptance and package progress cannot skip pickup or delivery stages', () => {
  const invitation = riderJob({ status: 'assigned', source: 'marketplace' });
  assert.equal(invitation.needsAcceptance, true); assert.equal(invitation.nextStatus(), null);
  assert.equal(invitation.nextStatus(true), 'picking_up');
  assert.equal(riderJob({ status: 'assigned', source: 'alpharide' }).needsAcceptance, false);
  assert.equal(riderJob({ status: 'assigned', source: 'alpharide', requires_acceptance: true }).needsAcceptance, true);
  assert.equal(riderJob({ status: 'on_the_way', source: 'marketplace' }).nextStatus(), 'delivered');
  assert.equal(riderJob({ status: 'on_the_way', job_type: 'passenger' }).nextStatus(), 'completed');
});
test('merging request and assigned queues deduplicates jobs using the assigned record', () => {
  const list = mergeRiderJobs([{ id: 'job1', status: 'requested', pickup_address: 'Airport' }], [{ delivery_id: 'job1', status: 'assigned' }]);
  assert.equal(list.length, 1); assert.equal(list[0].status, 'assigned'); assert.equal(list[0].pickup_address, 'Airport');
});
test('a successful acceptance survives reopening without a second POST even when assigned has no acceptance metadata', async () => {
  await actions.performJobAction('job1', 'accept');
  delete require.cache[actionsPath]; const reopened = require(actionsPath);
  assert.equal((await reopened.reconcileJob('job1', job)).accepted, true);
  await reopened.performJobAction('job1', 'accept'); assert.equal(writes.length, 1);
  await reopened.performJobAction('job1', 'picking_up'); assert.equal(job.status, 'picking_up');
});
test('a lost acceptance response remains blocked after reopening until server acceptance can be confirmed', async () => {
  fail = 502; await assert.rejects(actions.performJobAction('job1', 'accept'), /Write failed/);
  delete require.cache[actionsPath]; const reopened = require(actionsPath); fail = 0;
  await assert.rejects(reopened.performJobAction('job1', 'accept'), /unconfirmed/); assert.equal(writes.length, 1);
  job = { ...job, status: 'assigned' };
  assert.ok((await reopened.reconcileJob('job1', job)).pending);
  job.accepted_at = '2026-11-14T10:00:00Z';
  assert.equal((await reopened.reconcileJob('job1', job)).pending, undefined);
  await reopened.performJobAction('job1', 'picking_up'); assert.equal(writes.length, 2);
});
test('known backend rejection permits correction and retry; completion preserves leading zeroes', async () => {
  job = { ...job, status: 'delivered' }; fail = 400;
  await assert.rejects(actions.performJobAction('job1', 'completed', '001234'), /Write failed/);
  fail = 0; await actions.performJobAction('job1', 'completed', '001234');
  assert.deepEqual(writes.at(-1).body, { status: 'completed', completed_code: '001234' });
});
test('passenger completion sends no parcel code while unknown/package jobs still require one', async () => {
  job = { ...job, status: 'on_the_way', source: 'rider_app', job_type: 'passenger' };
  await actions.performJobAction('job1', 'completed', 'unnecessary');
  assert.deepEqual(writes[0].body, { status: 'completed' });
  job = { id: 'job1', status: 'delivered' }; disk.clear();
  await assert.rejects(actions.performJobAction('job1', 'completed'), /completion code/); assert.equal(writes.length, 1);
});
test('fresh read prevents starting an expired, future or unaccepted job and prevents skipped package stages', async () => {
  job.expires_at = '2000-01-01T00:00:00Z'; await assert.rejects(actions.performJobAction('job1', 'accept'), /not currently available/);
  job = { id: 'job1', status: 'requested', scheduled_for: '2099-01-01T00:00:00Z' }; await assert.rejects(actions.performJobAction('job1', 'accept'), /not currently available/);
  job = { id: 'job1', status: 'assigned', source: 'marketplace' }; await assert.rejects(actions.performJobAction('job1', 'on_the_way'), /has changed/);
  job.requires_acceptance = false; await assert.rejects(actions.performJobAction('job1', 'on_the_way'), /has changed/);
  assert.equal(writes.length, 0);
});
test('job receipts follow the account across logins and do not leak to another account', async () => {
  await actions.performJobAction('job1', 'accept'); token += '-new-login';
  assert.equal((await actions.reconcileJob('job1', job)).accepted, true);
  token += '-other'; account = 'different-rider';
  assert.equal((await actions.reconcileJob('job1', job)).accepted, undefined);
});
test('successful status changes stay blocked until a fresh server read confirms progress', async () => {
  job = { ...job, status: 'assigned', requires_acceptance: false };
  const native = global.fetch;
  global.fetch = async (url, init) => { const result = await native(url, init); if (url.endsWith('/status')) job.status = 'assigned'; return result; };
  await actions.performJobAction('job1', 'picking_up');
  await assert.rejects(actions.performJobAction('job1', 'picking_up'), /unconfirmed/); assert.equal(writes.length, 1);
  job.status = 'picking_up'; assert.equal((await actions.reconcileJob('job1', job)).pending, undefined);
});
test('inbox includes assigned invitations and removes accepted, scheduled and expired requests', async () => {
  global.fetch = async url => {
    const parsed = new URL(url);
    if (parsed.pathname.endsWith('/user/profile')) return json({ user: { id: account } });
    if (parsed.pathname.endsWith('/rider/profile')) return json({ rider: riderProfile });
    if (parsed.pathname.endsWith('/requested')) return json([{ id: 'open', status: 'requested' }, { id: 'expired', status: 'requested', expires_at: '2000-01-01T00:00:00Z' }, { id: 'future', status: 'requested', scheduled_for: '2099-01-01T00:00:00Z' }]);
    assert.equal(parsed.searchParams.get('status'), 'assigned');
    return json([{ id: 'invitation', status: 'assigned', source: 'marketplace' }, { id: 'accepted', status: 'assigned', accepted_at: '2026-11-14T10:00:00Z' }]);
  };
  assert.deepEqual((await loadRiderInbox()).map(row => row.id), ['open', 'invitation']);
});
test('uncertain financial actions survive reopening and cannot replay until successful explicit readback review', async () => {
  let calls = 0;
  await assert.rejects(performReviewedAction('payouts', async () => { calls++; throw new Error('Lost response'); }), /Lost response/);
  assert.equal(await needsActionReview('payouts'), true);
  await assert.rejects(performReviewedAction('payouts', async () => { calls++; }), /Review the previous action/); assert.equal(calls, 1);
  await assert.rejects(reviewAction('payouts', async () => { throw new Error('Balance unavailable'); }), /Balance unavailable/);
  assert.equal(await needsActionReview('payouts'), true);
  await reviewAction('payouts', async () => {}); assert.equal(await needsActionReview('payouts'), false);
  await performReviewedAction('payouts', async () => { calls++; }); assert.equal(calls, 2);
});
test('failure to persist a pending action prevents any job write', async () => {
  global.localStorage.setItem = () => { throw new Error('Storage disabled'); };
  await assert.rejects(actions.performJobAction('job1', 'accept'), /Storage disabled/); assert.equal(writes.length, 0);
});

test('rider approval is separate from availability and email verification, and unknown or conflicting approval stays locked', () => {
  for (const payload of [{ data: { rider: { status: 'available' }, user: { is_verified: true } } }, { rider: { is_verified: false }, user: { is_verified: true } }, { rider: { is_verified: false, verification_status: 'approved' } }, { rider: { is_verified: 'true' } }]) assert.notEqual(riderAccess(payload).approval, 'approved');
  assert.equal(riderAccess({ data: { rider: { is_verified: true, status: 'offline' } } }).approval, 'approved');
  assert.equal(riderAccess({ data: { rider_profile: { verified: true } } }).approval, 'approved');
  assert.equal(riderAccess({ profile: { rider: { approval_status: 'approved' } } }).approval, 'approved');
  assert.equal(riderAccess({ rider: { is_verified: true, verification_status: 'suspended' } }).approval, 'suspended');
  assert.equal(riderAccess({ rider: { verification_status: 'rejected' } }).approval, 'rejected');
  assert.equal(riderAccess({ rider: { is_verified: true, approval_status: 'pending' } }).approval, 'pending');
});
test('missing rider registration is recognized without disguising sign-in failures or unrelated backend outages', async () => {
  assert.equal(riderProfileMissing(500, 'Rider profile not found'), true);
  assert.equal(riderProfileMissing(400, 'Rider profile not found'), true);
  assert.equal(riderProfileMissing(401, 'Rider profile not found'), false);
  assert.equal(riderProfileMissing(500, 'Database unavailable'), false);
  global.fetch = async () => new Response(JSON.stringify({ error: 'Rider profile not found' }), { status: 404 });
  assert.equal((await getRiderAccess()).approval, 'missing');
  global.fetch = async () => new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 500 });
  await assert.rejects(getRiderAccess(), /Database unavailable/);
});
test('unapproved or unknown riders cannot go online, see incoming jobs, accept jobs or change job status', async () => {
  for (const profile of [{ is_verified: false }, { status: 'available' }, { verification_status: 'rejected' }, { verification_status: 'suspended', is_verified: true }]) {
    riderProfile = profile;
    await assert.rejects(setAvailabilityFromDevice('available'), /approval|approved|suspended/);
    await assert.rejects(loadRiderInbox(), /approval|approved|suspended/);
    await assert.rejects(actions.performJobAction('job1', 'accept'), /approval|approved|suspended/);
    await assert.rejects(actions.performJobAction('job1', 'picking_up'), /approval|approved|suspended/);
  }
  assert.equal(writes.length, 0);
});
test('approval is checked again on an operation after an earlier approved read', async () => {
  assert.equal((await getRiderAccess()).approval, 'approved');
  riderProfile.is_verified = false;
  await assert.rejects(actions.performJobAction('job1', 'accept'), /awaiting admin approval/);
  assert.equal(writes.length, 0);
});
