const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { loadEarningsSummary } = require('../src/lib/earnings-summary.ts');
const originalFetch = global.fetch, originalStorage = global.localStorage;
afterEach(() => { global.fetch = originalFetch; global.localStorage = originalStorage; });
const setup = () => { global.localStorage = { getItem: () => 'token' }; };

test('totals all earnings pages and separates unpaid from paid in kobo', async () => {
  setup(); const calls = [];
  global.fetch = async url => {
    calls.push(String(url));
    const offset = Number(new URL(String(url), 'https://example.test').searchParams.get('offset'));
    const items = offset === 0 ? Array.from({ length: 20 }, (_, i) => ({ id: `e${i}`, earning_amount: '0.10', status: 'paid' })) : [{ id: 'last', earning_amount: '444.53', status: 'unpaid' }];
    return Response.json({ data: items });
  };
  assert.deepEqual(await loadEarningsSummary('/rider/earnings'), { total: 446.53, paid: 2, unpaid: 444.53, unclassified: 0 });
  assert.equal(calls.length, 2);
});

test('repeated pages and invalid amounts do not produce a misleading total', async () => {
  setup();
  global.fetch = async () => Response.json({ data: Array.from({ length: 20 }, (_, i) => ({ id: `e${i}`, amount: '1.00', status: 'paid' })) });
  await assert.rejects(loadEarningsSummary('/rider/earnings'), /reliably/);
  global.fetch = async () => Response.json({ data: [{ id: 'one', amount: 'invalid', status: 'unpaid' }] });
  await assert.rejects(loadEarningsSummary('/rider/earnings'), /reliably/);
});
