"use client";

import { useRouter } from "next/navigation";

export default function ChangePinPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-dashboard-page">
      <div className="auth-card user-page-card settings-card">
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

        <h1 className="user-page-title">Set Transaction PIN</h1>

        <div className="edit-form">
          <label>
            <span>Set PIN</span>
            <div className="input-group">
              <input type="password" placeholder="Enter new pin" />
            </div>
          </label>
          <label>
            <span>Confirm PIN</span>
            <div className="input-group">
              <input type="password" placeholder="Confirm new pin" />
            </div>
          </label>
        </div>

        <button className="user-primary-button form-cta" type="button">
          Save PIN
        </button>
      </div>
    </div>
  );
}
