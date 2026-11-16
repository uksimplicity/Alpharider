const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const maps = require('../src/lib/google-maps.ts');
const { packageRoute, validPackagePoint, locatePackageAddress } = require('../src/lib/package-location.ts');
const originalLoader = maps.loadGoogleMaps;
afterEach(() => { maps.loadGoogleMaps = originalLoader; });
const pickup = { address:'12 Test Street, Lagos', latitude:6.58, longitude:3.32 };
const destination = { address:'24 Other Street, Lagos', latitude:6.60, longitude:3.35 };
const { completeAddressDetails, fullAddress, readAddressDetails } = require('../src/lib/structured-address.ts');
const { nigeriaStates } = require('../src/data/nigeriaLocations.ts');

test('structured package address requires all four fields and a local government belonging to its state', () => {
  const details = { houseNumber:' 12B ', street:' Test Street ', state:'Lagos', lga:'Ikeja' };
  assert.equal(completeAddressDetails(details),true);
  assert.equal(fullAddress(details),'12B Test Street, Ikeja, Lagos, Nigeria');
  for (const change of [{houseNumber:''},{street:''},{state:''},{lga:''},{state:'Ogun',lga:'Ikeja'}]) assert.equal(completeAddressDetails({...details,...change}),false);
  assert.equal(nigeriaStates.length,37);
  assert.ok(nigeriaStates.includes('Federal Capital Territory'));
  assert.deepEqual(readAddressDetails(fullAddress(details)),{...details,houseNumber:'12B',street:'Test Street'});
});

test('confirmed address points become backend route fields without changing real coordinates', () => {
  assert.deepEqual(packageRoute(pickup.address, destination.address, pickup, destination), {
    pickup_address:pickup.address,pickup_lat:6.58,pickup_lng:3.32,dropoff_address:destination.address,dropoff_lat:6.60,dropoff_lng:3.35,
  });
});
test('missing, stale, zero and invalid points prevent delivery submission', () => {
  assert.throws(()=>packageRoute(pickup.address,destination.address,null,destination), /Confirm the pickup/);
  assert.throws(()=>packageRoute('Edited address',destination.address,pickup,destination), /Confirm the pickup/);
  assert.throws(()=>packageRoute(pickup.address,'Edited address',pickup,destination), /Confirm the destination/);
  assert.throws(()=>packageRoute(pickup.address,destination.address,pickup,{...destination,latitude:6.58,longitude:3.32}), /different destination/);
  for (const point of [null,{latitude:0,longitude:0},{latitude:91,longitude:3},{latitude:6,longitude:NaN}]) assert.equal(validPackagePoint(point),false);
});
test('address lookup accepts a unique precise building and rejects ambiguity and partial/street matches', async () => {
  const result = {types:['street_address'],geometry:{location_type:'ROOFTOP',location:{lat:()=>6.58,lng:()=>3.32}}};
  let results = [result], status = 'OK';
  maps.loadGoogleMaps = async () => ({Geocoder:class {geocode(request,callback){assert.equal(request.region,'ng');callback(results,status);}}});
  assert.deepEqual(await locatePackageAddress(pickup.address),{latitude:6.58,longitude:3.32});
  for (const candidates of [[result,result],[{...result,partial_match:true}],[{...result,types:['route']}],[{...result,geometry:{...result.geometry,location_type:'APPROXIMATE'}}]]) {
    results=candidates; await assert.rejects(locatePackageAddress(pickup.address), /exact address/);
  }
  status='REQUEST_DENIED'; await assert.rejects(locatePackageAddress(pickup.address), /exact address/);
});
