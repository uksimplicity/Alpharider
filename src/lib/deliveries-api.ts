import { requestJson, requestJsonWithFallback } from "./api";
import { API_ENDPOINTS } from "./endpoints";

export type DeliveryRecord = {
  id?: string;
  delivery_id?: string;
  delivery_uuid?: string;
  order_id?: string;
  order_number?: string;
  uuid?: string;
  reference?: string;
  tracking_id?: string;
  pickup_address?: string;
  dropoff_address?: string;
  pickup_contact?: string;
  dropoff_contact?: string;
  other_contact?: string;
  receiver_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  notes?: string;
  rider_id?: string;
  customer_id?: string;
  last_location?: {
    latitude: number;
    longitude: number;
  };
};

export const extractDeliveryId = (item: DeliveryRecord, fallback?: string) =>
  item.id ??
  item.delivery_id ??
  item.delivery_uuid ??
  item.order_id ??
  item.order_number ??
  item.uuid ??
  item.reference ??
  item.tracking_id ??
  fallback ??
  "";

type DeliveryListResponse = {
  data?: DeliveryRecord[];
  deliveries?: DeliveryRecord[];
  items?: DeliveryRecord[];
  results?: DeliveryRecord[];
  orders?: DeliveryRecord[];
  pending?: DeliveryRecord[];
} & Record<string, unknown>;

const isDeliveryRecordLike = (value: unknown): value is DeliveryRecord => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Boolean(
    record.id ||
      record.delivery_id ||
      record.delivery_uuid ||
      record.order_id ||
      record.order_number ||
      record.uuid ||
      record.pickup_address ||
      record.dropoff_address ||
      record.status
  );
};

const unwrapDeliveryList = (value: unknown): DeliveryRecord[] => {
  if (Array.isArray(value)) return value as DeliveryRecord[];
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const arrayKeys = [
    "data",
    "deliveries",
    "items",
    "results",
    "orders",
    "pending",
    "requests",
    "list",
  ] as const;

  for (const key of arrayKeys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as DeliveryRecord[];
  }

  for (const key of ["data", "result", "payload", "meta"] as const) {
    const nested = unwrapDeliveryList(record[key]);
    if (nested.length > 0) return nested;
  }

  return isDeliveryRecordLike(value) ? [value as DeliveryRecord] : [];
};

const readDeliveryList = (
  response: DeliveryListResponse | DeliveryRecord[]
): DeliveryRecord[] => {
  return unwrapDeliveryList(response);
};

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const isLocalMockEnabled = () => {
  if (typeof window === "undefined") return false;
  const forced = process.env.NEXT_PUBLIC_USE_LOCAL_DELIVERY_MOCK;
  if (forced === "true") return true;
  if (forced === "false") return false;

  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
};

const requestLocalMock = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const raw = await response.text();
  const body = raw ? (JSON.parse(raw) as unknown) : null;
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message ?? "Request failed")
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
};

const buildPathWithQuery = (path: string, query?: Record<string, string | number>) => {
  if (!query || Object.keys(query).length === 0) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    params.set(key, String(value));
  });
  return `${path}?${params.toString()}`;
};

export async function getPendingDeliveries(token: string, limit = 20) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<DeliveryRecord[]>(
      buildPathWithQuery("/api/mock/deliveries", { status: "pending", limit }),
      { method: "GET" }
    );
  }

  try {
    const response = await requestJsonWithFallback<
      DeliveryListResponse | DeliveryRecord[]
    >(
      [
        buildPathWithQuery(API_ENDPOINTS.deliveries.my, {
          status: "requested",
          limit,
        }),
        buildPathWithQuery(API_ENDPOINTS.deliveries.pending, { limit }),
        buildPathWithQuery(API_ENDPOINTS.legacy.deliveries.pending, { limit }),
      ],
      {
        method: "GET",
        headers: withAuthHeaders(token),
      }
    );
    const parsed = readDeliveryList(response);
    if (parsed.length > 0) return parsed.slice(0, limit);
  } catch {
    // Fall back below when this endpoint is unavailable for a rider token.
  }

  // Compatibility fallback for backends that don't expose /deliveries/pending
  // but still return rider-visible requests via /deliveries/my.
  const all = await getMyDeliveries(token);
  return all
    .filter((item) => {
      const normalized = (item.status ?? "").toLowerCase();
      return (
        !normalized ||
        normalized.includes("pending") ||
        normalized.includes("created") ||
        normalized.includes("requested")
      );
    })
    .slice(0, limit);
}

