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

export default function UserDeliveryPage() {
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

  const recentDeliveries = useMemo(
    () => items.filter((item) => !isPendingDeliveryStatus(item.status)),
    [items]
  );

  const renderList = (list: UiDelivery[]) => {
    if (isLoading) {
      return <p className="helper">Loading deliveries...</p>;
    }

    if (errorMessage) {
      return (
        <p className="helper danger" role="alert">
          {errorMessage}
        </p>
      );
    }

    if (list.length === 0) {
      return <p className="helper">No deliveries found.</p>;
    }

    return (
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
  };

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
          {renderList(pendingDeliveries)}
        </section>

        <section className="user-section">
          <h2>Recent Delivery</h2>
          {renderList(recentDeliveries)}
        </section>
      </div>
    </div>
  );
}

