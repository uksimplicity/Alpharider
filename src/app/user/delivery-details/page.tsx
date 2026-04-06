"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeliveryById, updateDeliveryStatus } from "@/lib/services";
import { formatDeliveryStatusLabel } from "@/lib/delivery-status";

export default function DeliveryDetailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [pickupAddress, setPickupAddress] = useState("Pickup unavailable");
  const [dropoffAddress, setDropoffAddress] = useState("Destination unavailable");
  const [pickupContact, setPickupContact] = useState("");
  const [dropoffContact, setDropoffContact] = useState("");
  const [status, setStatus] = useState("pending");
  const [updatedAt, setUpdatedAt] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      const token = localStorage.getItem("alpharider_token");
      const idFromUrl = new URLSearchParams(window.location.search).get("id");
      const activeId = localStorage.getItem("alpharider_active_delivery_id");
      const id = idFromUrl ?? activeId ?? "";
      setDeliveryId(id);

      if (!token) {
        setErrorMessage("Please log in to view delivery details.");
        setIsLoading(false);
        return;
      }
      if (!id) {
        setErrorMessage("Delivery ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      try {
        const delivery = await getDeliveryById(token, id);
        setPickupAddress(delivery.pickup_address ?? "Pickup unavailable");
        setDropoffAddress(delivery.dropoff_address ?? "Destination unavailable");
        setPickupContact(delivery.pickup_contact ?? "");
        setDropoffContact(delivery.dropoff_contact ?? "");
        setStatus(delivery.status ?? "pending");
        setUpdatedAt(delivery.updated_at ?? delivery.created_at ?? "");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load delivery details right now."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetails();
  }, []);

  const statusMessage = useMemo(() => {
    const normalized = status.toLowerCase();
    if (normalized.includes("completed") || normalized.includes("delivered")) {
      return "Your package has been delivered.";
    }
    if (normalized.includes("in_progress")) {
      return "Your package is currently in transit.";
    }
    if (normalized.includes("accepted") || normalized.includes("assigned")) {
      return "A rider has accepted your delivery.";
    }
    if (normalized.includes("cancel") || normalized.includes("declin")) {
      return "This delivery is no longer active.";
    }
    return "Your package is awaiting pickup.";
  }, [status]);

  const canCancelDelivery = useMemo(() => {
    const normalized = status.toLowerCase();
    if (!deliveryId || isCancelling) return false;
    return !(
      normalized.includes("cancel") ||
      normalized.includes("declin") ||
      normalized.includes("completed") ||
      normalized.includes("delivered")
    );
  }, [deliveryId, isCancelling, status]);

  const isDelivered = useMemo(() => {
    const normalized = status.toLowerCase();
    return normalized.includes("completed") || normalized.includes("delivered");
  }, [status]);

  useEffect(() => {
    if (!deliveryId) return;
    const normalized = status.toLowerCase();
    if (normalized.includes("completed") || normalized.includes("delivered")) {
      localStorage.removeItem("alpharider_active_delivery_id");
    }
  }, [deliveryId, status]);

  const handleCancelDelivery = async () => {
    if (!deliveryId || isCancelling) return;
    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in to cancel this delivery.");
      return;
    }

    setIsCancelling(true);
    setErrorMessage("");
    try {
      await updateDeliveryStatus(token, deliveryId, "cancelled");
      setStatus("cancelled");
      setUpdatedAt(new Date().toISOString());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to cancel this delivery right now."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenCancelConfirm = () => {
    if (!deliveryId || isCancelling || status.toLowerCase().includes("cancel")) {
      return;
    }
    setShowCancelConfirm(true);
  };

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card delivery-details-card">
        <header className="details-header">
          <button
            className="details-back"
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
          <span className="details-spacer" />
        </header>

        <h1 className="details-title">Delivery Details</h1>
        <p className="details-order">
          Order Number: {deliveryId || "Unavailable"}
        </p>

        <div className="details-map" />

        <div className={`details-progress ${isDelivered ? "delivered" : ""}`}>
          <span>{pickupAddress}</span>
          <div className="progress-line">
            <span className="progress-dot" />
            <span className="progress-dot" />
          </div>
          <span>{dropoffAddress}</span>
        </div>

        <p className="details-status">{statusMessage}</p>
        {isLoading ? <p className="helper">Loading delivery details...</p> : null}
        {errorMessage ? (
          <p className="helper danger" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="details-meta">
          <div>
            <p>{updatedAt ? new Date(updatedAt).toLocaleDateString() : "Today"}</p>
            <span>Date</span>
          </div>
          <div>
            <p>{formatDeliveryStatusLabel(status)}</p>
            <span>Time</span>
          </div>
          <div>
            <p>N/A</p>
            <span>Price</span>
          </div>
          <div>
            <p>{dropoffContact || "N/A"}</p>
            <span>Method</span>
          </div>
        </div>

        <div className="details-rider">
          <div className="details-rider-info">
            <img src="/icons/user.svg" alt="Contact" />
            <div>
              <p>{pickupContact || "Pickup Contact"}</p>
              <span>
                {dropoffContact || "Dropoff contact unavailable"}
              </span>
            </div>
          </div>
          <button
            className="details-call"
            type="button"
            aria-label="Call rider"
            onClick={() => {
              if (pickupContact) {
                window.location.href = `tel:${pickupContact}`;
              }
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6.6 2.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-1.6 1.6c1.2 2.3 3.2 4.3 5.6 5.6l1.6-1.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-2 2c-.7.7-1.8 1-2.8.8-6.6-1.4-11.8-6.6-13.2-13.2-.2-1 .1-2.1.8-2.8l2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        {canCancelDelivery ? (
          <button
            className="user-secondary-button details-cancel"
            type="button"
            disabled={!canCancelDelivery}
            onClick={handleOpenCancelConfirm}
          >
            {isCancelling ? "Cancelling..." : "Cancel Delivery"}
          </button>
        ) : null}
      </div>

      {showCancelConfirm ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card decline-modal">
            <p className="modal-title">CANCEL THIS DELIVERY REQUEST?</p>
            <div className="modal-actions decline-actions">
              <button
                className="modal-button ghost"
                type="button"
                onClick={() => setShowCancelConfirm(false)}
              >
                No
              </button>
              <button
                className="modal-button"
                type="button"
                disabled={isCancelling}
                onClick={async () => {
                  await handleCancelDelivery();
                  setShowCancelConfirm(false);
                }}
              >
                {isCancelling ? "Working..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

