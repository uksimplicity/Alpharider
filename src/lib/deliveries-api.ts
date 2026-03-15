import { requestJson } from "./api";

export type DeliveryRecord = {
  id?: string;
  delivery_id?: string;
  order_id?: string;
  pickup_address?: string;
  dropoff_address?: string;
  pickup_contact?: string;
  dropoff_contact?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

type DeliveryListResponse = {
  data?: DeliveryRecord[];
  deliveries?: DeliveryRecord[];
  items?: DeliveryRecord[];
} & Record<string, unknown>;

const readDeliveryList = (response: DeliveryListResponse): DeliveryRecord[] => {
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.deliveries)) return response.deliveries;
  if (Array.isArray(response.items)) return response.items;

  if (Array.isArray(response as unknown[])) {
    return response as DeliveryRecord[];
  }

  return [];
};

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const buildPathWithQuery = (path: string, query?: Record<string, string | number>) => {
  if (!query || Object.keys(query).length === 0) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    params.set(key, String(value));
  });
  return `${path}?${params.toString()}`;
};

export async function getPendingDeliveries(token: string, limit = 20) {
  const response = await requestJson<DeliveryListResponse>(
    buildPathWithQuery("/deliveries/pending", { limit }),
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );
  return readDeliveryList(response);
}

export async function getMyDeliveries(token: string) {
  const response = await requestJson<DeliveryListResponse>("/deliveries/my", {
    method: "GET",
    headers: withAuthHeaders(token),
  });
  return readDeliveryList(response);
}

export async function getDeliveryById(token: string, id: string) {
  return requestJson<DeliveryRecord>(`/deliveries/${id}`, {
    method: "GET",
    headers: withAuthHeaders(token),
  });
}

export async function acceptDelivery(token: string, id: string) {
  return requestJson<Record<string, unknown>>(`/deliveries/${id}/accept`, {
    method: "POST",
    headers: withAuthHeaders(token),
  });
}

export async function createDelivery(
  token: string,
  payload: {
    pickup_address: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_address: string;
    dropoff_lat: number;
    dropoff_lng: number;
    pickup_contact?: string;
    dropoff_contact?: string;
    notes?: string;
    order_id?: string;
    customer_id?: string;
  }
) {
  return requestJson<Record<string, unknown>>("/deliveries", {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateDeliveryStatus(
  token: string,
  id: string,
  status: string
) {
  return requestJson<Record<string, unknown>>(`/deliveries/${id}/status`, {
    method: "PUT",
    headers: withAuthHeaders(token),
    body: JSON.stringify(status),
  });
}

export async function broadcastDeliveryLocation(
  token: string,
  id: string,
  payload: {
    latitude: number;
    longitude: number;
  }
) {
  return requestJson<Record<string, unknown>>(`/deliveries/${id}/location`, {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function createInternalDelivery(payload: {
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  pickup_contact?: string;
  dropoff_contact?: string;
  notes?: string;
  order_id?: string;
  customer_id?: string;
}) {
  return requestJson<Record<string, unknown>>("/internal/deliveries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function assignRiderToInternalDelivery(
  id: string,
  riderId: string
) {
  return requestJson<Record<string, unknown>>(`/internal/deliveries/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({
      rider_id: riderId,
    }),
  });
}
