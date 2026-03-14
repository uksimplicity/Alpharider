"use client";

import { useRouter } from "next/navigation";

const completedOrders = [
  { id: "MAY23230024", status: "Completed", time: "22/05 12:59pm" },
  { id: "MAY23230020", status: "Completed", time: "20/05 02:40pm" },
];

export default function DeliveryHistoryCompletedPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-dashboard-page">
      <div className="auth-card user-page-card history-card">
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

        <h1 className="user-page-title">Delivery History</h1>

        <div className="history-toggle">
          <button
            className="toggle-button"
            type="button"
            onClick={() => router.push("/user/delivery-history-pending")}
          >
            Pending
          </button>
          <button className="toggle-button active" type="button">
            Completed
          </button>
        </div>

        <div className="history-list">
          {completedOrders.map((order) => (
            <div className="history-item" key={order.id}>
              <div>
                <p>{order.id}</p>
                <span>{order.time}</span>
              </div>
              <span className="status-pill green">{order.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
