"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatDate(value: Date) {
  return value.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const currentDate = formatDate(new Date());
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(false);
  const balance = "NGN 42,800";
  const rideRequests = [
    {
      from: "Gbagi market, Iwo road",
      to: "Tulip Pharmacy, Oluwo",
    },
    {
      from: "Gbagi market, Iwo road",
      to: "Ajia junction",
    },
  ];
  const scheduledRide = {
    from: "Kinikan complex, Oluwo",
    to: "Ventura hall, Samonda",
    date: "Mon",
    day: "25, May",
    time: "12:00pm",
  };
  return (
    <div className="auth-page rider-dashboard-page">
      <div className="auth-card rider-card rider-dashboard-card">
        <div className="rider-dashboard">
          <header className="rider-topbar">
            <img className="rider-avatar" src="/icons/user.svg" alt="Moses" />
            <img className="rider-logo" src="/logo.png" alt="AlphaRide" />
            <button
              className="rider-bell"
              type="button"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          <div className="rider-greeting">
            <span className="rider-date">{currentDate}</span>
            <h1>Hello, Moses!</h1>
          </div>

          <section className="balance-card">
            <span className="balance-label">
              Total Balance
              <button
                className="balance-toggle"
                type="button"
                aria-label={showBalance ? "Hide balance" : "Show balance"}
                onClick={() => setShowBalance((prev) => !prev)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M1.5 12s4-6.5 10.5-6.5S22.5 12 22.5 12s-4 6.5-10.5 6.5S1.5 12 1.5 12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  {showBalance ? (
                    <path
                      d="M4 4l16 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  ) : null}
                </svg>
              </button>
            </span>
            <span className="balance-amount">
              {showBalance ? balance : "****"}
            </span>
          </section>

          <section className="rider-section">
            <h2>Ride Request</h2>
            <div className="rider-request-list">
              {rideRequests.map((request, index) => (
                <button
                  className="rider-request-card rider-request-action"
                  type="button"
                  onClick={() => router.push("/delivery/request")}
                  key={`${request.from}-${index}`}
                >
                  <div className="route-line">
                    <span className="route-dot" />
                    <span>{request.from}</span>
                  </div>
                  <div className="route-line">
                    <span className="route-pin" />
                    <span>{request.to}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rider-section">
            <h2>Scheduled Ride</h2>
            <div className="rider-scheduled-card">
              <div className="rider-scheduled-routes">
                <div className="route-line">
                  <span className="route-dot" />
                  <span>{scheduledRide.from}</span>
                </div>
                <div className="route-line">
                  <span className="route-pin" />
                  <span>{scheduledRide.to}</span>
                </div>
              </div>
              <div className="rider-scheduled-date">
                <span>{scheduledRide.date}</span>
                <strong>{scheduledRide.day}</strong>
                <span>{scheduledRide.time}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
