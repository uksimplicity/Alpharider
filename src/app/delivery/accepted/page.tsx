"use client";

import { useRouter } from "next/navigation";

export default function DeliveryAcceptedPage() {
  const router = useRouter();

  return (
    <div className="auth-page delivery-accepted-page">
      <div className="auth-card rider-card delivery-card-layout">
        <div className="delivery-detail-page accepted-layout">
          <div className="map-layer">
            <header className="map-topbar">
              <button
                className="map-back"
                type="button"
                aria-label="Go back"
                onClick={() => router.back()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M15 6l-6 6 6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <img className="map-logo" src="/logo.png" alt="AlphaRide" />
            </header>

            <div className="route-search">
              <span className="route-dot" />
              <span>Gbagi market, Iwo road</span>
            </div>
          </div>

          <section className="delivery-sheet accepted-sheet">
            <div className="turn-row">
              <span className="turn-flag" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M6 5v14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 6h10l-2.8 3L16 12H6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="turn-title">Turn left</p>
                <p className="turn-subtitle">3mins out to pick up location</p>
              </div>
            </div>

            <div className="rider-summary accepted-summary">
              <div className="rider-info">
                <img
                  className="rider-photo"
                  src="/icons/user.svg"
                  alt="Oluwatobi"
                />
                <div>
                  <p className="rider-name">Oluwatobi</p>
                  <p className="rider-rating">
                    <span className="rating-star">?</span> 4.8 <span>(345)</span>
                  </p>
                </div>
              </div>
              <div className="rider-actions">
                <button type="button" aria-label="Call rider">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M6.6 2.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-1.6 1.6c1.2 2.3 3.2 4.3 5.6 5.6l1.6-1.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-2 2c-.7.7-1.8 1-2.8.8-6.6-1.4-11.8-6.6-13.2-13.2-.2-1 .1-2.1.8-2.8l2-2Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
                <button type="button" aria-label="Message rider">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M4 5h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <button
              className="sheet-btn primary accepted-cta"
              type="button"
              onClick={() => router.push("/delivery/start-ride")}
            >
              I HAVE ARRIVED
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
