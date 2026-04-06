"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeliveryById } from "@/lib/services";

export default function DeliveryAcceptedPage() {
  const router = useRouter();
  const [deliveryId, setDeliveryId] = useState("");
  const [pickupAddress, setPickupAddress] = useState("Pickup location unavailable");
  const [dropoffAddress, setDropoffAddress] = useState("Destination unavailable");
  const [senderPhone, setSenderPhone] = useState("N/A");
  const [receiverPhone, setReceiverPhone] = useState("N/A");
  const [receiverName, setReceiverName] = useState("Receiver");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAcceptedDetails = async () => {
      const params = new URLSearchParams(window.location.search);
      const idFromUrl = params.get("id");
      const activeId = localStorage.getItem("alpharider_active_delivery_id");
      const id = idFromUrl ?? activeId ?? "";
      setDeliveryId(id);

      const token = localStorage.getItem("alpharider_token");
      if (!token || !id) {
        setErrorMessage("Unable to load accepted delivery details.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      try {
        const delivery = await getDeliveryById(token, id);
        setPickupAddress(delivery.pickup_address ?? "Pickup location unavailable");
        setDropoffAddress(delivery.dropoff_address ?? "Destination unavailable");
        setSenderPhone(delivery.pickup_contact ?? "N/A");
        setReceiverPhone(
          delivery.dropoff_contact ?? delivery.other_contact ?? "N/A"
        );
        setReceiverName(delivery.receiver_name ?? "Receiver");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load accepted delivery details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadAcceptedDetails();
  }, []);

  const handleCallSender = () => {
    if (!senderPhone || senderPhone === "N/A") return;
    window.location.href = `tel:${senderPhone}`;
  };

  const handleMessageSender = () => {
    const params = new URLSearchParams({
      recipient: "sender",
      name: "Sender",
      phone: senderPhone,
      id: deliveryId,
    });
    router.push(`/delivery/chat?${params.toString()}`);
  };

  return (
    <div className="auth-page delivery-accepted-page">
      <div className="auth-card rider-card delivery-card-layout">
        <div className="delivery-detail-page accepted-layout">
          <div className="map-layer">
            <header className="map-topbar">
              <button
                className="map-back"
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
              <img className="map-logo" src="/logo.png" alt="AlphaRide" />
            </header>

            <div className="route-search">
              <span className="route-dot" />
              <span>{pickupAddress}</span>
            </div>
          </div>

          <section className="delivery-sheet accepted-sheet">
            <div className="turn-row">
              <span className="turn-flag" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M6 5v14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 6h10l-2.8 3L16 12H6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="turn-title">Turn left</p>
                <p className="turn-subtitle">Destination</p>
                <p className="accepted-destination">{dropoffAddress}</p>
              </div>
            </div>

            <div className="rider-summary accepted-summary">
              <div className="rider-info">
                <img
                  className="rider-photo"
                  src="/icons/user.svg"
                  alt="Sender"
                />
                <div>
                  <p className="rider-name">Sender</p>
                  <p className="rider-rating">
                    <span className="rating-star">&#9733;</span> {senderPhone}
                  </p>
                </div>
              </div>
              <div className="rider-actions">
                <button type="button" aria-label="Call sender" onClick={handleCallSender}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M6.6 2.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-1.6 1.6c1.2 2.3 3.2 4.3 5.6 5.6l1.6-1.6c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-2 2c-.7.7-1.8 1-2.8.8-6.6-1.4-11.8-6.6-13.2-13.2-.2-1 .1-2.1.8-2.8l2-2Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Message sender in app"
                  onClick={handleMessageSender}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M4 5h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="accepted-contact-list">
              <p>
                <strong>Sender Phone:</strong> {senderPhone}
              </p>
              <p>
                <strong>Receiver:</strong> {receiverName}
              </p>
              <p>
                <strong>Receiver Phone:</strong> {receiverPhone}
              </p>
            </div>

            {isLoading ? <p className="helper">Loading accepted order details...</p> : null}
            {errorMessage ? (
              <p className="helper danger" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              className="sheet-btn primary accepted-cta"
              type="button"
              disabled={!deliveryId || isLoading}
              onClick={() => router.push(`/delivery/start-ride?id=${deliveryId}`)}
            >
              I HAVE ARRIVED
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

