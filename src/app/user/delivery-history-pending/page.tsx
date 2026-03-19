"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { extractDeliveryId, getMyDeliveries, type DeliveryRecord } from "@/lib/deliveries-api";
import {
  formatDeliveryStatusLabel,
  isPendingDeliveryStatus,
} from "@/lib/delivery-status";

type HistoryItem = {
  id: string;
  status: string;
  time: string;
};

const toHistoryItem = (item: DeliveryRecord, index: number): HistoryItem => ({
  id: extractDeliveryId(item, `DEL-${index + 1}`),
  status: formatDeliveryStatusLabel(item.status),
  time: item.updated_at
    ? new Date(item.updated_at).toLocaleString()
    : item.created_at
    ? new Date(item.created_at).toLocaleString()
    : "Now",
});

export default function DeliveryHistoryPendingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadHistory = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setErrorMessage("Please log in to view delivery history.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      try {
        const deliveries = await getMyDeliveries(token);
        setItems(deliveries.map(toHistoryItem));
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load delivery history."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, []);

  const pendingItems = useMemo(
    () => items.filter((item) => isPendingDeliveryStatus(item.status)),
    [items]
  );
  const totalPages = Math.max(1, Math.ceil(pendingItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return pendingItems.slice(start, start + pageSize);
  }, [page, pageSize, pendingItems]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
          <button className="toggle-button active" type="button">
            Pending
          </button>
          <button
            className="toggle-button"
            type="button"
            onClick={() => router.push("/user/delivery-history-completed")}
          >
            Completed
          </button>
        </div>

        <div className="history-list">
          {isLoading ? <p className="helper">Loading history...</p> : null}
          {errorMessage ? (
            <p className="helper danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {!isLoading && !errorMessage && pendingItems.length === 0 ? (
            <p className="helper">No pending deliveries found.</p>
          ) : null}
          {paginatedItems.map((order) => (
            <button
              className="history-item"
              key={order.id}
              type="button"
              onClick={() => router.push(`/user/delivery-details?id=${order.id}`)}
            >
              <div>
                <p>{order.id}</p>
                <span>{order.time}</span>
              </div>
              <span className="status-pill amber">{order.status}</span>
            </button>
          ))}
          {!isLoading && !errorMessage && pendingItems.length > 0 ? (
            <div className="history-controls">
              <label>
                <span>Limit</span>
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </label>
              <div className="history-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Prev
                </button>
                <span>{`Page ${page} of ${totalPages}`}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
