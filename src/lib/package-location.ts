import { loadGoogleMaps, type DeliveryPoint } from "./google-maps";

export type PackageLocation = DeliveryPoint & { address: string };
export function validPackagePoint(point: DeliveryPoint | null): point is DeliveryPoint {
  return Boolean(point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180
    && !(point.latitude === 0 && point.longitude === 0));
}
export function packageRoute(pickupAddress: string, destinationAddress: string, pickup: PackageLocation | null, destination: PackageLocation | null) {
  if (!pickupAddress.trim() || !destinationAddress.trim()) throw new Error("Enter your pickup and destination addresses.");
  if (!validPackagePoint(pickup) || pickup.address !== pickupAddress.trim()) throw new Error("Confirm the pickup location before creating your delivery.");
  if (!validPackagePoint(destination) || destination.address !== destinationAddress.trim()) throw new Error("Confirm the destination location before creating your delivery.");
  if (pickup.latitude === destination.latitude && pickup.longitude === destination.longitude) throw new Error("Choose a different destination from your pickup.");
  return { pickup_address: pickupAddress.trim(), pickup_lat: pickup.latitude, pickup_lng: pickup.longitude,
    dropoff_address: destinationAddress.trim(), dropoff_lat: destination.latitude, dropoff_lng: destination.longitude };
}
export async function locatePackageAddress(address: string): Promise<DeliveryPoint> {
  const api = await loadGoogleMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "");
  const Geocoder = api.Geocoder;
  if (!Geocoder) throw new Error("Address lookup is unavailable. Choose the location on the map or use your current location if you are there.");
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Address lookup took too long. Try again or choose the location on the map.")), 10000);
    try {
      new Geocoder().geocode({ address: address.trim(), region: "ng" }, (results, status) => {
        clearTimeout(timer);
        const result = status === "OK" && results?.length === 1 ? results[0] : null;
        if (!result || result.partial_match || !result.types.some(type => ["street_address", "premise", "subpremise"].includes(type)) || !["ROOFTOP", "RANGE_INTERPOLATED"].includes(result.geometry.location_type)) {
          reject(new Error("We couldn’t locate the exact address. Check the house number, street, state and local government, or choose the location on the map.")); return;
        }
        const point = { latitude: result.geometry.location.lat(), longitude: result.geometry.location.lng() };
        if (!validPackagePoint(point)) { reject(new Error("Choose a valid location on the map.")); return; }
        resolve(point);
      });
    } catch { clearTimeout(timer); reject(new Error("Address lookup is unavailable. Try again or choose the location on the map.")); }
  });
}
