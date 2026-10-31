import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export type UserProfile = {
  id?: string;
  _id?: string;
  customer_id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  profile_picture?: string;
  latitude?: number;
  longitude?: number;
};

export const changeUserPassword = (
  token: string,
  payload: {
    currentPassword: string;
    newPassword: string;
    userID?: string;
  }
) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.user.changePassword, {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });

export const getUserProfile = async (token: string): Promise<UserProfile> => {
  const response = await requestJson<UserProfile & { data?: UserProfile }>(API_ENDPOINTS.user.profile, {
    method: "GET",
    headers: withAuthHeaders(token),
  });
  return response.data ?? response;
};

export const updateUserProfile = (token: string, payload: UserProfile) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.user.profile, {
    method: "PUT",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });

export const updateUserFcmToken = (token: string, fcmToken: string) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.user.updateFcmToken, {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify({ fcm_token: fcmToken }),
  });
