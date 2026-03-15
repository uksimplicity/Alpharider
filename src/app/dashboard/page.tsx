"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPendingDeliveries } from "@/lib/deliveries-api";

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
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [rideRequests, setRideRequests] = useState<
    Array<{
      id: string;
      from: string;
      to: string;
    }>
  >([]);
  const balance = "NGN 42,800";

  useEffect(() => {
    const loadPendingDeliveries = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setRequestError("YOUR ACCOUNT IS NOT VERIFIED YET");
        setIsLoadingRequests(false);
        return;
      }

      setIsLoadingRequests(true);
      setRequestError("");

      try {
        const deliveries = await getPendingDeliveries(token, 20);
        const mapped = deliveries.map((item, index) => ({
          id: item.id ?? item.delivery_id ?? item.order_id ?? `delivery-${index}`,
          from: item.pickup_address ?? "Pickup address unavailable",
          to: item.dropoff_address ?? "Dropoff address unavailable",
        }));
        setRideRequests(mapped);
      } catch (error) {
        setRequestError(
          error instanceof Error
            ? error.message
            : "Unable to load pending rides right now."
        );
      } finally {
        setIsLoadingRequests(false);
      }
    };

    void loadPendingDeliveries();
  }, []);

  const rideRequestContent = useMemo(() => {
    if (isLoadingRequests) {
      return <p className="helper">Loading ride requests...</p>;
    }

    if (requestError) {
      return (
        <p className="helper danger" role="alert">
          {requestError}
        </p>
      );
    }

    if (rideRequests.length === 0) {
      return <p className="helper">No pending ride requests for now.</p>;
    }

    return (
      <div className="rider-request-list">
        {rideRequests.map((request) => (
          <button
            className="rider-request-card rider-request-action"
            type="button"
            onClick={() => router.push(`/delivery/request?id=${request.id}`)}
            key={request.id}
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
    );
  }, [isLoadingRequests, requestError, rideRequests, router]);

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
            {rideRequestContent}
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
