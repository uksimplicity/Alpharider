const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { signupValidationMessage, signupPasswordCriteria } = require('../src/lib/signup-validation.ts');
const { signupUser } = require('../src/lib/auth-api.ts');
const valid = { name: 'Ada Okafor', email: 'ada@example.test', phone: '08000000000', userCategory: 'rider', password: 'TestPass1!', confirmPassword: 'TestPass1!', acceptedTerms: true };
const nativeFetch = global.fetch;
afterEach(() => { global.fetch = nativeFetch; });

test('every blocked signup requirement gives an actionable reason', () => {
  for (const [change, reason] of [
    [{ name: '  ' }, /full name/], [{ email: 'bad email' }, /email address/],
    [{ phone: '' }, /phone number/], [{ userCategory: '' }, /User Category/],
    [{ userCategory: 'driver' }, /User Category/], [{ password: 'weak' }, /8 characters/],
    [{ confirmPassword: 'different' }, /do not match/], [{ acceptedTerms: false }, /Terms/],
  ]) assert.match(signupValidationMessage({ ...valid, ...change }), reason);
  assert.equal(signupValidationMessage(valid), '');
  assert.equal(signupValidationMessage({ ...valid, email: ' ada@example.test ' }), '');
  assert.equal(signupValidationMessage({ ...valid, userCategory: 'user' }), '');
  assert.equal(signupPasswordCriteria(valid.password).every(item => item.met), true);
});

test('signup sends documented rider fields once and surfaces a business rejection', async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ success: false, error: 'Email already registered' }), { status: 200 });
  };
  await assert.rejects(signupUser({ firstName: 'Ada', lastName: 'Okafor', email: valid.email, phone: valid.phone, password: valid.password, role: 'rider' }), /Email already registered/);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.endsWith('/api/v1/auth/register'));
  assert.equal(calls[0].init.redirect, 'error');
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: valid.email, password: valid.password, first_name: 'Ada', last_name: 'Okafor', phone: valid.phone, role: 'rider' });
});
