const DEFAULT_API_BASE_URL = "https://marketplace.archintell.com/api/v1";

const normalize = (value: string) => value.replace(/\/$/, "");

export const API_BASE_URL = normalize(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

export const API_ENDPOINTS = {
  admin: {
    commissions: "/admin/commissions",
    commissionById: (commissionId: string) =>
      `/admin/commissions/${commissionId}`,
    commissionByDelivery: (deliveryId: string) =>
      `/admin/commissions/delivery/${deliveryId}`,
    commissionByOrder: (orderId: string) => `/admin/commissions/order/${orderId}`,
    commissionsByRider: (riderId: string) => `/admin/commissions/rider/${riderId}`,
    commissionSummaryByRider: (riderId: string) =>
      `/admin/commissions/rider/${riderId}/summary`,
    markCommissionPaid: (commissionId: string) =>
      `/admin/commissions/${commissionId}/mark-paid`,
    platformSettings: "/admin/platform-settings",
    platformSettingByKey: (key: string) => `/admin/platform-settings/${key}`,
  },
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
  riderApp: {
    deliveries: "/rider-app/deliveries",
    deliveryById: (id: string) => `/rider-app/deliveries/${id}`,
  },
  deliveries: {
    create: "/rider-app/deliveries",
    my: "/rider/deliveries",
    pending: "/deliveries/pending",
    byId: (id: string) => `/rider/deliveries/${id}`,
    accept: (id: string) => `/rider/deliveries/${id}/accept`,
    status: (id: string) => `/rider/deliveries/${id}/status`,
    location: (id: string) => `/rider/deliveries/${id}/location`,
  },
  internal: {
    deliveries: "/internal/deliveries",
    deliveryById: (id: string) => `/internal/deliveries/${id}`,
    assignRider: (id: string) => `/internal/deliveries/${id}/assign`,
    updateStatus: (id: string) => `/internal/deliveries/${id}/status`,
  },
  rider: {
    deliveries: "/rider/deliveries",
    deliveryById: (id: string) => `/rider/deliveries/${id}`,
    acceptDelivery: (id: string) => `/rider/deliveries/${id}/accept`,
    deliveryLocation: (id: string) => `/rider/deliveries/${id}/location`,
    deliveryStatus: (id: string) => `/rider/deliveries/${id}/status`,
    register: "/rider/kyc",
    profile: "/rider/profile",
    status: "/rider/go-online",
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
  legacy: {
    deliveries: {
      create: "/deliveries",
      my: "/deliveries/my",
      pending: "/deliveries/pending",
      byId: (id: string) => `/deliveries/${id}`,
      accept: (id: string) => `/deliveries/${id}/accept`,
      status: (id: string) => `/deliveries/${id}/status`,
      location: (id: string) => `/deliveries/${id}/location`,
    },
    rider: {
      register: "/rider/register",
      status: "/rider/status",
    },
  },
} as const;
