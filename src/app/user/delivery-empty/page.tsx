"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  extractDeliveryId,
  getMyDeliveries,
  type DeliveryRecord,
} from "@/lib/services";
import {
  formatDeliveryStatusLabel,
  getDeliveryStatusTone,
  isPendingDeliveryStatus,
} from "@/lib/delivery-status";

type UiDelivery = {
  id: string;
  status: string;
  tone: "blue" | "amber" | "green" | "red";
  destination: string;
  time: string;
};

const normalizeStatus = (status?: string) =>
  (status ?? "").trim().toLowerCase().replace(/\s+/g, "_");

const isRecentlyDeliveredStatus = (status?: string) => {
  const normalized = normalizeStatus(status);
  return normalized.includes("delivered") || normalized.includes("completed");
};

const normalizeDelivery = (item: DeliveryRecord, index: number): UiDelivery => {
  const statusLabel = formatDeliveryStatusLabel(item.status);
  const timeSource = item.updated_at ?? item.created_at ?? "";
  const timeLabel = timeSource
    ? new Date(timeSource).toLocaleString()
    : "Just now";

  return {
    id: extractDeliveryId(item, `DEL-${index + 1}`),
    status: statusLabel,
    tone: getDeliveryStatusTone(item.status),
    destination: item.dropoff_address ?? "Destination",
    time: timeLabel,
  };
};

export default function UserDeliveryEmptyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<UiDelivery[]>([]);

  useEffect(() => {
    const loadDeliveries = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setErrorMessage("Please log in to view your deliveries.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const deliveries = await getMyDeliveries(token);
        setItems(deliveries.map(normalizeDelivery));
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load deliveries right now."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDeliveries();
  }, []);

  const pendingDeliveries = useMemo(
    () => items.filter((item) => isPendingDeliveryStatus(item.status)),
    [items]
  );

  const recentDelivered = useMemo(
    () => items.filter((item) => isRecentlyDeliveredStatus(item.status)).slice(0, 10),
    [items]
  );

  const renderList = (list: UiDelivery[]) => (
    <div className="delivery-list user-delivery-list">
      {list.map((delivery) => (
        <button
          className="delivery-item"
          key={delivery.id}
          type="button"
          onClick={() => router.push(`/user/delivery-details?id=${delivery.id}`)}
        >
          <div className="delivery-thumb">
            <img src="/office-delivery.svg" alt="Package" />
          </div>
          <div className="delivery-info">
            <p className="delivery-id">{delivery.id}</p>
            <p className="delivery-destination">{delivery.destination}</p>
          </div>
          <div className="delivery-meta">
            <span className={`status-pill ${delivery.tone}`}>{delivery.status}</span>
            <span className="delivery-time">{delivery.time}</span>
          </div>
        </button>
      ))}
    </div>
  );

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
          Create New Delivery
        </button>
        {errorMessage ? (
          <p className="helper danger" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <section className="user-section">
          <h2>Pending Delivery</h2>
          {isLoading ? <p className="helper">Loading deliveries...</p> : null}
          {!isLoading && pendingDeliveries.length > 0 ? renderList(pendingDeliveries) : null}
          {!isLoading && pendingDeliveries.length === 0 ? (
            <div className="empty-card">
              <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                <g fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M30 70h46l12-22H44l-7 12" />
                  <path d="M74 48l12 22h20" />
                  <rect x="64" y="28" width="20" height="16" rx="2" />
                  <path d="M34 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                  <path d="M88 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                  <path d="M50 94h26" />
                </g>
              </svg>
              <p>You currently have no pending order</p>
            </div>
          ) : null}
        </section>

        <section className="user-section">
          <h2>Recent Delivery</h2>
          {!isLoading && recentDelivered.length > 0 ? renderList(recentDelivered) : null}
          {!isLoading && recentDelivered.length === 0 ? (
            <div className="empty-card muted">
              <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                <g fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M30 70h46l12-22H44l-7 12" />
                  <path d="M74 48l12 22h20" />
                  <rect x="64" y="28" width="20" height="16" rx="2" />
                  <path d="M34 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                  <path d="M88 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                  <path d="M50 94h26" />
                </g>
              </svg>
              <p>
                You have not ordered any delivery yet. Would you like to change
                that today?
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

