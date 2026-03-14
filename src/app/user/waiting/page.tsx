"use client";

import { useRouter } from "next/navigation";

export default function WaitingPage() {
  const router = useRouter();

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
        </div>

        <section className="payment-sheet waiting-sheet">
          <p className="waiting-title">Waiting for rider to accept</p>

          <div className="waiting-card">
            <div className="waiting-info">
              <img className="waiting-avatar" src="/icons/user.svg" alt="Moses" />
              <div>
                <p className="waiting-name">Moses</p>
                <p className="waiting-rating">
                  <span className="rating-star">&#9733;</span> 4.8 (345)
                </p>
              </div>
            </div>
            <div className="waiting-meta">
              <p className="waiting-count">345</p>
              <p>Completed Orders</p>
            </div>
          </div>

          <div className="waiting-actions">
            <button
              className="waiting-button outline"
              type="button"
              onClick={() => router.push("/user/in-app-call")}
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
        </section>
      </div>
    </div>
  );
}
