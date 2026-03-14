"use client";

import { useRouter } from "next/navigation";

const deliveries = [
  { id: "MAY23230024", status: "Transit", tone: "blue" },
  { id: "MAY23230024", status: "Pending", tone: "amber" },
];

const recentDeliveries = [
  { id: "MAY23230024", status: "Delivered", tone: "green" },
  { id: "MAY23230024", status: "Cancelled", tone: "red" },
  { id: "MAY23230024", status: "Delivered", tone: "green" },
];

export default function UserDeliveryPage() {
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
          onClick={() => router.push("/user/upload-picture")}
        >
          Create New Order
        </button>

        <section className="user-section">
          <h2>Pending Delivery</h2>
          <div className="delivery-list user-delivery-list">
            {deliveries.map((delivery, index) => (
              <div className="delivery-item" key={`${delivery.id}-${index}`}>
                <div className="delivery-thumb">
                  <img src="/images/parcel.png" alt="Package" />
                </div>
                <div className="delivery-info">
                  <p className="delivery-id">{delivery.id}</p>
                  <p className="delivery-destination">Destination</p>
                </div>
                <div className="delivery-meta">
                  <span className={`status-pill ${delivery.tone}`}>
                    {delivery.status}
                  </span>
                  <span className="delivery-time">23/05 12:59pm</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="user-section">
          <h2>Recent Delivery</h2>
          <div className="delivery-list user-delivery-list">
            {recentDeliveries.map((delivery, index) => (
              <div className="delivery-item" key={`${delivery.id}-${index}`}>
                <div className="delivery-thumb">
                  <img src="/images/parcel.png" alt="Package" />
                </div>
                <div className="delivery-info">
                  <p className="delivery-id">{delivery.id}</p>
                  <p className="delivery-destination">Destination</p>
                </div>
                <div className="delivery-meta">
                  <span className={`status-pill ${delivery.tone}`}>
                    {delivery.status}
                  </span>
                  <span className="delivery-time">23/05 12:59pm</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
