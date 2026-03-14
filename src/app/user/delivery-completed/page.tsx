"use client";

import { useRouter } from "next/navigation";

const tips = ["NO tip", "N100", "N200", "N300", "N400", "N500", "N1,000"];

export default function DeliveryCompletedPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card completed-card">
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
          <button
            className="user-header-button"
            type="button"
            aria-label="Close"
            onClick={() => router.back()}
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

        <p className="completed-title">Order MAY23230024 completed</p>

        <img className="completed-avatar" src="/icons/user.svg" alt="Moses" />

        <p className="completed-question">How did Moses do?</p>
        <div className="completed-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="star">&#9734;</span>
          ))}
        </div>
        <p className="completed-subtitle">Your feedback is anonymous</p>

        <div className="completed-tip">
          <p>Would you like to leave tip for him?</p>
          <div className="tip-grid">
            {tips.map((tip) => (
              <button key={tip} className="tip-button" type="button">
                {tip}
              </button>
            ))}
          </div>
          <label className="tip-input">
            <span>Enter Amount</span>
            <input type="text" placeholder="Min. N50" />
          </label>
        </div>

        <button className="user-primary-button form-cta" type="button">
          Confirm Tip
        </button>
      </div>
    </div>
  );
}
