"use client";

import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
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

        <h1 className="user-page-title">Change Password</h1>

        <div className="edit-form">
          <label>
            <span>Current Password</span>
            <div className="input-group">
              <input type="password" placeholder="Enter current password" />
            </div>
          </label>
          <label>
            <span>New Password</span>
            <div className="input-group">
              <input type="password" placeholder="Enter new password" />
            </div>
          </label>
          <label>
            <span>Confirm New Password</span>
            <div className="input-group">
              <input type="password" placeholder="Confirm new password" />
            </div>
          </label>
        </div>

        <button className="user-primary-button form-cta" type="button">
          Save Changes
        </button>
      </div>
    </div>
  );
}
