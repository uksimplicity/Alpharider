import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";
import { type DeliveryRecord, extractDeliveryId } from "./deliveries-api";

export const RIDE_OPTIONS = [
  { name: "Basic", seats: 4, description: "Your everyday ride" },
  { name: "Comfort", seats: 4, description: "A little more room to relax" },
  { name: "Premium", seats: 4, description: "Travel in extra comfort" },
  { name: "Van", seats: 6, description: "Bring everyone along" },
] as const;
export type Ride = DeliveryRecord & {
  items?: { name?: string; quantity?: number }[];
  rider_name?: string; rider_phone?: string; driver_name?: string; driver_phone?: string;
};
export type RideDraft = {
  pickup: string; dropoff: string; pickupLat: string; pickupLng: string;
  dropoffLat: string; dropoffLng: string; rideType: string; note: string; scheduledFor: string;
};
export const emptyRideDraft: RideDraft = {
  pickup: "", dropoff: "", pickupLat: "", pickupLng: "", dropoffLat: "", dropoffLng: "",
  rideType: "Basic", note: "", scheduledFor: "",
};
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function unwrapRecord(value: unknown): Record<string, unknown> {
  const root = record(value);
  for (const key of ["data", "delivery", "result", "payload"]) {
    if (root[key] && typeof root[key] === "object" && !Array.isArray(root[key])) return unwrapRecord(root[key]);
  }
  return root;
}
export function normalizeRide(value: unknown): Ride {
  const source = unwrapRecord(value);
  const text = (...keys: string[]) => keys.map(key => source[key])
    .find(value => typeof value === "string" && value.trim()) as string | undefined;
  return {
    ...source,
    id: text("id", "_id", "delivery_id", "delivery_uuid", "uuid", "order_id"),
    pickup_address: text("pickup_address", "pickupAddress"),
    dropoff_address: text("dropoff_address", "dropoffAddress"),
    created_at: text("created_at", "createdAt"), updated_at: text("updated_at", "updatedAt"),
    rider_name: text("rider_name", "riderName", "driver_name"),
    rider_phone: text("rider_phone", "riderPhone", "driver_phone"),
  } as Ride;
}
export function readRides(value: unknown): Ride[] {
  if (Array.isArray(value)) return value.map(normalizeRide);
  const source = record(value);
  for (const key of ["data", "deliveries", "items", "results", "orders"]) {
    if (source[key] && typeof source[key] === "object") return readRides(source[key]);
  }
  throw new Error("The server returned an invalid ride list.");
}
export const isRide = (ride: Ride) => /(?:^|\|)\s*Ride type:/i.test(ride.notes ?? "") ||
  Boolean(ride.items?.some(item => item.name?.toLowerCase() === "ride"));
export function validateRideDraft(draft: RideDraft, now = Date.now()): string {
  if (!draft.pickup.trim() || !draft.dropoff.trim()) return "Enter your pickup and destination addresses.";
  if (draft.pickup.trim().toLowerCase() === draft.dropoff.trim().toLowerCase()) return "Choose a different destination from your pickup.";
  for (const [label, value, max] of [
    ["Pickup latitude", draft.pickupLat, 90], ["Pickup longitude", draft.pickupLng, 180],
    ["Destination latitude", draft.dropoffLat, 90], ["Destination longitude", draft.dropoffLng, 180],
  ] as const) {
    if (!value.trim() || !Number.isFinite(Number(value)) || Math.abs(Number(value)) > max)
      return `${label} must be a number between -${max} and ${max}.`;
  }
  if (Number(draft.pickupLat) === Number(draft.dropoffLat) && Number(draft.pickupLng) === Number(draft.dropoffLng))
    return "Pickup and destination pins must be different.";
  if (!RIDE_OPTIONS.some(option => option.name === draft.rideType)) return "Choose a ride type.";
  if (draft.scheduledFor) {
    const time = new Date(draft.scheduledFor).getTime();
    if (!Number.isFinite(time) || time <= now) return "Choose a pickup time in the future.";
    if (time > now + 30 * 24 * 60 * 60 * 1000) return "Schedule your ride within the next 30 days.";
  }
  return "";
}
export function buildRidePayload(draft: RideDraft, customerId: string) {
  const error = validateRideDraft(draft);
  if (error) throw new Error(error);
  if (!customerId.trim()) throw new Error("Your profile is missing a customer identifier.");
  const notes = [`Ride type: ${draft.rideType}`, `Ride note: ${draft.note.trim().replace(/\|/g, "/") || `${RIDE_OPTIONS.find(option => option.name === draft.rideType)?.seats} seats`}`];
  if (draft.scheduledFor) notes.push(`Scheduled for: ${new Date(draft.scheduledFor).toISOString()}`);
  return {
    customer_id: customerId, pickup_address: draft.pickup.trim(), dropoff_address: draft.dropoff.trim(),
    pickup_contact: "Rider", dropoff_contact: "Rider",
    pickup_lat: Number(draft.pickupLat), pickup_lng: Number(draft.pickupLng),
    dropoff_lat: Number(draft.dropoffLat), dropoff_lng: Number(draft.dropoffLng),
    items: [{ name: "Ride", quantity: 1 }], notes: notes.join(" | "),
  };
}
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
export async function createRide(token: string, draft: RideDraft): Promise<Ride> {
  const error = validateRideDraft(draft);
  if (error) throw new Error(error);
  const raw = await requestJson<unknown>(API_ENDPOINTS.user.profile, { headers: auth(token) });
  const profile = { ...record(raw), ...unwrapRecord(raw) };
  const customerId = [profile.id, profile._id, profile.user_id, profile.customer_id]
    .find(value => typeof value === "string" && value.trim());
  const payload = buildRidePayload(draft, typeof customerId === "string" ? customerId : "");
  const response = await requestJson<unknown>(API_ENDPOINTS.riderApp.deliveries, {
    method: "POST", headers: auth(token), body: JSON.stringify(payload),
  });
  const ride = normalizeRide(response);
  if (!extractDeliveryId(ride)) throw new Error("The server did not return a ride reference. Check Your rides before trying again.");
  return ride;
}
export async function getRides(token: string): Promise<Ride[]> {
  const response = await requestJson<unknown>(API_ENDPOINTS.rider.deliveries, { headers: auth(token), cache: "no-store" });
  return readRides(response).filter(isRide).filter(ride => extractDeliveryId(ride))
    .sort((a, b) => (Date.parse(b.created_at ?? "") || 0) - (Date.parse(a.created_at ?? "") || 0));
}
export async function getRide(token: string, id: string): Promise<Ride> {
  const response = await requestJson<unknown>(API_ENDPOINTS.riderApp.deliveryById(encodeURIComponent(id)), {
    headers: auth(token), cache: "no-store",
  });
  const ride = normalizeRide(response);
  if (!extractDeliveryId(ride)) throw new Error("The server returned an invalid trip. Try refreshing.");
  return ride;
}
export function scheduledTime(ride: Ride): string | null {
  const value = ride.notes?.match(/(?:^|\|)\s*Scheduled for:\s*([^|]+)/i)?.[1]?.trim();
  return value && Number.isFinite(Date.parse(value)) ? value : null;
}
