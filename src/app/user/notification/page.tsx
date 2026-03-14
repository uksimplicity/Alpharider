"use client";

import { useRouter } from "next/navigation";

const weekNotifications = [
  {
    icon: "scooter",
    message: "Your Ride Request has been accepted by Oluwatobi",
    time: "12:59pm Today",
    highlight: true,
  },
  {
    icon: "parcel",
    message: "Your order MAY23230024 has been completed",
    time: "12:59pm Today",
    highlight: true,
  },
  {
    icon: "wallet",
    message: "You have successfully deposited N5,000 into your wallet.",
    time: "12:59pm Today",
  },
  {
    icon: "car",
    message: "Your Ride Request has been cancelled by Oluwatobi",
    time: "12:59pm Today",
    highlight: true,
  },
  {
    icon: "wallet",
    message: "You have successfully recharged 09289483903 with N2,000",
    time: "12:59pm Yesterday",
    highlight: true,
  },
  {
    icon: "wallet",
    message:
      "Your electricity bill payment of N3,500 has been credited to meter number 7493399209303988 successfully",
    time: "12:59pm 29/05",
  },
];

const monthNotifications = [
  {
    icon: "wallet",
    message: "You have successfully recharged 09289483903 with N2,000",
    time: "12:59pm 22/05",
  },
  {
    icon: "wallet",
    message:
      "Your electricity bill payment of N3,500 has been credited to meter number 7493399209303988 successfully",
    time: "12:59pm 21/05",
  },
  {
    icon: "wallet",
    message: "You have successfully recharged 09289483903 with N2,000",
    time: "12:59pm 20/05",
  },
];

export default function NotificationPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card notification-card">
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

        <h1 className="user-page-title">Notification</h1>

        <section className="notification-section">
          <h2>This week</h2>
          <div className="notification-list">
            {weekNotifications.map((item, index) => (
              <div
                className={`notification-item ${item.highlight ? "highlight" : ""}`}
                key={`${item.message}-${index}`}
              >
                <span className={`notification-icon ${item.icon}`} />
                <div>
                  <p>{item.message}</p>
                  <span>{item.time}</span>
                </div>
                {item.highlight ? <span className="notification-dot" /> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="notification-section">
          <h2>This Month</h2>
          <div className="notification-list">
            {monthNotifications.map((item, index) => (
              <div className="notification-item" key={`${item.message}-${index}`}>
                <span className={`notification-icon ${item.icon}`} />
                <div>
                  <p>{item.message}</p>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
