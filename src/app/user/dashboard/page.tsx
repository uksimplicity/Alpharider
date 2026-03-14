"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  return (
    <div className="auth-page user-dashboard-page">
      <div className="auth-card user-dashboard-card">
        <header className="user-topbar">
          <button
            className="user-avatar-button"
            type="button"
            aria-label="Open profile"
            onClick={() => router.push("/user/customer-dashboard-4")}
          >
            <img className="user-avatar" src="/icons/user.svg" alt="Oluwatobi" />
          </button>
          <img className="user-logo" src="/logo.png" alt="AlphaRide" />
          <button
            className="user-bell"
            type="button"
            aria-label="Notifications"
            onClick={() => router.push("/user/notification")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        <p className="user-greeting">Hello, Oluwatobi!</p>

        <section className="user-balance">
          <p className="user-balance-label">
            Total Balance{" "}
            <button
              className="user-balance-toggle"
              type="button"
              aria-label={showBalance ? "Hide balance" : "Show balance"}
              onClick={() => setShowBalance((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M1.5 12s4-6.5 10.5-6.5S22.5 12 22.5 12s-4 6.5-10.5 6.5S1.5 12 1.5 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                {showBalance ? (
                  <path
                    d="M4 4l16 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                ) : null}
              </svg>
            </button>
          </p>
          <p className="user-balance-amount">
            {showBalance ? "N3,454.00" : "****"}
          </p>
        </section>

        <section className="user-activities">
          <h2>Activities</h2>
          <button
            className="activity-card"
            type="button"
            onClick={() => router.push("/user/delivery-empty")}
          >
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
            <span>Delivery</span>
          </button>
        </section>

        <nav className="user-bottom-nav">
          <button
            className="nav-item"
            type="button"
            onClick={() => router.push("/user/wallet")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" />
              <path
                d="M7 15l3-3 2.5 2.5 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Wallet</span>
          </button>
          <button className="nav-item active" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M9 20v-6h6v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            <span>Home</span>
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => router.push("/user/in-app-chat")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M4 18v-6a8 8 0 1 1 16 0v6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M4 18a2 2 0 0 0 2 2h2v-6H6a2 2 0 0 0-2 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M20 18a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 1 2 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            <span>Support</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
