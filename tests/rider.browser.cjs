// Synthetic backend responses only. This test never creates live deliveries, payouts or messages.
const assert = require('node:assert/strict');
const preview = process.env.ALPHA_PREVIEW_URL || 'http://127.0.0.1:3012';
const chrome = process.env.ALPHA_CHROME_URL || 'http://127.0.0.1:9229';
async function main() {
  const target = await (await fetch(chrome + '/json/new?about:blank', { method: 'PUT' })).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0; const pending = new Map(), errors = [];
  socket.onmessage = event => { const result = JSON.parse(event.data); if (result.method === 'Runtime.exceptionThrown') errors.push(result.params.exceptionDetails.exception?.description || result.params.exceptionDetails.text); const task = pending.get(result.id); if (task) { pending.delete(result.id); result.error ? task.reject(new Error(result.error.message)) : task.resolve(result.result); } };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; };
  const wait = async expression => { const start = Date.now(); while (Date.now() - start < 90000) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 150)); } throw new Error('Timed out: ' + expression + '\n' + await evaluate('document.body.innerText.slice(-3000)')); };
  const click = async label => evaluate(`(() => { const button=[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===${JSON.stringify(label)});if(!button)throw new Error('Missing button: '+${JSON.stringify(label)});button.click(); })()`);
  const input = async (label, value) => evaluate(`(() => {const field=[...document.querySelectorAll('label')].find(el=>el.textContent.trim().startsWith(${JSON.stringify(label)}))?.querySelector('input,select,textarea');if(!field)throw new Error('Missing input '+${JSON.stringify(label)});const proto=field.tagName==='SELECT'?HTMLSelectElement.prototype:field.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(field,${JSON.stringify(value)});field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    localStorage.setItem('alpharider_token','synthetic-rider-token'); localStorage.setItem('alpharider_last_activity_at',String(Date.now()));
    window.confirm=()=>true; window.__writes=[]; window.__unexpected=[];
    window.__profile={id:'u1',first_name:'Ada',last_name:'Okafor',email:'ada@example.test',phone:'+2348000000000',address:'Actual saved address'};
    window.__rider={id:'r1',status:'offline',vehicle_type:'bike',vehicle_number:'ABC123',verification_status:'approved'};
    window.__delivery={id:'job1',status:'requested',pickup_address:'Airport Road',dropoff_address:'Ikeja',customer:{name:'Actual customer',phone:'+2348000000001'},created_at:'2026-11-14T08:00:00Z',delivery_fee:'2000'};
    window.__account={bank_code:'001',bank_name:'Test Bank',account_number:'0123456789',account_name:'Ada Okafor'};
    window.__notifications=[{id:'n1',title:'Delivery update',body:'Your actual delivery was assigned.',is_read:false,created_at:'2026-11-14T08:00:00Z'}];
    window.__messages=[{id:'m1',body:'Actual customer message',created_at:'2026-11-14T08:00:00Z',sender:{name:'Actual customer'}}];
    window.__withdrawals=[]; window.__conversations=[{id:'c1',type:'delivery',status:'open'}]; window.__failure='';
    const nativeFetch=window.fetch;
    window.fetch=async (input,init={})=>{
      const url=new URL(typeof input==='string'?input:input.url,location.href);
      if(!url.pathname.startsWith('/api/v1/'))return nativeFetch(input,init);
      const path=url.pathname.slice(7),method=init.method||'GET',body=typeof init.body==='string'?JSON.parse(init.body):init.body;
      const ok=data=>Response.json({success:true,data});
      if(method!=='GET')__writes.push({path,method,body});
      if(__failure&&path===__failure)return Response.json({success:false,error:'Backend temporarily unavailable'},{status:500});
      if(path==='/user/profile'){if(method==='PUT')Object.assign(__profile,body);return ok({user:__profile});}
      if(path==='/rider/profile')return ok({rider:__rider});
      if(path==='/rider/go-online'){Object.assign(__rider,body);return ok(__rider);}
      if(path==='/rider/kyc'){Object.assign(__rider,body);return ok(__rider);}
      if(path==='/rider/location')return ok(body);
      if(path==='/wallet/balance')return ok({balance:'25000'});
      if(path==='/wallet/stats')return ok({total_credits:30000,total_debits:5000});
      if(path.startsWith('/wallet/transactions'))return ok([{id:'t1',description:'Actual credit',type:'credit',amount:25000,created_at:'2026-11-14T08:00:00Z'}]);
      if(path==='/rider/deliveries/requested'||path==='/rider/deliveries')return ok([__delivery]);
      if(path==='/rider/deliveries/job1'||path==='/rider-app/deliveries/job1')return ok({delivery:__delivery});
      if(path==='/rider/deliveries/job1/accept'){__delivery.status='assigned';return ok(__delivery);}
      if(path==='/rider/deliveries/job1/status'){Object.assign(__delivery,body);return ok(__delivery);}
      if(path==='/rider/deliveries/job1/location')return ok(body);
      if(path==='/payouts/summary')return ok({available_balance:25000});
      if(path==='/payouts/account'){if(method==='PUT')Object.assign(__account,body);return ok(__account);}
      if(path==='/payouts/banks')return ok([{code:'001',name:'Test Bank'}]);
      if(path==='/payouts/resolve')return ok({account_name:'Ada Okafor'});
      if(path==='/payouts/withdrawals'){if(method==='POST')__withdrawals.push({id:'w1',amount:body.amount,status:'pending'});return ok(method==='GET'?__withdrawals:__withdrawals[0]);}
      if(path==='/payouts/withdrawals/w1/cancel'){__withdrawals[0].status='cancelled';return ok(__withdrawals[0]);}
      if(path==='/payouts/withdrawals/w1')return ok(__withdrawals[0]);
      if(path==='/user/notifications/unread-count')return ok({unread_count:__notifications.filter(item=>!item.is_read).length});
      if(path==='/user/notifications')return ok(__notifications);
      if(path==='/user/notifications/read-all'){__notifications.forEach(item=>item.is_read=true);return ok({});}
      if(path==='/user/notifications/n1/read'){__notifications[0].is_read=true;return ok({});}
      if(path==='/user/notifications/n1'&&method==='DELETE'){__notifications=[];return ok({});}
      if(path==='/rider/earnings')return ok([{id:'e1',delivery_id:'job1',earning_amount:'1800',status:'paid'}]);
      if(path==='/rider/commissions/rider/summary')return ok({total_earned:1800,total_pending:200});
      if(path==='/rider/commissions')return ok([{id:'commission1',delivery_id:'job1',commission_amt:200,status:'paid'}]);
      if(path==='/rider/platform-settings/all')return ok([{key:'rider_commission_rate',value:10}]);
      if(path==='/chat-categories')return ok([{id:'support1',name:'Delivery support'}]);
      if(path==='/chat/conversations'){return ok(method==='GET'?__conversations:{id:'c1',type:body.type,status:'open'});}
      if(path==='/chat/conversations/c1')return ok(__conversations[0]);
      if(path==='/chat/conversations/c1/messages'){if(method==='POST')__messages.push({id:'m2',body:body.body,created_at:'2026-11-14T08:01:00Z',sender:{name:'Ada'}});return ok(method==='GET'?__messages:__messages.at(-1));}
      if(path==='/chat/conversations/c1/read')return ok({});
      __unexpected.push(path); return Response.json({error:'Unexpected test request '+path},{status:501});
    };
  ` });
  const unexpected = [];
  const navigate = async path => { unexpected.push(...await evaluate('window.__unexpected || []')); await send('Page.navigate', { url: preview + path }); await wait(`document.readyState==='complete'&&document.body.innerText.length>40`); };
  try {
    await navigate('/dashboard'); await wait(`document.body.innerText.includes('Hello, Ada Okafor!')&&document.body.innerText.includes('Go online')`);
    assert.equal(await evaluate(`document.body.innerText.includes('42,800')`), false);
    await click('Show balance'); await wait(`document.body.innerText.includes('25,000')`);
    await click('Go online'); await wait(`document.body.innerText.includes('Online — available')&&document.body.innerText.includes('Airport Road')`);
    assert.deepEqual(await evaluate(`__writes.filter(w=>w.path==='/rider/go-online').map(w=>w.body)`), [{status:'available'}]);
    await click('Go offline'); await wait(`document.body.innerText.includes('Go online to receive')`);
    assert.equal(await evaluate(`document.querySelector('[role="switch"]').getAttribute('aria-checked')`), 'false');
    console.log('PASS real profile, wallet balance, online/offline writes and request gating');
    await evaluate(`__failure='/rider/go-online'`); await click('Go online'); await wait(`document.body.innerText.includes('Backend temporarily unavailable')`);
    assert.equal(await evaluate(`document.body.innerText.includes('Online — available')`), false);
    console.log('PASS rejected availability changes never appear successful');
    await navigate('/rider'); await wait(`document.body.innerText.includes('Actual saved address')&&document.body.innerText.includes('ABC123')`);
    await input('Vehicle type','van'); await input('Plate number','DEF456'); await click('Submit rider registration'); await wait(`document.body.innerText.includes('Rider registration submitted.')`);
    await input('Latitude','0'); await input('Longitude','0'); await click('Save location'); await wait(`document.body.innerText.includes('Location saved.')`);
    assert.deepEqual(await evaluate(`__writes.find(w=>w.path==='/rider/location').body`),{latitude:0,longitude:0});
    console.log('PASS personal profile and rider vehicle details load independently');
    await navigate('/user/edit-profile'); await wait(`document.querySelector('input[type="email"]')?.value==='ada@example.test'`);
    await input('First Name','Updated Ada'); await click('Save Changes'); await wait(`document.body.innerText.includes('Profile updated successfully')`);
    assert.equal(await evaluate(`__writes.find(w=>w.path==='/user/profile').body.first_name`), 'Updated Ada');
    console.log('PASS profile edits persist through the documented user endpoint');
    await navigate('/delivery/request?id=job1'); await wait(`document.body.innerText.includes('Airport Road')&&document.body.innerText.includes('Accept delivery')`);
    await click('Accept delivery'); await wait(`document.body.innerText.includes('On my way to pickup')`);
    await click('On my way to pickup'); await wait(`document.body.innerText.includes('picking_up')`);
    await click('Picked up — start delivery'); await wait(`document.body.innerText.includes('on_the_way')`);
    await click('Confirm arrival at destination'); await wait(`document.body.innerText.includes('delivered')`);
    await input('Customer completion code','001234'); await click('Complete delivery'); await wait(`document.body.innerText.includes('This delivery is completed')`);
    assert.deepEqual(await evaluate(`__writes.filter(w=>w.path.endsWith('/status')).map(w=>w.body)`),[{status:'picking_up'},{status:'on_the_way'},{status:'delivered'},{status:'completed',completed_code:'001234'}]);
    await evaluate(`__delivery.status='assigned';window.dispatchEvent(new Event('focus'));`); await wait(`document.body.innerText.includes('Cancel delivery')`); await click('Cancel delivery'); await wait(`document.body.innerText.includes('This delivery is cancelled')`);
    console.log('PASS delivery acceptance and documented status transitions preserve completion codes');
    await navigate('/user/notification'); await wait(`document.body.innerText.includes('Your actual delivery was assigned.')`); await click('Mark read'); await wait(`document.body.innerText.includes('0 unread')`); await click('Delete'); await wait(`document.body.innerText.includes('No notifications yet.')`);
    console.log('PASS actual notifications, read state and deletion');
    await navigate('/rider/wallet'); await wait(`document.body.innerText.includes('Actual credit')&&document.body.innerText.includes('Test Bank')`);
    await input('Bank','001'); await input('Account number','0123456789'); await click('Verify account holder'); await wait(`document.querySelector('form button:last-child')?.disabled===false`); await click('Save payout account'); await wait(`__writes.some(w=>w.path==='/payouts/account')`);
    await input('Amount (NGN)','1000'); await click('Request withdrawal'); await wait(`document.body.innerText.includes('Cancel withdrawal')`);
    await click('Cancel withdrawal'); await wait(`document.body.innerText.includes('cancelled')`);
    assert.deepEqual(await evaluate(`__writes.find(w=>w.path==='/payouts/withdrawals').body`),{amount:1000});
    console.log('PASS wallet transactions, bank resolution, withdrawal and cancellation');
    await navigate('/rider/wallet'); await wait(`document.body.innerText.includes('Actual credit')&&document.body.innerText.includes('Test Bank')`);
    await input('Amount (NGN)','1000'); await evaluate(`__failure='/payouts/withdrawals'`);
    await evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(el=>el.textContent.trim()==='Request withdrawal');button.click();button.click();})()`);
    await wait(`document.body.innerText.includes('The result could not be confirmed.')`);
    assert.equal(await evaluate(`__writes.filter(w=>w.path==='/payouts/withdrawals').length`),1);
    await click('Request withdrawal'); assert.equal(await evaluate(`__writes.filter(w=>w.path==='/payouts/withdrawals').length`),1);
    console.log('PASS concurrent and uncertain withdrawal submissions are blocked');
    await navigate('/rider/earnings'); await wait(`document.body.innerText.includes('1,800')&&document.body.innerText.includes('rider_commission_rate')`);
    console.log('PASS backend earnings, commissions and platform settings');
    await navigate('/delivery/chat?id=job1'); await wait(`document.body.innerText.includes('Open delivery chat')`); await click('Open delivery chat'); await wait(`document.body.innerText.includes('Actual customer message')`);
    await input('Message','Real test reply'); await click('Send message'); await wait(`document.body.innerText.includes('Real test reply')`);
    assert.deepEqual(await evaluate(`__writes.find(w=>w.path.endsWith('/messages')).body`),{body:'Real test reply'});
    console.log('PASS delivery conversations and real message submission');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    assert.ok(await evaluate(`document.documentElement.scrollWidth<=window.innerWidth+1`));
    unexpected.push(...await evaluate(`__unexpected`)); assert.deepEqual(unexpected,[]); assert.deepEqual(errors,[]);
    console.log('PASS mobile layout and no browser runtime errors');
  } finally { await send('Page.close'); socket.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
