"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  broadcastDeliveryLocation,
  getDeliveryById,
  updateDeliveryStatus,
} from "@/lib/deliveries-api";

export default function DestinationArrivedPage() {
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("Destination");

  useEffect(() => {
    const loadDelivery = async () => {
      const token = localStorage.getItem("alpharider_token");
      const idFromUrl = new URLSearchParams(window.location.search).get("id");
      const deliveryId =
        idFromUrl ??
        localStorage.getItem("alpharider_active_delivery_id") ??
        "";
      if (!token || !deliveryId) return;

      try {
        const delivery = await getDeliveryById(token, deliveryId);
        setDestinationLabel(delivery.dropoff_address ?? "Destination");
      } catch {
        // Keep page usable even if delivery fetch fails.
      }
    };

    void loadDelivery();
  }, []);

  const handleEndTrip = async () => {
    if (isEnding) return;

    const token = localStorage.getItem("alpharider_token");
    const idFromUrl = new URLSearchParams(window.location.search).get("id");
    const deliveryId = idFromUrl ?? localStorage.getItem("alpharider_active_delivery_id") ?? "";

    if (!token || !deliveryId) {
      setErrorMessage("Missing token or delivery ID.");
      return;
    }

    setIsEnding(true);
    setErrorMessage("");

    try {
      await updateDeliveryStatus(token, deliveryId, "completed");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            void broadcastDeliveryLocation(token, deliveryId, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            // Continue even if geolocation fails.
          }
        );
      }

      localStorage.removeItem("alpharider_active_delivery_id");
      router.push("/delivery/ride-completed");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to end trip."
      );
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="auth-page delivery-destination-page">
      <div className="auth-card rider-card delivery-card-layout">
        <div className="delivery-detail-page destination-layout">
          <div className="map-layer">
            <header className="map-topbar map-topbar-slim">
              <img className="map-logo" src="/logo.png" alt="AlphaRide" />
              <button className="map-menu" type="button" aria-label="Menu">
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
          </div>

          <section className="delivery-sheet destination-sheet">
            <p className="sheet-title">Arrived at destination</p>
            <div className="sheet-location">
              <span className="route-pin" aria-hidden="true" />
              <span>{destinationLabel}</span>
            </div>
            <button
              className="sheet-btn end-trip-cta"
              type="button"
              onClick={handleEndTrip}
              disabled={isEnding}
            >
              {isEnding ? "Ending..." : "End Trip"}
            </button>
            {errorMessage ? (
              <p className="helper danger" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
