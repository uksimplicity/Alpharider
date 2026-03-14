"use client";

import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();

  return (
    <div className="auth-page user-dashboard-page">
      <div className="auth-card user-page-card edit-profile-card">
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

        <div className="edit-profile-hero">
          <img className="edit-profile-avatar" src="/icons/user.svg" alt="Oluwatobi" />
          <div className="edit-profile-actions">
            <button className="user-secondary-button" type="button">
              Delete
            </button>
            <button className="user-primary-button" type="button">
              Change
            </button>
          </div>
        </div>

        <div className="edit-form">
          <label>
            <span>Full Name</span>
            <div className="input-group">
              <input type="text" defaultValue="Oluwatobi Oni" />
            </div>
          </label>

          <label>
            <span>Phone Number</span>
            <div className="input-group split">
              <span className="country-code">+234</span>
              <input type="text" defaultValue="9154772635" />
            </div>
          </label>

          <label>
            <span>Email</span>
            <div className="input-group">
              <input type="email" placeholder="" />
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
