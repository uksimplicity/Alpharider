const DEFAULT_API_BASE_URL = "https://marketplace.archintell.com/api/v1";

const normalize = (value: string) => value.replace(/\/$/, "");

export const API_BASE_URL = normalize(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

export const API_ENDPOINTS = {
  auth: {
    login: process.env.NEXT_PUBLIC_API_LOGIN_PATH ?? "/auth/login",
    register: process.env.NEXT_PUBLIC_API_SIGNUP_PATH ?? "/auth/register",
    verifyEmail:
      process.env.NEXT_PUBLIC_API_VERIFY_OTP_PATH ?? "/auth/verify-email",
    verifyPhone:
      process.env.NEXT_PUBLIC_API_VERIFY_PHONE_OTP_PATH ?? "/auth/verify-phone",
    resendVerification:
      process.env.NEXT_PUBLIC_API_RESEND_OTP_PATH ?? "/auth/resend-verification",
    forgotPassword:
      process.env.NEXT_PUBLIC_API_FORGOT_PASSWORD_PATH ?? "/auth/forgot-password",
    resetPassword:
      process.env.NEXT_PUBLIC_API_RESET_PASSWORD_PATH ?? "/auth/reset-password",
  },
  deliveries: {
    create: "/deliveries",
    my: "/deliveries/my",
    pending: "/deliveries/pending",
    byId: (id: string) => `/deliveries/${id}`,
    accept: (id: string) => `/deliveries/${id}/accept`,
    status: (id: string) => `/deliveries/${id}/status`,
    location: (id: string) => `/deliveries/${id}/location`,
  },
  internal: {
    createDelivery: "/internal/deliveries",
    assignRider: (id: string) => `/internal/deliveries/${id}/assign`,
  },
  rider: {
    register: "/rider/register",
    profile: "/rider/profile",
    status: "/rider/status",
    location: "/rider/location",
  },
  upload: {
    file: "/upload/file",
    fileById: (id: string) => `/upload/file/${id}`,
    files: "/upload/files",
  },
  user: {
    changePassword: "/user/change-password",
    profile: "/user/profile",
    updateFcmToken: "/user/update-fcm-token",
  },
} as const;
