import { useMemo } from "react";
import {
  adminService,
  authService,
  internalDeliveryService,
  riderAppDeliveryService,
  riderDeliveryService,
  riderService,
  uploadService,
  userService,
} from "../services";

export const useApiServices = () =>
  useMemo(
    () => ({
      auth: authService,
      rider: riderService,
      riderDelivery: riderDeliveryService,
      riderAppDelivery: riderAppDeliveryService,
      internalDelivery: internalDeliveryService,
      user: userService,
      upload: uploadService,
      admin: adminService,
    }),
    []
  );
