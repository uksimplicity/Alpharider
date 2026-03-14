"use client";

import { useRouter } from "next/navigation";

export default function InAppCallPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card in-app-card">
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
          <span className="user-header-spacer" />
        </header>

        <div className="call-center">
          <img className="call-avatar" src="/icons/user.svg" alt="Moses" />
          <p className="call-name">Moses</p>
          <p className="call-status">Calling...</p>
        </div>

        <div className="call-actions">
          <button className="call-button end" type="button">
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}
