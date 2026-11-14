import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";
import { record, rows, unwrap } from "./backend-data";
export type DeliveryRecord = {
  id?: string; delivery_id?: string; delivery_uuid?: string; order_id?: string; order_number?: string; uuid?: string; reference?: string; tracking_id?: string;
  pickup_address?: string; dropoff_address?: string; pickup_contact?: string; dropoff_contact?: string; other_contact?: string; receiver_name?: string;
  status?: string; created_at?: string; updated_at?: string; pickup_lat?: number; pickup_lng?: number; dropoff_lat?: number; dropoff_lng?: number;
  notes?: string; rider_id?: string; customer_id?: string; last_location?: { latitude: number; longitude: number };
};
export const extractDeliveryId = (item: DeliveryRecord, fallback?: string) => item.id ?? item.delivery_id ?? item.delivery_uuid ?? item.order_id ?? item.order_number ?? item.uuid ?? item.reference ?? item.tracking_id ?? fallback ?? "";
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
const idPath = (id: string) => `/rider/deliveries/${encodeURIComponent(id)}`;
export async function getPendingDeliveries(token: string, limit = 20) {
  return rows(await requestJson<unknown>(`/rider/deliveries/requested?limit=${Math.min(Math.max(limit, 1), 200)}&offset=0`, { headers: auth(token), cache: "no-store" })) as DeliveryRecord[];
}
export async function getMyDeliveries(token: string) {
  const result: DeliveryRecord[] = [], seen = new Set<string>();
  for (let offset = 0; offset < 10000;) {
    const page = rows(await requestJson<unknown>(`/rider/deliveries?limit=100&offset=${offset}`, { headers: auth(token), cache: "no-store" })) as DeliveryRecord[];
    if (!page.length) return result;
    const signature = JSON.stringify(page.map(item => extractDeliveryId(item)));
    if (seen.has(signature)) throw new Error("The delivery service did not advance the page. Please refresh.");
    seen.add(signature); result.push(...page); offset += page.length;
    if (page.length < 100) return result;
  }
  throw new Error("There are too many deliveries to load at once. Use the paginated delivery list.");
}
export async function getDeliveryById(token: string, id: string) {
  const value = unwrap(await requestJson<unknown>(idPath(id), { headers: auth(token), cache: "no-store" }));
  return record(value.delivery ?? value) as DeliveryRecord;
}
export const acceptDelivery = (token: string, id: string) => requestJson<Record<string, unknown>>(`${idPath(id)}/accept`, { method: "POST", headers: auth(token) });
export type CreateDeliveryPayload = { pickup_address: string; pickup_lat: number; pickup_lng: number; dropoff_address: string; dropoff_lat: number; dropoff_lng: number; pickup_contact?: string; dropoff_contact?: string; other_contact?: string; receiver_name?: string; notes?: string; order_id?: string; customer_id?: string; items?: { name: string; quantity: number }[] };
export const createDelivery = (token: string, payload: CreateDeliveryPayload) => requestJson<Record<string, unknown>>(API_ENDPOINTS.deliveries.create, { method: "POST", headers: auth(token), body: JSON.stringify(payload) });
export function updateDeliveryStatus(token: string, id: string, status: string, completedCode?: string) {
  if (!["requested", "assigned", "picking_up", "on_the_way", "delivered", "completed", "cancelled"].includes(status)) throw new Error("This delivery status is not supported by the backend.");
  return requestJson<Record<string, unknown>>(`${idPath(id)}/status`, { method: "PUT", headers: auth(token), body: JSON.stringify({ status, ...(completedCode ? { completed_code: completedCode } : {}) }) });
}
export const broadcastDeliveryLocation = (token: string, id: string, payload: { latitude: number; longitude: number }) => requestJson<Record<string, unknown>>(`${idPath(id)}/location`, { method: "POST", headers: auth(token), body: JSON.stringify(payload) });
export const createInternalDelivery = (payload: CreateDeliveryPayload) => requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.deliveries, { method: "POST", body: JSON.stringify(payload) });
export const assignRiderToInternalDelivery = (id: string, riderId: string) => requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.assignRider(encodeURIComponent(id)), { method: "POST", body: JSON.stringify({ rider_id: riderId }) });
export const getInternalDeliveryById = (token: string, id: string) => requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.deliveryById(encodeURIComponent(id)), { headers: auth(token) });
export const updateInternalDeliveryStatus = (token: string, id: string, status: string) => requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.updateStatus(encodeURIComponent(id)), { method: "PUT", headers: auth(token), body: JSON.stringify(status) });
