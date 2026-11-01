const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { resetPassword } = require('../src/lib/auth-api.ts');
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test('reset sends OTP as text and preserves leading zeros', async () => {
  let body;
  global.fetch = async (url, init) => {
    assert.ok(url.endsWith('/auth/reset-password'));
    body = JSON.parse(init.body);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };
  await resetPassword({ email: 'seller@example.com', otp: '001234', newPassword: ' secure password ' });
  assert.deepEqual(body, { email: 'seller@example.com', otp: '001234', new_password: ' secure password ' });
});

test('reset surfaces backend errors', async () => {
  global.fetch = async () => new Response(JSON.stringify({ error: 'OTP expired' }), { status: 400 });
  await assert.rejects(resetPassword({ email: 'seller@example.com', otp: '001234', newPassword: 'password1' }), /OTP expired/);
});
