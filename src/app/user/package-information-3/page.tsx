"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createDelivery } from "@/lib/services";

export default function PackageInformationPage() {
  const router = useRouter();
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [pickupContact, setPickupContact] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const DEFAULT_PICKUP_LAT = 6.5244;
  const DEFAULT_PICKUP_LNG = 3.3792;
  const DEFAULT_DROPOFF_LAT = 6.6018;
  const DEFAULT_DROPOFF_LNG = 3.3515;

  const canSubmit =
    pickupAddress.trim() &&
    dropoffAddress.trim();

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in to create a delivery order.");
      return;
    }
    const isVerified = localStorage.getItem("alpharider_is_verified") === "true";
    if (!isVerified && !isLocalhost) {
      setErrorMessage(
        "Please verify your account before requesting a delivery."
      );
      router.push("/auth/verify");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await createDelivery(token, {
        pickup_address: pickupAddress.trim(),
        pickup_lat: DEFAULT_PICKUP_LAT,
        pickup_lng: DEFAULT_PICKUP_LNG,
        dropoff_address: dropoffAddress.trim(),
        dropoff_lat: DEFAULT_DROPOFF_LAT,
        dropoff_lng: DEFAULT_DROPOFF_LNG,
        receiver_name: receiverName.trim() || undefined,
        pickup_contact: pickupContact.trim() || undefined,
        other_contact: otherContact.trim() || undefined,
        dropoff_contact: otherContact.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      const createdId =
        (response.id as string | undefined) ??
        (response.delivery_id as string | undefined) ??
        (response.order_id as string | undefined);

      if (createdId) {
        localStorage.setItem("alpharider_active_delivery_id", createdId);
      }

      router.push(createdId ? `/user/waiting?id=${createdId}` : "/user/waiting");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create delivery order."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card user-form-card">
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

        <h1 className="user-page-title">Package Information</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <h2>Location</h2>
            <label>
              <span>From</span>
              <input
                type="text"
                placeholder="Enter Pick up location"
                value={pickupAddress}
                onChange={(event) => setPickupAddress(event.target.value)}
              />
            </label>
            <label>
              <span>To</span>
              <input
                type="text"
                placeholder="Enter Destination"
                value={dropoffAddress}
                onChange={(event) => setDropoffAddress(event.target.value)}
              />
            </label>
          </div>

          <div className="form-group">
            <h2>Receiver</h2>
            <label>
              <span>Receiver Name</span>
              <input
                type="text"
                placeholder="Enter receiver name"
                value={receiverName}
                onChange={(event) => setReceiverName(event.target.value)}
              />
            </label>
            <label>
              <span>Pickup Contact</span>
              <input
                type="text"
                placeholder="Phone Number"
                value={pickupContact}
                onChange={(event) =>
                  setPickupContact(event.target.value.replace(/\D/g, ""))
                }
              />
            </label>
            <label>
              <span>Other Contact (Optional)</span>
              <input
                type="text"
                placeholder="Phone Number"
                value={otherContact}
                onChange={(event) =>
                  setOtherContact(event.target.value.replace(/\D/g, ""))
                }
              />
            </label>
            <label>
              <span>Notes (Optional)</span>
              <input
                type="text"
                placeholder="Package notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>

          <button
            className={`user-primary-button form-cta ${canSubmit && !isLoading ? "active" : ""}`}
            type="submit"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Creating..." : "Create Order"}
          </button>
          {errorMessage ? (
            <span className="helper danger" role="alert">
              {errorMessage}
            </span>
          ) : null}
        </form>
      </div>
    </div>
  );
}

