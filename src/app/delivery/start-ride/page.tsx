"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  broadcastDeliveryLocation,
  updateDeliveryStatus,
} from "@/lib/deliveries-api";

export default function StartRidePage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartRide = async () => {
    if (isStarting) return;

    const token = localStorage.getItem("alpharider_token");
    const idFromUrl = new URLSearchParams(window.location.search).get("id");
    const deliveryId = idFromUrl ?? localStorage.getItem("alpharider_active_delivery_id") ?? "";

    if (!token || !deliveryId) {
      setErrorMessage("Missing token or delivery ID.");
      return;
    }

    setIsStarting(true);
    setErrorMessage("");

    try {
      await updateDeliveryStatus(token, deliveryId, "in_progress");

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

      router.push(`/delivery/destination-arrived?id=${deliveryId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start ride."
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="auth-page delivery-start-page">
      <div className="auth-card rider-card delivery-card-layout">
        <div className="delivery-detail-page start-ride-layout">
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

          <section className="delivery-sheet start-ride-sheet">
            <p className="sheet-title">15mins to destination</p>
            <div className="sheet-location">
              <span className="route-pin" aria-hidden="true" />
              <span>Tulip Pharmacy, Oluwo</span>
            </div>
            <button
              className="sheet-btn primary start-ride-cta"
              type="button"
              onClick={handleStartRide}
              disabled={isStarting}
            >
              {isStarting ? "Starting..." : "Start Ride"}
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
