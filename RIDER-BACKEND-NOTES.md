# Rider backend connections

Checked against the public and rider Swagger documents on 14 November 2026:

- https://marketplace.archintell.com/swagger/doc.json
- https://marketplace.archintell.com/rider-docs/doc.json

## Connected screens

- `/dashboard`: personal profile, actual wallet balance, persisted rider availability,
  online-only requested deliveries, notification count, and navigation.
- `/rider`: personal details from `/user/profile`, vehicle and availability from
  `/rider/profile`, KYC submission, and actual browser/manual location updates.
- `/user/edit-profile`: normalizes nested backend responses, saves documented
  editable fields and profile-picture uploads, and prevents saving before loading.
- `/rider/deliveries`: paginated authenticated delivery list and status filter.
- Existing rider delivery URLs use one shared detail/action screen. It accepts
  jobs and sends `picking_up`, `on_the_way`, `delivered`, and `completed`, including
  the customer's completion code. There is no undocumented `declined` write.
- `/rider/wallet`: wallet balance, stats, filtered/paginated transactions, verified
  payout bank account, withdrawals, individual withdrawal details and cancellation.
  Withdrawal amounts are rechecked against the current backend payout summary.
- `/rider/earnings`: actual earnings, commission summary/list/details/payment
  recording, lookup by delivery/order, and platform settings.
- `/user/notification`: backend list/count, mark-read, mark-all-read and deletion.
- `/rider/messages` and delivery chat: conversation list/details, support categories,
  delivery/support creation, message pagination, uploads, sends and read receipts.
  Visible data refreshes through bounded polling; no fabricated presence is shown.
- Customer delivery detail, waiting, selection, completion and call URLs display
  actual delivery/assigned-rider details rather than sample riders or fake calls.
- `/user/wallet` also uses actual wallet APIs.

## Data and failure handling

Removed delivery/upload mock paths and the mock route, sample notifications/chat,
hardcoded balances, fees, rider ratings/names, marketing metrics, and artificial
delivery IDs. Missing amounts are unavailable rather than zero. Malformed
responses and HTTP 200 business failures remain errors. Rider KYC, availability,
delivery writes and uploads each call one documented endpoint, without fallback
mutation replay. Concurrent/uncertain financial writes are blocked. Responses
from an earlier account are discarded.

## Remaining provider/backend dependencies

Wallet funding still awaits the backend's Paystack funding request and verified
credit contract. Order-payment initialization is not used as a wallet top-up.
Transaction PIN changes, customer cancellation/rescheduling, manual rider selection,
ratings, tips, in-app voice calls, guaranteed schedules, live maps/routing, and push
provider setup have no confirmed usable contract/configuration in this checkout.
Those screens do not simulate success. Backend permissions and KYC approval remain
authoritative. The UI does not expose admin-only APIs or automatically accept jobs.

## Validation

`npm test` includes booking, reset-password and rider backend contract regressions.
`node tests/rider.browser.cjs` checks profile loading/saving, availability including
rejection, delivery completion codes, notifications, wallet/payouts, earnings,
chat and mobile layout. Browser writes are intercepted synthetic responses only;
no live availability, deliveries, bank accounts, withdrawals or messages are changed.
Production build and TypeScript checks use a separate checkout under `.next`.
