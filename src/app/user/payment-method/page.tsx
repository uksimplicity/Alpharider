"use client";

import { useRouter } from "next/navigation";

export default function PaymentMethodPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card payment-page-card">
        <div className="payment-map">
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

        <section className="payment-sheet">
          <h1 className="payment-title">Payment Method</h1>

          <div className="payment-list">
            <label className="payment-row">
              <input type="radio" name="payment" />
              <div className="payment-row-main">
                <span className="payment-row-title">Cash</span>
              </div>
              <span className="payment-row-amount">N5,800</span>
            </label>

            <label className="payment-row active">
              <input type="radio" name="payment" defaultChecked />
              <div className="payment-row-main">
                <span className="payment-row-title">Wallet</span>
                <span className="payment-row-sub">Balance: 0.00</span>
              </div>
              <span className="payment-row-amount">N5,400</span>
            </label>
          </div>

          <button
            className="user-primary-button payment-cta"
            type="button"
            onClick={() => router.push("/user/select-rider")}
          >
            Select Payment
          </button>
        </section>
      </div>
    </div>
  );
}
