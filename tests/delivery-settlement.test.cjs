const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { deliveryEarnings, deliveryWalletCredits, expectedDeliveryCredit } = require('../src/lib/delivery-settlement.ts');

test('earnings match only the actual delivery reference, not the earning record ID', () => {
  const data = { data: { earnings: [{ id: 'earning-1', delivery_id: 'job-1', earning_amount: '444.53', status: 'unpaid' }, { id: 'job-1', delivery_id: 'other' }] } };
  assert.deepEqual(deliveryEarnings(data, 'job-1').map(row => row.id), ['earning-1']);
  assert.deepEqual(deliveryEarnings(data, 'earning-1'), []);
});

test('delivery fee less commission is calculated exactly in kobo', () => {
  assert.equal(expectedDeliveryCredit('4500.05', '746.28'), 3753.77);
  assert.equal(expectedDeliveryCredit('100', '0'), 100);
  assert.equal(expectedDeliveryCredit('0.30', '0.10'), 0.20);
});

test('wallet history only attributes matching delivery credits to a job', () => {
  const data = { data: { transactions: [
    { id: 'credit', reference_id: 'delivery-1', type: 'credit', amount: '3753.77' },
    { id: 'debit', reference_id: 'delivery-1', type: 'debit', amount: '1' },
    { id: 'other', reference_id: 'delivery-2', type: 'credit', amount: '10' },
  ] } };
  assert.deepEqual(deliveryWalletCredits(data, 'delivery-1').map(row => row.id), ['credit']);
  assert.deepEqual(deliveryWalletCredits(data, ''), []);
});

test('missing, imprecise, negative or excessive amounts do not produce a credit', () => {
  for (const pair of [[null, 1], [100, null], ['1.001', 0], [100, -1], [10, 11], ['1e3', 1]]) {
    assert.equal(expectedDeliveryCredit(...pair), null);
  }
});
