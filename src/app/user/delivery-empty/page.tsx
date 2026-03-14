"use client";

import { useRouter } from "next/navigation";

export default function UserDeliveryEmptyPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card">
        <header className="user-page-header">
          <button
            className="user-header-button"
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
          <img className="user-header-logo" src="/logo.png" alt="AlphaRide" />
          <button className="user-header-button" type="button" aria-label="Menu">
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

        <h1 className="user-page-title">Delivery</h1>

        <button
          className="user-primary-button"
          type="button"
          onClick={() => router.push("/user/delivery")}
        >
          Create New Delivery
        </button>

        <section className="user-section">
          <h2>Pending Delivery</h2>
          <div className="empty-card">
            <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <g fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M30 70h46l12-22H44l-7 12" />
                <path d="M74 48l12 22h20" />
                <rect x="64" y="28" width="20" height="16" rx="2" />
                <path d="M34 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                <path d="M88 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                <path d="M50 94h26" />
              </g>
            </svg>
            <p>You currently have no pending order</p>
          </div>
        </section>

        <section className="user-section">
          <h2>Recent Delivery</h2>
          <div className="empty-card muted">
            <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <g fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M30 70h46l12-22H44l-7 12" />
                <path d="M74 48l12 22h20" />
                <rect x="64" y="28" width="20" height="16" rx="2" />
                <path d="M34 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                <path d="M88 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                <path d="M50 94h26" />
              </g>
            </svg>
            <p>
              You have not ordered any delivery yet. Would you like to change
              that today?
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
