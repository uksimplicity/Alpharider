import {
  forgotPassword,
  loginUser,
  resendOtp,
  resetPassword,
  signupUser,
  verifyOtp,
  verifyPhoneOtp,
} from "./auth-api";
import {
  acceptDelivery,
  assignRiderToInternalDelivery,
  broadcastDeliveryLocation,
  createDelivery,
  createInternalDelivery,
  extractDeliveryId,
  getDeliveryById,
  getInternalDeliveryById,
  getMyDeliveries,
  getPendingDeliveries,
  updateDeliveryStatus,
  updateInternalDeliveryStatus,
} from "./deliveries-api";
import {
  getRiderProfile,
  registerRider,
  updateRiderLocation,
  updateRiderStatus,
} from "./rider-api";
import {
  changeUserPassword,
  getUserProfile,
  updateUserFcmToken,
  updateUserProfile,
} from "./user-api";
import { deleteFile, listFiles, uploadFile } from "./upload-api";
import {
  getCommissionByDeliveryId,
  getCommissionById,
  getCommissionByOrderId,
  getCommissions,
  getCommissionsByRiderId,
  getCommissionSummaryByRiderId,
  getPlatformSettingByKey,
  getPlatformSettings,
  markCommissionPaid,
  updateCommission,
} from "./admin-api";

export * from "./auth-api";
export * from "./deliveries-api";
export * from "./rider-api";
export * from "./user-api";
export * from "./upload-api";
export * from "./admin-api";

export const authService = {
  loginUser,
  signupUser,
  verifyOtp,
  verifyPhoneOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} as const;

export const riderDeliveryService = {
  getPendingDeliveries,
  getMyDeliveries,
  getDeliveryById,
  acceptDelivery,
  updateDeliveryStatus,
  broadcastDeliveryLocation,
  extractDeliveryId,
} as const;

export const riderAppDeliveryService = {
  createDelivery,
  getDeliveryById,
  getMyDeliveries,
  extractDeliveryId,
} as const;

export const internalDeliveryService = {
  createInternalDelivery,
  getInternalDeliveryById,
  assignRiderToInternalDelivery,
  updateInternalDeliveryStatus,
} as const;

export const riderService = {
  registerRider,
  getRiderProfile,
  updateRiderStatus,
  updateRiderLocation,
} as const;

export const userService = {
  changeUserPassword,
  getUserProfile,
  updateUserProfile,
  updateUserFcmToken,
} as const;

export const uploadService = {
  uploadFile,
  listFiles,
  deleteFile,
} as const;

export const adminService = {
  getCommissions,
  getCommissionById,
  getCommissionByDeliveryId,
  getCommissionByOrderId,
  getCommissionsByRiderId,
  getCommissionSummaryByRiderId,
  updateCommission,
  markCommissionPaid,
  getPlatformSettings,
  getPlatformSettingByKey,
} as const;
