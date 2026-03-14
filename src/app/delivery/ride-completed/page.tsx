"use client";

import { useRouter } from "next/navigation";

export default function RideCompletedPage() {
  const router = useRouter();

  return (
    <div className="auth-page ride-completed-page">
      <div className="auth-card ride-completed-card">
        <header className="ride-completed-header">
          <button
            className="ride-icon-button"
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
          <span className="ride-header-title">Order Details</span>
          <button
            className="ride-icon-button"
            type="button"
            aria-label="Close"
            onClick={() => router.push("/delivery/start-ride")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6l-12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <p className="ride-status">You have arrived at your destination</p>

        <div className="ride-amount">
          <span>Amount:</span>
          <strong>N1,500</strong>
        </div>

        <div className="ride-wallet" aria-hidden="true">
          <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
            <rect
              x="18"
              y="34"
              width="84"
              height="52"
              rx="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <rect
              x="66"
              y="48"
              width="26"
              height="24"
              rx="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <circle cx="78" cy="60" r="5" fill="currentColor" />
          </svg>
        </div>

        <p className="ride-note">
          Payment method is cash. Make sure you receive payment before pressing
          below button. Confirm account balance in case of transfer. RideEasy
          will not be responsible for any negligence
        </p>

        <button
          className="sheet-btn primary ride-completed-cta"
          type="button"
          onClick={() => router.push("/dashboard")}
        >
          Payment Received
        </button>
      </div>
    </div>
  );
}
