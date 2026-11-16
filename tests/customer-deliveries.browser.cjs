// All backend calls are intercepted. No live package, payment or message writes.
const assert = require('node:assert/strict');
const preview = process.env.ALPHA_PREVIEW_URL || 'http://127.0.0.1:3013';
const chrome = process.env.ALPHA_CHROME_URL || 'http://127.0.0.1:9230';
async function main() {
  const target = await (await fetch(chrome + '/json/new?about:blank', { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0; const pending = new Map(), errors = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data), task = pending.get(message.id);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
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
  const navigate = async path => { await send('Page.navigate', { url: preview + path }); await wait(`document.querySelector('nav[aria-label="Main navigation"]')`); };
  const click = label => evaluate(`(() => { const el = [...document.querySelectorAll('button')].find(el => el.textContent.trim() === ${JSON.stringify(label)}); if (!el) throw new Error('Button missing'); el.click(); })()`);
  const input = (label, value) => evaluate(`(() => { const el = [...document.querySelectorAll('label')].find(el => el.textContent.trim().startsWith(${JSON.stringify(label)}))?.querySelector('input'); if (!el) throw new Error('Input missing'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  try {
    await send('Page.enable'); await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 740, deviceScaleFactor: 1, mobile: true });
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      localStorage.clear(); localStorage.setItem('alpharider_token', 'customer-test-token'); localStorage.setItem('alpharider_is_verified', 'true'); localStorage.setItem('alpharider_last_activity_at', String(Date.now()));
      window.__unexpected = []; window.__writes = []; window.__denyDetail = false;
      window.__heldGeocode = null;
      window.__maps = []; window.__denyGps = false;
      Object.defineProperty(navigator, 'geolocation', {configurable:true,value:{getCurrentPosition(success,failure){setTimeout(()=>__denyGps ? failure({code:1}) : success({coords:{latitude:6.60,longitude:3.35}}),100);}}});
      window.google = {maps:{
        Map: class { constructor(element) { this.listeners = {}; __maps.push(this); element.textContent = 'Map preview'; } setCenter() {} addListener(event,callback) { this.listeners[event] = callback; return {remove(){}}; } },
        Marker: class { constructor() {} setPosition() {} setVisible() {} setMap() {} addListener() { return {remove(){}}; } },
        Geocoder: class { geocode(request, callback) {
          const result = (latitude,longitude) => callback([{types:['street_address'],geometry:{location_type:'ROOFTOP',location:{lat:()=>latitude,lng:()=>longitude}}}], 'OK');
          if (request.address === 'Old pickup') { __heldGeocode = () => result(1,2); return; }
          request.address.includes('destination') ? result(6.60,3.35) : result(6.58,3.32);
        }}
      }};
      window.__delivery = { id:'d1', customer_id:'customer-1', status:'requested', pickup_address:'Test pickup', dropoff_address:'Test destination', delivery_fee:'522.98', updated_at:'2026-11-16T12:00:00Z' };
      const nativeFetch = window.fetch;
      window.fetch = async (input, init = {}) => {
        const url = new URL(typeof input === 'string' ? input : input.url, location.href);
        if (url.origin === location.origin) return nativeFetch(input, init);
        const path = url.pathname.replace('/api/v1', '');
        const ok = data => new Response(JSON.stringify({ success:true, data }), { status:200 });
        if (path === '/user/profile') return ok({ id:'customer-1', first_name:'Ada', email:'ada@example.test' });
        if (path === '/rider/deliveries') return ok({ deliveries:[__delivery, {id:'foreign', customer_id:'someone-else', pickup_address:'PRIVATE OTHER CUSTOMER',status:'requested'}, {id:'old',customer_id:'customer-1',status:'completed'}, {id:'ride',customer_id:'customer-1',notes:'Ride type: Basic',status:'requested'}] });
        if (path === '/rider-app/deliveries' && init.method === 'POST') { __writes.push(JSON.parse(init.body)); return new Promise(resolve => { window.__finishCreate = () => resolve(ok({ delivery:{...__delivery,id:'d2'} })); }); }
        if (path.startsWith('/rider-app/deliveries/')) return __denyDetail ? new Response(JSON.stringify({success:false,error:'Unauthorized'}), {status:404}) : ok({ delivery:{...__delivery,id:decodeURIComponent(path.split('/').pop())} });
        if (path === '/user/notifications/unread-count') return ok({unread_count:0});
        if (path === '/user/notifications' || path === '/chat-categories' || path === '/chat/conversations') return ok([]);
        __unexpected.push(path); throw new Error('Unexpected API call: ' + path);
      };
    ` });
    await navigate('/user/dashboard');
    await wait(`document.body.innerText.includes('Test destination')`);
    assert.equal(await evaluate(`!!document.querySelector('a[href="/user/book-ride"]')`), false);
    assert.equal(await evaluate(`document.body.innerText.includes('PRIVATE OTHER CUSTOMER')`), false);
    assert.equal(await evaluate(`document.querySelector('nav a[aria-current="page"]').textContent.includes('Home')`), true);
    await navigate('/user/delivery'); await wait(`document.body.innerText.includes('History')`);
    assert.equal(await evaluate(`!!document.querySelector('a[href="/user/delivery-details?id=d1"]')`), true);
    await navigate('/user/delivery-details?id=d1'); await wait(`document.body.innerText.includes('Awaiting rider assignment')`);
    assert.equal(await evaluate(`!!document.querySelector('a[href*="in-app-chat?id="]')`), false);
    await evaluate(`Object.assign(__delivery,{status:'on_the_way',rider_id:'r1',rider:{id:'r1',name:'Actual Rider',phone:'+2348000000001'}})`);
    await click('Refresh delivery'); await wait(`document.body.innerText.includes('Actual Rider')`);
    assert.equal(await evaluate(`document.querySelector('a[href^="tel:"]').getAttribute('href')`), 'tel:+2348000000001');
    assert.equal(await evaluate(`!!document.querySelector('a[href="/user/in-app-chat?id=d1"]')`), true);
    await evaluate(`__denyDetail = true`); await click('Refresh delivery');
    await wait(`document.body.innerText.includes('We couldn’t open this delivery')`);
    assert.equal(await evaluate(`!!document.querySelector('a[href^="tel:"]')`), false);
    assert.equal(await evaluate(`document.querySelector('details').textContent.includes('404')`), true);
    console.log('PASS home/list show owned packages; detail refresh shows real assignment; failed refresh removes stale contact actions');
    await navigate('/user/notification'); await wait(`document.body.innerText.includes('No notifications yet')`);
    assert.equal(await evaluate(`!!document.querySelector('nav[aria-label="Rider navigation"]')`), false);
    await navigate('/user/in-app-chat'); await wait(`document.body.innerText.includes('No conversations yet')`);
    assert.equal(await evaluate(`document.body.innerText.includes('Delivery conversation')`), false);
    console.log('PASS customer notifications/support retain customer navigation and do not load rider availability/location');
    await navigate('/user/package-information-3');
    await wait(`document.querySelector('input[placeholder="Enter Pick up location"]') && [...document.querySelectorAll('input')].some(el => Object.keys(el).some(key => key.startsWith('__reactProps')))`);
    assert.equal(await evaluate(`document.body.innerText.toLowerCase().includes('latitude') || document.body.innerText.toLowerCase().includes('longitude')`), false);
    await input('Pickup address', 'Old pickup'); await wait(`typeof __heldGeocode === 'function'`);
    await input('Pickup address', 'Test pickup'); await input('Destination address', 'Test destination');
    await wait(`[...document.querySelectorAll('button')].some(el=>el.textContent==='Confirm pickup location')`);
    await click('Confirm pickup location');
    await wait(`[...document.querySelectorAll('button')].some(el=>el.textContent==='Confirm destination location')`);
    await click('Confirm destination location');
    await click('Choose pickup on map'); await wait(`__maps.length === 1 && !!__maps[0].listeners.click`);
    await evaluate(`__maps[0].listeners.click({latLng:{lat:()=>6.59,lng:()=>3.33}})`);
    await wait(`[...document.querySelectorAll('button')].some(el=>el.textContent==='Confirm pickup location')`);
    await click('Confirm pickup location');
    await evaluate(`__denyGps = true`); await click('Use my location for destination');
    await wait(`document.body.innerText.includes('Allow location access')`);
    assert.equal(await evaluate(`__writes.length`), 0);
    await evaluate(`__denyGps = false`); await click('Use my location for destination');
    await wait(`[...document.querySelectorAll('button')].some(el=>el.textContent==='Confirm destination location')`);
    await click('Confirm destination location');
    await evaluate(`__heldGeocode()`);
    await input('Pickup address', 'Edited pickup');
    await evaluate(`document.querySelector('form').requestSubmit()`);
    await wait(`document.querySelector('[role="alert"]')?.textContent.includes('Confirm the pickup location')`);
    assert.equal(await evaluate(`__writes.length`), 0);
    await wait(`[...document.querySelectorAll('button')].some(el=>el.textContent==='Confirm pickup location')`);
    await click('Confirm pickup location');
    await evaluate(`document.querySelector('form').requestSubmit(); document.querySelector('form').requestSubmit()`);
    await wait(`typeof __finishCreate === 'function'`);
    assert.equal(await evaluate(`__writes.length`), 1);
    assert.equal(await evaluate(`__writes[0].customer_id`), 'customer-1');
    assert.equal(await evaluate(`__writes[0].pickup_lat`), 6.58);
    assert.equal(await evaluate(`__writes[0].pickup_lng`), 3.32);
    assert.equal(await evaluate(`__writes[0].dropoff_lat`), 6.60);
    assert.equal(await evaluate(`__writes[0].dropoff_lng`), 3.35);
    assert.equal(await evaluate(`__writes[0].pickup_address`), 'Edited pickup');
    assert.equal(await evaluate(`document.querySelector('button[type="submit"]').disabled`), true);
    await evaluate(`__finishCreate()`); await wait(`location.pathname === '/user/delivery-details' && location.search === '?id=d2'`);
    await wait(`document.body.innerText.includes('Test destination')`);
    assert.equal(await evaluate(`localStorage.getItem('alpharider_active_delivery_id')`), null);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
    assert.deepEqual(await evaluate(`__unexpected`), []);
    assert.deepEqual(errors, []);
    console.log('PASS addresses resolve internally; edits invalidate locations; stale lookup is ignored; one package submission sends confirmed backend coordinates');
  } finally { await send('Page.close').catch(() => {}); socket.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
