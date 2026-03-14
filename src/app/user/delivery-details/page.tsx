"use client";

import { useRouter } from "next/navigation";

export default function DeliveryDetailsPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card delivery-details-card">
        <header className="details-header">
          <button
            className="details-back"
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
          <span className="details-spacer" />
        </header>

        <h1 className="details-title">Delivery Details</h1>
        <p className="details-order">Order Number: MAY23230024</p>

        <div className="details-map" />

        <div className="details-progress">
          <span>Pick up</span>
          <div className="progress-line">
            <span className="progress-dot" />
            <span className="progress-dot" />
          </div>
          <span>Completed</span>
        </div>

        <p className="details-status">
          Your package has not been picked up yet!
        </p>

        <div className="details-meta">
          <div>
            <p>Today</p>
            <span>Date</span>
          </div>
          <div>
            <p>Anytime</p>
            <span>Time</span>
          </div>
          <div>
            <p>N1,500</p>
            <span>Price</span>
          </div>
          <div>
            <p>Wallet</p>
            <span>Method</span>
          </div>
        </div>

        <div className="details-rider">
          <div className="details-rider-info">
            <img src="/icons/user.svg" alt="Moses" />
            <div>
              <p>Moses</p>
              <span>
                <span className="rating-star">&#9733;</span> 4.8 (345)
              </span>
            </div>
          </div>
          <button
            className="details-call"
            type="button"
            aria-label="Call rider"
            onClick={() => router.push("/user/delivery-completed")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6.6 2.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-1.6 1.6c1.2 2.3 3.2 4.3 5.6 5.6l1.6-1.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-2 2c-.7.7-1.8 1-2.8.8-6.6-1.4-11.8-6.6-13.2-13.2-.2-1 .1-2.1.8-2.8l2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        <button className="user-secondary-button details-cancel" type="button">
          Cancel
        </button>
      </div>
    </div>
  );
}
