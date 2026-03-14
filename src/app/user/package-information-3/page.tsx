"use client";

import { useRouter } from "next/navigation";

export default function PackageInformationPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card user-form-card">
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

        <h1 className="user-page-title">Package Information</h1>

        <div className="form-group">
          <h2>Location</h2>
          <label>
            <span>From</span>
            <input type="text" placeholder="Enter Pick up location" />
          </label>
          <label>
            <span>To</span>
            <input type="text" placeholder="Enter Destination" />
          </label>
        </div>

        <div className="form-group">
          <h2>Receiver</h2>
          <label>
            <span>Receiver's Name</span>
            <input type="text" placeholder="Enter name" />
          </label>
          <label>
            <span>Receiver's Phone Number</span>
            <input type="text" placeholder="Phone Number" />
          </label>
          <label>
            <span>Alternative Number (Optional)</span>
            <input type="text" placeholder="Phone Number" />
          </label>
        </div>

        <div className="form-row">
          <label>
            <span>Date</span>
            <input type="text" placeholder="23-05-2023" />
          </label>
          <label>
            <span>Time</span>
            <input type="text" placeholder="12:00" />
          </label>
        </div>

        <div className="form-row form-checks">
          <label className="checkbox">
            <input type="checkbox" defaultChecked />
            <span>Today?</span>
          </label>
          <label className="checkbox">
            <input type="checkbox" />
            <span>Anytime?</span>
          </label>
        </div>

        <button
          className="user-primary-button form-cta"
          type="button"
          onClick={() => router.push("/user/delivery-summary")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
