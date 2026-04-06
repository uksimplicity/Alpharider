import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const withQuery = (path: string, query?: Record<string, string | number | undefined>) => {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export type CommissionStatus = "pending" | "paid" | "cancelled";

export type GetCommissionsQuery = {
  rider_id?: string;
  delivery_id?: string;
  order_id?: string;
  status?: CommissionStatus;
  source?: string;
  paid_after?: string;
  paid_before?: string;
  limit?: number;
  offset?: number;
};

export const getCommissions = (token: string, query?: GetCommissionsQuery) =>
  requestJson<Record<string, unknown>>(
    withQuery(API_ENDPOINTS.admin.commissions, query),
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );

export const getCommissionById = (token: string, commissionId: string) =>
  requestJson<Record<string, unknown>>(
    API_ENDPOINTS.admin.commissionById(commissionId),
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );

export const getCommissionByDeliveryId = (token: string, deliveryId: string) =>
  requestJson<Record<string, unknown>>(
    API_ENDPOINTS.admin.commissionByDelivery(deliveryId),
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );

export const getCommissionByOrderId = (token: string, orderId: string) =>
  requestJson<Record<string, unknown>>(
    API_ENDPOINTS.admin.commissionByOrder(orderId),
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );

export const getCommissionsByRiderId = (
  token: string,
  riderId: string,
  query?: { status?: CommissionStatus; limit?: number; offset?: number }
) =>
  requestJson<Record<string, unknown>>(
    withQuery(API_ENDPOINTS.admin.commissionsByRider(riderId), query),
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );

export const getCommissionSummaryByRiderId = (token: string, riderId: string) =>
  requestJson<Record<string, unknown>>(
    API_ENDPOINTS.admin.commissionSummaryByRider(riderId),
    {
      method: "GET",
      headers: withAuthHeaders(token),
    }
  );

export type UpdateCommissionPayload = {
  commission_amt?: number;
  commission_rate?: number;
  ledger_entry_id?: string;
  paid_at?: string;
  status?: string;
};

export const updateCommission = (
  token: string,
  commissionId: string,
  payload: UpdateCommissionPayload
) =>
  requestJson<Record<string, unknown>>(
    API_ENDPOINTS.admin.commissionById(commissionId),
    {
      method: "PATCH",
      headers: withAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );

export const markCommissionPaid = (
  token: string,
  commissionId: string,
  ledgerEntryId: string
) =>
  requestJson<Record<string, unknown>>(
    API_ENDPOINTS.admin.markCommissionPaid(commissionId),
    {
      method: "PATCH",
      headers: withAuthHeaders(token),
      body: JSON.stringify({ ledger_entry_id: ledgerEntryId }),
    }
  );

export const getPlatformSettings = (token: string) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.admin.platformSettings, {
    method: "GET",
    headers: withAuthHeaders(token),
  });

export const getPlatformSettingByKey = (token: string, key: string) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.admin.platformSettingByKey(key), {
    method: "GET",
    headers: withAuthHeaders(token),
  });
