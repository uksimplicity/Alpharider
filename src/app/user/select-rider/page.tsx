"use client";

import { useRouter } from "next/navigation";

const riders = [
  {
    name: "Moses",
    vehicle: "Jincheng",
    time: "3 min.",
    status: "Away",
    rating: "4.8 (345)",
    active: true,
  },
  {
    name: "Ibrahim",
    vehicle: "Bajaj",
    time: "5 min.",
    status: "Away",
    rating: "4.8 (345)",
  },
  {
    name: "Saheed",
    vehicle: "Honda",
    time: "7 min.",
    status: "Away",
    rating: "4.8 (345)",
  },
  {
    name: "Emmanuel",
    vehicle: "Bajaj",
    time: "Offline",
    status: "",
    rating: "",
  },
];

export default function SelectRiderPage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card payment-page-card">
        <div className="payment-map">
          <header className="map-topbar map-topbar-slim">
            <img className="map-logo" src="/logo.png" alt="AlphaRide" />
            <button className="map-menu" type="button" aria-label="Menu">
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
        </div>

        <section className="payment-sheet select-rider-sheet">
          <div className="rider-list">
            {riders.map((rider, index) => (
              <div
                className={`rider-card ${rider.active ? "active" : ""}`}
                key={`${rider.name}-${index}`}
              >
                <div className="rider-avatar">
                  <img src="/icons/user.svg" alt={rider.name} />
                </div>
                <div className="rider-info">
                  <p className="rider-name-text">{rider.name}</p>
                  <p className="rider-meta">
                    {rider.vehicle}
                    {rider.rating ? (
                      <span>
                        <span className="rating-star">&#9733;</span> {rider.rating}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="rider-time">
                  <span>{rider.time}</span>
                  <small>{rider.status}</small>
                </div>
              </div>
            ))}
          </div>

          <button
            className="user-primary-button payment-cta"
            type="button"
            onClick={() => router.push("/user/waiting")}
          >
            Select Rider
          </button>
        </section>
      </div>
    </div>
  );
}
