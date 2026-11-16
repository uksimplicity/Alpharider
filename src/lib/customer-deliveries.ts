import { accountRequest, checkSession, currentToken } from "./account-client";
import { normalizeProfile, record, rows, text, unwrap, type Row } from "./backend-data";
import { isRide } from "./booking-api";

const first = (row: Row, keys: string[]) => keys.map(key => text(row[key])).find(Boolean) || "";
const realId = (value: string) => value && value !== "00000000-0000-0000-0000-000000000000" ? value : "";
export function customerDelivery(value: unknown, expectedId?: string) {
  const root = unwrap(value), raw = record(root.delivery ?? root);
  const id = first(raw, ["id", "delivery_id", "delivery_uuid", "ID"]);
  if (!id || (expectedId && id !== expectedId)) throw new Error("The server returned a different or unreadable delivery. Refresh your deliveries.");
  const rider = record(raw.rider ?? raw.driver), user = record(rider.user);
  const customerId = realId(first(raw, ["customer_id", "customerId", "CustomerID"]) || text(record(raw.customer).id));
  return {
    ...raw, id, customerId,
    reference: first(raw, ["delivery_number", "reference"]) || id,
    status: text(raw.status).toLowerCase(),
    pickup: text(raw.pickup_address) || "Pickup not reported",
    destination: text(raw.dropoff_address) || "Destination not reported",
    items: Array.isArray(raw.items) ? raw.items : [],
    updated: first(raw, ["updated_at", "created_at"]),
    riderId: realId(first(raw, ["rider_id", "driver_id"]) || text(rider.id)),
    riderName: first(rider, ["name", "full_name"]) || [text(user.first_name), text(user.last_name)].filter(Boolean).join(" ") || first(raw, ["rider_name", "driver_name"]),
    riderPhone: first(rider, ["phone", "phone_number"]) || first(user, ["phone", "phone_number"]) || first(raw, ["rider_phone", "driver_phone"]),
    fee: raw.delivery_fee ?? raw.fee ?? raw.amount,
    paymentStatus: first(raw, ["payment_status", "paymentStatus"]),
  };
}
export type CustomerDelivery = ReturnType<typeof customerDelivery>;
export function customerDeliveryGroup(status: string): "active" | "history" | "unknown" {
  if (["requested", "pending", "assigned", "accepted", "picking_up", "on_the_way", "in_progress", "transit", "arrived"].includes(status)) return "active";
  if (["delivered", "completed", "cancelled", "expired", "failed", "declined"].includes(status)) return "history";
  return "unknown";
}
export async function loadCustomerDeliveries(): Promise<CustomerDelivery[]> {
  const token = currentToken();
  const profile = normalizeProfile(await accountRequest("/user/profile"));
  const customerId = realId(first(profile, ["id", "user_id", "_id", "customer_id"]));
  if (!customerId) throw new Error("Your customer identity could not be confirmed. Sign in again.");
  const result: CustomerDelivery[] = [], seen = new Set<string>();
  for (let offset = 0; offset < 10000;) {
    // Existing history contract; only explicitly owned customer records may be displayed.
    const page = rows(await accountRequest(`/rider/deliveries?limit=100&offset=${offset}`));
    checkSession(token);
    for (const raw of page) {
      const delivery = customerDelivery(raw);
      if (seen.has(delivery.id)) throw new Error("Delivery history did not advance. Refresh or contact support.");
      seen.add(delivery.id);
      if (isRide(raw)) continue;
      if (!delivery.customerId) throw new Error("Delivery history could not confirm customer ownership. Contact support to restore your delivery history.");
      if (delivery.customerId === customerId) result.push(delivery);
    }
    if (page.length < 100) return result.sort((a, b) => (Date.parse(b.updated) || 0) - (Date.parse(a.updated) || 0));
    offset += page.length;
  }
  throw new Error("Delivery history is too large to load. Contact support.");
}
export async function loadCustomerDelivery(id: string) {
  return customerDelivery(await accountRequest(`/rider-app/deliveries/${encodeURIComponent(id)}`), id);
}
