import { requestJson } from "./api";

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export type UserProfile = {
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
  requestJson<Record<string, unknown>>("/user/change-password", {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });

export const getUserProfile = (token: string) =>
  requestJson<UserProfile>("/user/profile", {
    method: "GET",
    headers: withAuthHeaders(token),
  });

export const updateUserProfile = (token: string, payload: UserProfile) =>
  requestJson<Record<string, unknown>>("/user/profile", {
    method: "PUT",
    headers: withAuthHeaders(token),
    body: JSON.stringify(payload),
  });

export const updateUserFcmToken = (token: string, fcmToken: string) =>
  requestJson<Record<string, unknown>>("/user/update-fcm-token", {
    method: "POST",
    headers: withAuthHeaders(token),
    body: JSON.stringify({ fcm_token: fcmToken }),
  });
