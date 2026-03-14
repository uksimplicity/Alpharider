"use client";

import { useRouter } from "next/navigation";

export default function StartRidePage() {
  const router = useRouter();

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
              onClick={() => router.push("/delivery/destination-arrived")}
            >
              Start Ride
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
