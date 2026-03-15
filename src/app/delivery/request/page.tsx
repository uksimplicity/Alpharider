"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { acceptDelivery, getDeliveryById } from "@/lib/deliveries-api";

export default function DeliveryRequestPage() {
  const router = useRouter();
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [deliveryId, setDeliveryId] = useState("");
  const [pickupAddress, setPickupAddress] = useState("Loading pickup...");
  const [dropoffAddress, setDropoffAddress] = useState("Loading dropoff...");
  const [pickupContact, setPickupContact] = useState("+2348000000000");
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDeliveryDetails = async () => {
      const idFromUrl = new URLSearchParams(window.location.search).get("id");
      if (!idFromUrl) {
        setErrorMessage("Delivery ID is missing.");
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setErrorMessage("Please log in to view delivery details.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      setDeliveryId(idFromUrl);

      try {
        const delivery = await getDeliveryById(token, idFromUrl);
        setPickupAddress(delivery.pickup_address ?? "Pickup address unavailable");
        setDropoffAddress(delivery.dropoff_address ?? "Dropoff address unavailable");
        setPickupContact(delivery.pickup_contact ?? "+2348000000000");
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

    void loadDeliveryDetails();
  }, []);

  const handleCall = () => {
    window.location.href = `tel:${pickupContact}`;
  };

  const handleMessage = () => {
    router.push("/delivery/chat");
  };

  const handleDecline = () => {
    setShowDeclineModal(true);
  };

  const handleAccept = async () => {
    if (!deliveryId || isAccepting) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in to accept delivery requests.");
      return;
    }

    setIsAccepting(true);
    setErrorMessage("");

    try {
      await acceptDelivery(token, deliveryId);
      localStorage.setItem("alpharider_active_delivery_id", deliveryId);
      router.push(`/delivery/accepted?id=${deliveryId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to accept delivery."
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const isReadyForActions = useMemo(
    () => !isLoading && !errorMessage && Boolean(deliveryId),
    [deliveryId, errorMessage, isLoading]
  );

  return (
    <div className="auth-page delivery-request-page">
      <div className="auth-card rider-card delivery-card-layout">
        <div className="delivery-detail-page">
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
          </div>

          <section className="delivery-sheet">
            <div className="rider-summary">
              <div className="rider-info">
                <img
                  className="rider-photo"
                  src="/icons/user.svg"
                  alt="Oluwatobi"
                />
                <div>
                  <p className="rider-name">Oluwatobi</p>
                  <p className="rider-rating">
                    <span className="rating-star">&#9733;</span> 4.8{" "}
                    <span>(345)</span>
                  </p>
                </div>
              </div>
              <div className="rider-actions">
                <button type="button" aria-label="Call rider" onClick={handleCall}>
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
                  aria-label="Message rider"
                  onClick={handleMessage}
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

            <div className="sheet-route">
              <div className="route-line">
                <span className="route-dot" />
                <span>{pickupAddress}</span>
              </div>
              <div className="route-line">
                <span className="route-pin" />
                <span>{dropoffAddress}</span>
              </div>
              <div className="route-line">
                <span className="route-clock" />
                <span>Now</span>
              </div>
              <div className="route-line">
                <span className="route-cash" />
                <span>&#8358;1,500</span>
              </div>
            </div>

            <div className="sheet-actions">
              <button
                className="sheet-btn outline"
                type="button"
                disabled={!isReadyForActions}
                onClick={handleDecline}
              >
                Decline
              </button>
              <button
                className="sheet-btn primary"
                type="button"
                disabled={!isReadyForActions || isAccepting}
                onClick={handleAccept}
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </button>
            </div>
            {isLoading ? <p className="helper">Loading delivery details...</p> : null}
            {errorMessage ? (
              <p className="helper danger" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </section>
        </div>
      </div>

      {showDeclineModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card decline-modal">
            <p className="modal-title">
              ARE YOU SURE YOU WANT TO DECLINE THIS DELIVERY?
            </p>
            <div className="modal-actions decline-actions">
              <button
                className="modal-button ghost"
                type="button"
                onClick={() => router.back()}
              >
                No
              </button>
              <button
                className="modal-button"
                type="button"
                onClick={() => router.push("/delivery/declined")}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
