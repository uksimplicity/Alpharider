"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeliveryById, type DeliveryRecord } from "@/lib/services";
import { formatDeliveryStatusLabel } from "@/lib/delivery-status";

const estimateRideMinutes = (delivery: DeliveryRecord) => {
  const pickupLat = delivery.pickup_lat;
  const pickupLng = delivery.pickup_lng;
  const dropoffLat = delivery.dropoff_lat;
  const dropoffLng = delivery.dropoff_lng;

  if (
    typeof pickupLat !== "number" ||
    typeof pickupLng !== "number" ||
    typeof dropoffLat !== "number" ||
    typeof dropoffLng !== "number"
  ) {
    return 15;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(dropoffLat - pickupLat);
  const dLng = toRad(dropoffLng - pickupLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickupLat)) *
      Math.cos(toRad(dropoffLat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = 6371 * c;
  const avgCitySpeedKmPerHr = 28;
  const minutes = Math.round((distanceKm / avgCitySpeedKmPerHr) * 60);

  return Math.min(90, Math.max(3, minutes || 15));
};

export default function WaitingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("pending");
  const [pickupContact, setPickupContact] = useState("");
  const [rideMinutes, setRideMinutes] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const nextToken = localStorage.getItem("alpharider_token") ?? "";
    const idFromUrl = new URLSearchParams(window.location.search).get("id");
    const activeId = localStorage.getItem("alpharider_active_delivery_id");
    const nextDeliveryId = idFromUrl ?? activeId ?? "";

    setToken(nextToken);
    setDeliveryId(nextDeliveryId);

    if (!nextDeliveryId) {
      setErrorMessage("Delivery ID is missing. Please create a new booking.");
      setIsLoading(false);
      return;
    }

    if (!nextToken) {
      setErrorMessage("Please log in to continue.");
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (!token || !deliveryId) {
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }

    const syncStatus = async () => {
      try {
        const delivery = await getDeliveryById(token, deliveryId);
        if (!isMounted) return;

        const status = (delivery.status ?? "pending").toLowerCase();
        setDeliveryStatus(status);
        setPickupContact(delivery.pickup_contact ?? "");
        setRideMinutes(estimateRideMinutes(delivery));
        setErrorMessage("");
        setIsLoading(false);

        if (
          status.includes("accepted") ||
          status.includes("assigned") ||
          status.includes("in_progress") ||
          status.includes("transit")
        ) {
          router.push(`/user/delivery-details?id=${deliveryId}`);
          return;
        }

        if (status.includes("completed") || status.includes("delivered")) {
          router.push(`/user/delivery-details?id=${deliveryId}`);
          return;
        }

        if (status.includes("declin") || status.includes("cancel")) {
          router.push("/ride-declined");
        }
      } catch (error) {
        if (!isMounted) return;
        setIsLoading(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load delivery status right now."
        );
      }
    };

    void syncStatus();
    intervalId = setInterval(() => {
      void syncStatus();
    }, 8000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [deliveryId, router, token]);

  const statusLabel = useMemo(
    () => formatDeliveryStatusLabel(deliveryStatus),
    [deliveryStatus]
  );
  const canContactRider = useMemo(() => {
    const normalized = deliveryStatus.toLowerCase();
    return normalized.includes("accepted") || normalized.includes("assigned");
  }, [deliveryStatus]);

  const isDelivered = useMemo(() => {
    const normalized = deliveryStatus.toLowerCase();
    return normalized.includes("completed") || normalized.includes("delivered");
  }, [deliveryStatus]);

  const handleCall = () => {
    if (!pickupContact) return;
    window.location.href = `tel:${pickupContact}`;
  };

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card payment-page-card">
        <div className="payment-map">
          <header className="map-topbar map-topbar-slim">
            <img className="map-logo" src="/logo.png" alt="AlphaRide" />
            <button
              className="map-menu"
              type="button"
              aria-label="Menu"
              onClick={() => router.push("/user/order-successful")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M5 7h14M5 12h14M5 17h14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>
          <div className="waiting-map-duration" aria-live="polite">
            <span>{rideMinutes} mins ride</span>
          </div>
        </div>

        <section className="payment-sheet waiting-sheet">
          <div className="waiting-title-row">
            <p className="waiting-title">
              {isDelivered ? "Delivery completed" : "Waiting for rider to accept"}
            </p>
            <span className="waiting-live">Live</span>
          </div>

          <div className="waiting-status-card">
            <p className="waiting-id">Delivery: {deliveryId || "Unavailable"}</p>
            <span
              className={`waiting-status-pill ${canContactRider ? "active" : "pending"}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="waiting-card">
            <div className="waiting-info">
              <img
                className="waiting-avatar"
                src="/icons/user.svg"
                alt={canContactRider ? "Assigned rider" : "Searching for rider"}
              />
              <div>
                <p className="waiting-name">
                  {isDelivered
                    ? "Delivery completed"
                    : canContactRider
                    ? "Assigned Rider"
                    : "Searching for a nearby rider"}
                </p>
                <p className="waiting-rating">
                  {isDelivered
                    ? "Your package has been delivered."
                    : canContactRider
                    ? "A rider has accepted your request."
                    : "Your delivery request is visible to nearby drivers."}
                </p>
              </div>
            </div>
            <div className="waiting-meta">
              <p className="waiting-count">
                {isDelivered ? "Delivered" : canContactRider ? "Assigned" : "Pending"}
              </p>
              <p>{isDelivered ? "Completed" : canContactRider ? "Ready" : "Finding rider"}</p>
            </div>
          </div>

          {canContactRider && !isDelivered ? (
            <div className="waiting-actions">
              <button
                className="waiting-button outline"
                type="button"
                disabled={!pickupContact}
                onClick={handleCall}
              >
                Call
              </button>
              <button
                className="waiting-button filled"
                type="button"
                onClick={() => router.push("/user/in-app-chat")}
              >
                Message
              </button>
            </div>
          ) : (
            <p className="helper waiting-helper">
              {isDelivered
                ? "This delivery has been completed."
                : "Contact options will appear after rider accepts."}
            </p>
          )}
          {isLoading ? <p className="helper">Checking rider response...</p> : null}
          {errorMessage ? (
            <p className="helper danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

