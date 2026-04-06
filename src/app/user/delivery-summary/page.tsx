"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeliveryById } from "@/lib/services";
import { formatDeliveryStatusLabel } from "@/lib/delivery-status";

export default function DeliverySummaryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [pickupAddress, setPickupAddress] = useState("Pickup unavailable");
  const [dropoffAddress, setDropoffAddress] = useState("Destination unavailable");
  const [pickupContact, setPickupContact] = useState("N/A");
  const [dropoffContact, setDropoffContact] = useState("N/A");
  const [status, setStatus] = useState("pending");
  const [updatedAt, setUpdatedAt] = useState("");
  const [senderName, setSenderName] = useState("Account Holder");
  const [senderContact, setSenderContact] = useState("N/A");

  useEffect(() => {
    const storedName = localStorage.getItem("alpharider_display_name");
    const storedEmail = localStorage.getItem("alpharider_email");
    if (storedName?.trim()) {
      setSenderName(storedName.trim());
    }
    if (storedEmail?.trim()) {
      setSenderContact(storedEmail.trim());
    }

    const loadSummary = async () => {
      const token = localStorage.getItem("alpharider_token");
      const idFromUrl = new URLSearchParams(window.location.search).get("id");
      const activeId = localStorage.getItem("alpharider_active_delivery_id");
      const id = idFromUrl ?? activeId ?? "";
      setDeliveryId(id);

      if (!token || !id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      try {
        const delivery = await getDeliveryById(token, id);
        setPickupAddress(delivery.pickup_address ?? "Pickup unavailable");
        setDropoffAddress(delivery.dropoff_address ?? "Destination unavailable");
        setPickupContact(delivery.pickup_contact ?? "N/A");
        setDropoffContact(delivery.dropoff_contact ?? "N/A");
        setStatus(delivery.status ?? "pending");
        setUpdatedAt(delivery.updated_at ?? delivery.created_at ?? "");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load delivery summary."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, []);

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card user-summary-card">
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

        <h1 className="user-page-title">Delivery Summary</h1>

        <div className="upload-preview summary-preview">
          <img src="/images/parcel.png" alt="Package" />
        </div>

        <section className="summary-section">
          <h2>Delivery Details ({deliveryId || "Unavailable"})</h2>
          <ul className="summary-list">
            <li>{pickupAddress}</li>
            <li>{dropoffAddress}</li>
            <li>{updatedAt ? new Date(updatedAt).toLocaleDateString() : "N/A"}</li>
            <li>{formatDeliveryStatusLabel(status)}</li>
            <li>N/A</li>
          </ul>
        </section>

        <section className="summary-section">
          <h2>Sender</h2>
          <ul className="summary-list">
            <li>{senderName}</li>
            <li>{senderContact}</li>
          </ul>
        </section>

        <section className="summary-section">
          <h2>Receiver</h2>
          <ul className="summary-list">
            <li>{dropoffContact}</li>
            <li>{pickupContact}</li>
          </ul>
        </section>

        {isLoading ? <p className="helper">Loading delivery summary...</p> : null}
        {errorMessage ? (
          <p className="helper danger" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          className="link-button"
          type="button"
          onClick={() => router.push("/user/package-information-3")}
        >
          Add Another Package
        </button>

        <button
          className="user-primary-button form-cta"
          type="button"
          onClick={() =>
            router.push(
              deliveryId
                ? `/user/delivery-details?id=${deliveryId}`
                : "/user/delivery-details"
            )
          }
        >
          Open Delivery Details
        </button>
      </div>
    </div>
  );
}

