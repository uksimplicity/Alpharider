const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
// Exercise the actual TypeScript adapters with mocked HTTP, without adding a test framework.
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
const { createRide, getRides, getRide, buildRidePayload, validateRideDraft, readRides, scheduledTime } = require("../src/lib/booking-api.ts");
const { isPendingDeliveryStatus, isCompletedDeliveryStatus } = require("../src/lib/delivery-status.ts");
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
const draft = () => ({
  pickup: "Airport Road", dropoff: "Ikeja", pickupLat: "6.58", pickupLng: "3.32",
  dropoffLat: "6.60", dropoffLng: "3.35", rideType: "Basic", note: "By the gate", scheduledFor: "",
});
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

test("ride payload preserves real pins and mobile items/notes contract", () => {
  const payload = buildRidePayload(draft(), "customer-1");
  assert.equal(payload.pickup_lat, 6.58);
  assert.equal(payload.dropoff_lng, 3.35);
  assert.equal(payload.customer_id, "customer-1");
  assert.deepEqual(payload.items, [{ name: "Ride", quantity: 1 }]);
  assert.match(payload.notes, /Ride type: Basic \| Ride note: By the gate/);
  assert.equal("fare" in payload, false);
});
test("missing/invalid pins and identical locations cannot be submitted", () => {
  for (const values of [{ pickupLat: "" }, { dropoffLng: "181" }, { pickupLat: "NaN" }, { pickupLat: "91" }, { dropoff: "Airport Road" }, { dropoffLat: "6.58", dropoffLng: "3.32" }]) {
    assert.ok(validateRideDraft({ ...draft(), ...values }));
  }
  assert.equal(validateRideDraft({ ...draft(), pickupLat: "0", pickupLng: "0" }), "");
});
test("schedule rejects past and distant dates and serializes time with timezone", () => {
  const now = Date.now();
  assert.match(validateRideDraft({ ...draft(), scheduledFor: new Date(now - 1000).toISOString() }, now), /future/);
  assert.match(validateRideDraft({ ...draft(), scheduledFor: new Date(now + 31 * 86400000).toISOString() }, now), /30 days/);
  const scheduled = new Date(now + 86400000).toISOString();
  const payload = buildRidePayload({ ...draft(), scheduledFor: scheduled }, "customer-1");
  assert.equal(scheduledTime(payload), scheduled);
});
test("create resolves nested profile and posts once to mobile endpoint with bearer auth", async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    return calls.length === 1 ? json({ data: { _id: "customer-1" } }) : json({ data: { delivery_id: "trip-1", status: "requested" } });
  };
  const ride = await createRide("token-1", draft());
  assert.equal(ride.id, "trip-1");
  assert.equal(calls.length, 2);
  assert.ok(calls[1].url.endsWith("/rider-app/deliveries"));
  assert.equal(calls[1].init.headers.Authorization, "Bearer token-1");
  assert.equal(JSON.parse(calls[1].init.body).customer_id, "customer-1");
});
test("missing customer ID prevents posting and failed create is not retried", async () => {
  let calls = 0;
  global.fetch = async () => { calls++; return json({ data: { email: "a@example.com" } }); };
  await assert.rejects(createRide("token", draft()), /customer identifier/);
  assert.equal(calls, 1);
  calls = 0;
  global.fetch = async () => { calls++; return calls === 1 ? json({ id: "customer" }) : json({ message: "Unavailable" }, 503); };
  await assert.rejects(createRide("token", draft()), /Unavailable/);
  assert.equal(calls, 2);
});
test("unconfirmed create response cannot become a successful trip", async () => {
  let calls = 0;
  global.fetch = async () => ++calls === 1 ? json({ id: "customer" }) : json({ message: "Accepted" });
  await assert.rejects(createRide("token", draft()), /Check Your rides/);
});
test("history separates parcels from rides, sorts newest first, and unwraps lists", async () => {
  global.fetch = async () => json({ data: { deliveries: [
    { id: "parcel", notes: "Fragile" },
    { id: "old", notes: "Ride type: Basic", created_at: "2026-01-01" },
    { id: "new", items: [{ name: "Ride" }], created_at: "2026-02-01" },
  ] } });
  assert.deepEqual((await getRides("token")).map(ride => ride.id), ["new", "old"]);
  assert.deepEqual(readRides({ data: [] }), []);
  assert.throws(() => readRides({ message: "invalid" }), /invalid ride list/);
});
test("trip details normalize driver aliases and safely encode references", async () => {
  global.fetch = async (url) => {
    assert.ok(url.endsWith("/rider-app/deliveries/trip%2F1"));
    return json({ data: { id: "trip/1", driver_name: "Ada", driver_phone: "+234123", pickupAddress: "Airport" } });
  };
  const ride = await getRide("token", "trip/1");
  assert.equal(ride.rider_name, "Ada");
  assert.equal(ride.pickup_address, "Airport");
});
test("mobile trip states remain active until a terminal status arrives", () => {
  for (const status of ["requested", "picking_up", "on_the_way", "driver_arrived", "ride_started", "scheduled"]) {
    assert.equal(isPendingDeliveryStatus(status), true, status);
    assert.equal(isCompletedDeliveryStatus(status), false, status);
  }
  for (const status of ["completed", "delivered", "cancelled", "failed"]) assert.equal(isCompletedDeliveryStatus(status), true, status);
});
