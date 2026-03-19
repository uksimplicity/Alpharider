import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";

type LoginPayload = {
  email?: string;
  phone?: string;
  password: string;
};

type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: "rider" | "rider_app_customer";
};

type VerifyOtpPayload = {
  otp: string;
  email: string;
};

type ResendOtpPayload = {
  email: string;
  type?: "signup" | "resend_verification" | "forgot_password";
};

type ApiMessageResponse = {
  message?: string;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  requiresVerification?: boolean;
};

export const loginUser = (payload: LoginPayload) =>
  requestJson<ApiMessageResponse>(API_ENDPOINTS.auth.login, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const signupUser = (payload: SignupPayload) =>
  requestJson<ApiMessageResponse>(API_ENDPOINTS.auth.register, {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone,
      role: payload.role,
    }),
  });

export const verifyOtp = (payload: VerifyOtpPayload) =>
  requestJson<ApiMessageResponse>(API_ENDPOINTS.auth.verifyEmail, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resendOtp = (payload: ResendOtpPayload) =>
  requestJson<ApiMessageResponse>(API_ENDPOINTS.auth.resendVerification, {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      type: payload.type ?? "signup",
    }),
  });

export const verifyPhoneOtp = (payload: VerifyOtpPayload) =>
  requestJson<ApiMessageResponse>(API_ENDPOINTS.auth.verifyPhone, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const forgotPassword = (email: string) =>
  requestJson<ApiMessageResponse>(API_ENDPOINTS.auth.forgotPassword, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (payload: {
  email: string;
  otp: number;
  newPassword: string;
}) =>
  requestJson<ApiMessageResponse>(API_ENDPOINTS.auth.resetPassword, {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      otp: payload.otp,
      new_password: payload.newPassword,
    }),
  });
