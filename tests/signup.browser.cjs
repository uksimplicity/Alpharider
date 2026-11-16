// Synthetic signup responses only; no account is created on the live backend.
const assert = require('node:assert/strict');
const preview = process.env.ALPHA_PREVIEW_URL || 'http://127.0.0.1:3013';
const chrome = process.env.ALPHA_CHROME_URL || 'http://127.0.0.1:9230';
async function main() {
  const target = await (await fetch(chrome + '/json/new?about:blank', { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0; const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data), task = pending.get(message.id);
    if (task) { pending.delete(message.id); message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const wait = async expression => {
    const start = Date.now();
    while (Date.now() - start < 45000) {
      if (await evaluate(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timed out: ' + expression + '\n' + await evaluate('document.body.innerText'));
  };
  const input = async (placeholder, value) => evaluate(`(() => {
    const field = document.querySelector('input[placeholder="${placeholder}"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, ${JSON.stringify(value)});
    field.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  const submit = () => evaluate(`document.querySelector('button[type="submit"]').click()`);
  try {
    await send('Page.enable'); await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 640, deviceScaleFactor: 1, mobile: true });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      localStorage.clear(); window.__signupCalls = []; window.__signupMode = 'reject'; window.__unexpected = [];
      const nativeFetch = window.fetch;
      window.fetch = async (input, init = {}) => {
        const url = new URL(typeof input === 'string' ? input : input.url, location.href);
        if (url.origin === location.origin) return nativeFetch(input, init);
        if (url.pathname === '/api/v1/auth/register') {
          __signupCalls.push(JSON.parse(init.body));
          if (__signupMode === 'defer') return new Promise(resolve => {
            window.__finishSignup = () => resolve(new Response(JSON.stringify({ success: true }), { status: 201 }));
          });
          return new Response(JSON.stringify({ success: false, error: 'Email already registered' }), { status: 409 });
        }
        __unexpected.push(url.pathname); throw new Error('Unexpected backend request');
      };
    ` });
    await send('Page.navigate', { url: preview + '/auth/signup' });
    await wait(`document.querySelector('button[type="submit"]') && [...document.querySelectorAll('input')].some(el => Object.keys(el).some(key => key.startsWith('__reactProps'))) `);
    assert.equal(await evaluate(`document.querySelector('.auth-logo').getBoundingClientRect().top >= 0`), true);
    assert.equal(await evaluate(`document.querySelector('button[type="submit"]').disabled`), false);
    await submit(); await wait(`document.querySelector('[role="alert"]')?.textContent.includes('full name')`);
    assert.equal(await evaluate(`document.activeElement.getAttribute('role')`), 'alert');
    assert.equal(await evaluate(`__signupCalls.length`), 0);
    await input('Full name', 'Ada Okafor'); await input('Email Address', 'ada@example.test'); await input('Phone Number', '08000000000');
    await submit(); await wait(`document.querySelector('[role="alert"]')?.textContent.includes('User Category')`);
    await evaluate(`(() => { const field = document.querySelector('select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(field, 'rider'); field.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await input('Input Password', 'weak'); await input('Re-enter Password', 'weak');
    await submit(); await wait(`document.querySelector('[role="alert"]')?.textContent.includes('8 characters')`);
    await input('Input Password', 'TestPass1!');
    await submit(); await wait(`document.querySelector('[role="alert"]')?.textContent.includes('do not match')`);
    await input('Re-enter Password', 'TestPass1!');
    await submit(); await wait(`document.querySelector('[role="alert"]')?.textContent.includes('Terms')`);
    assert.equal(await evaluate(`__signupCalls.length`), 0);
    await evaluate(`document.querySelector('input[type="checkbox"]').click()`);
    await submit(); await wait(`document.querySelector('[role="alert"]')?.textContent.includes('Email already registered')`);
    assert.equal(await evaluate(`document.querySelector('button[type="submit"]').disabled`), false);
    console.log('PASS mobile form is reachable; invalid submissions explain missing fields; server rejection is visible');
    await evaluate(`window.__signupMode = 'defer'; document.querySelector('form').requestSubmit(); document.querySelector('form').requestSubmit();`);
    await wait(`typeof __finishSignup === 'function'`);
    assert.equal(await evaluate(`__signupCalls.length`), 2);
    assert.equal(await evaluate(`document.querySelector('button[type="submit"]').disabled`), true);
    assert.match(await evaluate(`document.querySelector('button[type="submit"]').textContent`), /Signing up/);
    assert.equal(await evaluate(`__signupCalls[1].role`), 'rider');
    await evaluate(`__finishSignup()`);
    await wait(`location.pathname === '/auth/verify'`);
    assert.equal(await evaluate(`localStorage.getItem('alpharider_pending_email')`), 'ada@example.test');
    assert.equal(await evaluate(`__signupCalls.length`), 2);
    assert.deepEqual(await evaluate(`__unexpected`), []);
    console.log('PASS repeated submissions send one request; loading is visible; successful signup opens verification');
  } finally {
    await send('Page.close').catch(() => {}); socket.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
