# AlphaRide web and mobile parity

The reference app is `Marketplace Mobile Applications/AlphaRide`. This checkout
is the Next.js web app. Changes here do not modify the Flutter app or its backend.

## Available on the web

- `/user/dashboard`: mobility home, ride booking, scheduling, and Alpha Send.
- `/user/book-ride`: pickup/destination, exact coordinates, browser pickup
  location, Basic/Comfort/Premium/Van, driver note, review, and request submission.
- `/user/schedule-ride`: the same flow with a future pickup within 30 days.
- `/user/rides`: active/scheduled trips and completed/cancelled/failed history,
  using the authenticated delivery list and the mobile ride marker.
- `/user/rides/[id]`: server-backed status, route, assigned driver contact,
  authenticated trip sharing, and visible-page polling every 30 seconds.
- Existing Alpha Send, account editing, password reset, email verification,
  rider onboarding, and rider delivery management remain available.

## Shared API contract

Ride requests use the mobile adapter's `POST /rider-app/deliveries`, resolving the
customer identifier from `GET /user/profile`. The payload contains actual user
coordinates, `items: [{name: "Ride", quantity: 1}]`, and `Ride type`, `Ride note`,
and optional `Scheduled for` notes. Scheduled dates are serialized with a timezone.
Scheduling is a requested time in notes, not a guaranteed dispatch reservation.
History uses `GET /rider/deliveries`; details use
`GET /rider-app/deliveries/:id`. The server must retain the ride marker in notes
or items for correct ride/parcel separation across devices.

Rides always use the configured backend. Legacy delivery/upload mocks now require
explicit `NEXT_PUBLIC_USE_LOCAL_DELIVERY_MOCK=true` and
`NEXT_PUBLIC_USE_LOCAL_UPLOAD_MOCK=true` in development. Production disables these
mocks. Localhost alone no longer silently activates fake data.

## Remaining shared integration gaps

The mobile repository's `FRONTEND_INTEGRATION_BLOCKERS.md` records missing ride,
mapping, payment, realtime, notification, and refresh-token contracts. Web parity
does not make those capabilities production-ready:

- A configured places/map/geocoding provider is needed for address search, map
  selection, routing, multi-stop trips, and tracking a driver's live position.
  Until then, the web requires exact coordinates and never supplies default pins.
- Dedicated quote, ride cancellation, rescheduling, and dispatch APIs are needed.
  No invented prices, arrival times, or passenger-driven status changes are shown.
- Wallet balances, funding, payments, receipts, ratings/tips, and promo codes need
  backend contracts. The wallet explicitly shows that it is unavailable.
- Shared links require the recipient to have access to the trip; public tracking
  needs a scoped share-token endpoint.
- Push notifications and realtime events need provider configuration and schemas.

## Verification

Run `npm test` for payload, response, history separation, state, and failure-path
checks; `npx tsc --noEmit` for types; and `npm run build` for production compilation.
HTTP is mocked in the tests; these checks do not create live trips or charge users.
