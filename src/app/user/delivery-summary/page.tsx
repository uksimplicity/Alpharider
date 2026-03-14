"use client";

import { useRouter } from "next/navigation";

export default function DeliverySummaryPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card user-summary-card">
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

        <h1 className="user-page-title">Delivery Summary</h1>

        <div className="upload-preview summary-preview">
          <img src="/images/parcel.png" alt="Package" />
        </div>

        <section className="summary-section">
          <h2>Delivery Details (MAY23230024)</h2>
          <ul className="summary-list">
            <li>Pick up location</li>
            <li>Destination</li>
            <li>Today</li>
            <li>Anytime</li>
            <li>N1,500</li>
          </ul>
        </section>

        <section className="summary-section">
          <h2>Sender</h2>
          <ul className="summary-list">
            <li>Oluwatobi</li>
            <li>0825666788</li>
          </ul>
        </section>

        <section className="summary-section">
          <h2>Receiver</h2>
          <ul className="summary-list">
            <li>Oluwatobi</li>
            <li>0825666788, 09067776777</li>
          </ul>
        </section>

        <button className="link-button" type="button">
          Add Another Package
        </button>

        <button
          className="user-primary-button form-cta"
          type="button"
          onClick={() => router.push("/user/payment-method")}
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
}
