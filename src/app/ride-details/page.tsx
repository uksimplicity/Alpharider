"use client";

import { useRouter } from "next/navigation";

export default function RideDetailsPage() {
  const router = useRouter();

  return (
    <div className="auth-page rider-dashboard-page">
      <div className="auth-card rider-card rider-dashboard-card">
        <div className="rider-details">
          <h1 className="rider-details-title">Ride Details</h1>

          <div className="rider-details-map" aria-hidden="true" />

          <div className="rider-request-list">
            <div className="rider-request-card">
              <div className="route-line">
                <span className="route-dot" />
                <span>Gbagi market, Iwo road</span>
              </div>
              <div className="route-line">
                <span className="route-pin" />
                <span>Tulip Pharmacy, Oluwo</span>
              </div>
            </div>
          </div>

          <div className="rider-details-actions">
            <button
              className="sheet-btn outline"
              type="button"
              onClick={() => router.push("/ride-decline-confirm")}
            >
              Decline
            </button>
            <button
              className="sheet-btn primary"
              type="button"
              onClick={() => router.push("/arrived-pickup")}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