export async function getMyDeliveries(token: string) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<DeliveryRecord[]>(
      buildPathWithQuery("/api/mock/deliveries", { limit: 1000 }),
      { method: "GET" }
    );
  }

  const response = await requestJsonWithFallback<
    DeliveryListResponse | DeliveryRecord[]
  >([API_ENDPOINTS.deliveries.my, API_ENDPOINTS.legacy.deliveries.my], {
    method: "GET",
    headers: withAuthHeaders(token),
  });
  return readDeliveryList(response);
}

export async function getDeliveryById(token: string, id: string) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<DeliveryRecord>(`/api/mock/deliveries/${id}`, {
      method: "GET",
    });
  }

  return requestJsonWithFallback<DeliveryRecord>(
    [
      API_ENDPOINTS.deliveries.byId(id),
      API_ENDPOINTS.riderApp.deliveryById(id),
      API_ENDPOINTS.legacy.deliveries.byId(id),
    ],
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );
}

export async function acceptDelivery(token: string, id: string) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<{ id: string; status: string }>(
      `/api/mock/deliveries/${id}/accept`,
      {
        method: "POST",
      }
    );
  }

  return requestJsonWithFallback<Record<string, unknown>>(
    [API_ENDPOINTS.deliveries.accept(id), API_ENDPOINTS.legacy.deliveries.accept(id)],
    {
      method: "POST",
      headers: withAuthHeaders(token),
    }
  );
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
    other_contact?: string;
    receiver_name?: string;
    notes?: string;
    order_id?: string;
    customer_id?: string;
  }
) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<Record<string, unknown>>("/api/mock/deliveries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  return requestJsonWithFallback<Record<string, unknown>>(
    [API_ENDPOINTS.deliveries.create, API_ENDPOINTS.legacy.deliveries.create],
    {
      method: "POST",
      headers: withAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );
}

export async function updateDeliveryStatus(
  token: string,
  id: string,
  status: string
) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<Record<string, unknown>>(
      `/api/mock/deliveries/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
  }

  return requestJsonWithFallback<Record<string, unknown>>(
    [API_ENDPOINTS.deliveries.status(id), API_ENDPOINTS.legacy.deliveries.status(id)],
    {
      method: "PUT",
      headers: withAuthHeaders(token),
      body: JSON.stringify({ status }),
    }
  );
}

export async function broadcastDeliveryLocation(
  token: string,
  id: string,
  payload: {
    latitude: number;
    longitude: number;
  }
) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<Record<string, unknown>>(
      `/api/mock/deliveries/${id}/location`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  return requestJsonWithFallback<Record<string, unknown>>(
    [
      API_ENDPOINTS.deliveries.location(id),
      API_ENDPOINTS.legacy.deliveries.location(id),
    ],
    {
      method: "POST",
      headers: withAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );
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
  other_contact?: string;
  receiver_name?: string;
  notes?: string;
  order_id?: string;
  customer_id?: string;
}) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<Record<string, unknown>>("/api/mock/deliveries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  return requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.deliveries, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function assignRiderToInternalDelivery(
  id: string,
  riderId: string
) {
  if (isLocalMockEnabled()) {
    return requestLocalMock<Record<string, unknown>>(
      `/api/mock/deliveries/${id}/assign`,
      {
        method: "POST",
        body: JSON.stringify({
          rider_id: riderId,
        }),
      }
    );
  }

  return requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.assignRider(id), {
    method: "POST",
    body: JSON.stringify({
      rider_id: riderId,
    }),
  });
}

export async function getInternalDeliveryById(token: string, id: string) {
  return requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.deliveryById(id), {
    method: "GET",
    headers: withAuthHeaders(token),
  });
}

export async function updateInternalDeliveryStatus(
  token: string,
  id: string,
  status: string
) {
  return requestJson<Record<string, unknown>>(API_ENDPOINTS.internal.updateStatus(id), {
    method: "PUT",
    headers: withAuthHeaders(token),
    body: JSON.stringify(status),
  });
}
