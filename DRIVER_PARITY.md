# Driver web workflow parity

Reference: the current `Alpharide_Driver` checkout, particularly
`JOB_FLOW_CONTRACT.md`, `job_info.dart`, `job_acceptance.dart`, the delivery detail
screen, location reporter and payout review flow. No mobile files were changed.

## Connected behavior

- The inbox combines requested jobs with assigned invitations, deduplicates by
  delivery ID and refreshes every 20 seconds while visible. It paginates both
  queues, supports source filtering and discards stale results after load failure.
- Passenger rides and parcels use separate completion rules. Marketplace jobs
  are packages. Optional source/type metadata and existing `Ride type:`/Ride item
  markers classify AlphaRide jobs. An order ID alone never identifies the source.
- Assigned marketplace/unknown-source jobs require explicit acceptance unless
  the backend or a successful local acceptance receipt confirms acceptance.
  AlphaRide assigned jobs respect explicit pending-acceptance metadata.
- Packages progress through pickup, collection, delivery and code-confirmed
  completion. Passengers progress through pickup, start ride and completion,
  without a parcel completion code. Existing explicit backend code waivers remain
  supported. Unknown job types retain code validation by default.
- Every job action re-reads the backend record before writing. Expired requests
  and future scheduled jobs are blocked. Schedule information comes from actual
  schedule fields or legacy schedule notes, never creation time.
- My jobs retains backend pagination/status filtering and adds source labels,
  source filtering and upcoming scheduled pickups. The latter filters operate on
  the current page because no server-side source/schedule query is assumed.
- Job detail shows the backend's fee, payment method, payment status and escrow
  status. Missing values remain unavailable; completion never invents payout state.
- Pending job actions and acceptance receipts are persisted under a hashed account
  identifier and delivery ID. Unknown results are not replayed after navigation,
  reload or sign-in to the same account. A fresh record clears a pending action
  only when it confirms acceptance/progress/termination. An assigned status alone
  cannot resolve an uncertain acceptance; support must resolve ambiguous cases.
- Payout and commission actions persist a review marker before submission.
  Unknown results stay blocked after reopening. Explicit successful backend reads
  of the relevant account, balances and history allow the user to review and
  continue. Browser Web Locks serialize actions across tabs where supported;
  otherwise in-page locks and persisted pending markers guard retries.
- Going online obtains the actual device location before updating availability.
  Online/busy rider pages send foreground location updates every 30 seconds with
  permission. The open active-job screen also updates that job's location after
  confirming acceptance and nonterminal status. Hidden pages, offline status and
  logout stop further reporting; resuming the page checks backend status again.
  No manual latitude/longitude fields or fabricated coordinates are used.
- Rider registration is offered only after the rider-profile endpoint returns
  not found. Existing registrations cannot be resubmitted. Vehicle type uses the
  mobile app's Bike/Car/Van choices. PDF/image uploads and cached upload retries
  remain available for first-time registration. No undocumented update API is used.

## Backend and browser limits

The web app additionally requires explicit admin approval on the rider profile
before operating. Account/email verification and available/offline status are not
rider approval. Missing rider registration opens the registration path; pending,
rejected, suspended and unconfirmed approval keep operating controls locked.
Approval is rechecked before online changes, inbox loading and job actions, and
before foreground location reporting. Backend approval/authorization remains
authoritative, including for clients outside this web app.

Dispatch/search deadlines, automatic cancellation, admin escalation, dispatch
radius and fee/escrow settlement belong to the backend. The web app observes
returned expiry/schedule information; it does not fabricate server transitions.
Optional metadata must be supplied consistently for full cross-device recovery.
Tracking runs while a rider page is visible, not in the background after closing
the browser. Browser authentication continues to use the existing web session.
Wallet top-up/Paystack funding remains pending its confirmed backend contract.

## Verification

`node --test tests/*.test.cjs` covers backend contracts and parity regressions.
`node tests/rider.browser.cjs` covers existing screens plus passenger completion,
assigned invitations, foreground GPS, offline stop, expiry/scheduling and reload
recovery for jobs and payouts. Browser tests intercept backend requests and use
synthetic responses; no live deliveries or financial records are modified.
The isolated production build under `.next/rider-backend-build` avoids stale
generated route types from the working development preview.
