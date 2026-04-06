import { requestJson, requestJsonWithFallback } from "./api";
import { API_ENDPOINTS } from "./endpoints";

export type RegisterRiderPayload = {
  vehicle_type: string;
  vehicle_number: string;
  vehicle_model?: string;
  documents?: string[];
};

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const registerRider = (
  token: string,
  payload: RegisterRiderPayload
) => {
  return requestJsonWithFallback<Record<string, unknown>>(
    [API_ENDPOINTS.rider.register, API_ENDPOINTS.legacy.rider.register],
    {
      method: "POST",
      headers: withAuthHeaders(token),
      body: JSON.stringify(payload),
    }
  );
};

export const getRiderProfile = (token: string) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.rider.profile, {
    method: "GET",
    headers: withAuthHeaders(token),
  });

export const updateRiderStatus = (
  token: string,
  status: "available" | "busy" | "offline"
) =>
  requestJsonWithFallback<Record<string, unknown>>(
    [API_ENDPOINTS.rider.status, API_ENDPOINTS.legacy.rider.status],
    {
      method: "PUT",
      headers: withAuthHeaders(token),
      body: JSON.stringify({ status }),
    }
  );

export const updateRiderLocation = (
  token: string,
  payload: {
    latitude: number;
    longitude: number;
  }
) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.rider.location, {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });
