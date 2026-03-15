import { requestJson } from "./api";

type LoginPayload = {
  email: string;
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

const LOGIN_PATH = process.env.NEXT_PUBLIC_API_LOGIN_PATH ?? "/auth/login";
const SIGNUP_PATH = process.env.NEXT_PUBLIC_API_SIGNUP_PATH ?? "/auth/register";
const VERIFY_OTP_PATH = process.env.NEXT_PUBLIC_API_VERIFY_OTP_PATH ?? "/auth/verify-email";
const VERIFY_PHONE_OTP_PATH =
  process.env.NEXT_PUBLIC_API_VERIFY_PHONE_OTP_PATH ?? "/auth/verify-phone";
const RESEND_OTP_PATH =
  process.env.NEXT_PUBLIC_API_RESEND_OTP_PATH ?? "/auth/resend-verification";
const FORGOT_PASSWORD_PATH =
  process.env.NEXT_PUBLIC_API_FORGOT_PASSWORD_PATH ?? "/auth/forgot-password";
const RESET_PASSWORD_PATH =
  process.env.NEXT_PUBLIC_API_RESET_PASSWORD_PATH ?? "/auth/reset-password";

export const loginUser = (payload: LoginPayload) =>
  requestJson<ApiMessageResponse>(LOGIN_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const signupUser = (payload: SignupPayload) =>
  requestJson<ApiMessageResponse>(SIGNUP_PATH, {
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
  requestJson<ApiMessageResponse>(VERIFY_OTP_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resendOtp = (payload: ResendOtpPayload) =>
  requestJson<ApiMessageResponse>(RESEND_OTP_PATH, {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      type: payload.type ?? "signup",
    }),
  });

export const verifyPhoneOtp = (payload: VerifyOtpPayload) =>
  requestJson<ApiMessageResponse>(VERIFY_PHONE_OTP_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const forgotPassword = (email: string) =>
  requestJson<ApiMessageResponse>(FORGOT_PASSWORD_PATH, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (payload: {
  email: string;
  otp: number;
  newPassword: string;
}) =>
  requestJson<ApiMessageResponse>(RESET_PASSWORD_PATH, {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      otp: payload.otp,
      new_password: payload.newPassword,
    }),
  });
