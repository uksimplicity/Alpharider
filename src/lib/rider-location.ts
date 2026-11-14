import { accountRequest, checkSession, currentToken } from "./account-client";
import type { Availability } from "./backend-data";
import { requireApprovedRider } from "./rider-access";

export class LocationAccessError extends Error {}
let permissionGranted = false;
export const hasDeviceLocationPermission = () => permissionGranted;

export function deviceLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new LocationAccessError("Your browser cannot access your location. Use a browser with location support to go online.")); return; }
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) { reject(new LocationAccessError("Your location could not be determined. Please try again.")); return; }
      permissionGranted = true;
      resolve({ latitude, longitude });
    }, error => reject(new LocationAccessError(error.code === 1 ? "Allow location access in your browser to go online." : "Your location could not be determined. Check location services and try again.")), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
}

export async function setAvailabilityFromDevice(status: Availability) {
  const token = currentToken();
  if (status === "available") {
    await requireApprovedRider(); checkSession(token);
    const location = await deviceLocation();
    checkSession(token);
    await accountRequest("/rider/location", { method: "POST", body: JSON.stringify(location) });
    checkSession(token);
  }
  try { return await accountRequest("/rider/go-online", { method: "PUT", body: JSON.stringify({ status }) }); }
  finally { if (typeof window !== "undefined") window.dispatchEvent(new Event("alpharider:availability")); }
}
