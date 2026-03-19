"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createDelivery } from "@/lib/deliveries-api";

export default function PackageInformationPage() {
  const router = useRouter();
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupContact, setPickupContact] = useState("");
  const [dropoffContact, setDropoffContact] = useState("");
  const [notes, setNotes] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");
  const [dropoffLat, setDropoffLat] = useState("");
  const [dropoffLng, setDropoffLng] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit =
    pickupAddress.trim() &&
    dropoffAddress.trim() &&
    pickupLat.trim() &&
    pickupLng.trim() &&
    dropoffLat.trim() &&
    dropoffLng.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in to create a delivery order.");
      return;
    }
    const isVerified = localStorage.getItem("alpharider_is_verified") === "true";
    if (!isVerified) {
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
        pickup_lat: Number(pickupLat),
        pickup_lng: Number(pickupLng),
        dropoff_address: dropoffAddress.trim(),
        dropoff_lat: Number(dropoffLat),
        dropoff_lng: Number(dropoffLng),
        pickup_contact: pickupContact.trim() || undefined,
        dropoff_contact: dropoffContact.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      const createdId =
        (response.id as string | undefined) ??
        (response.delivery_id as string | undefined) ??
        (response.order_id as string | undefined);

      if (createdId) {
        localStorage.setItem("alpharider_active_delivery_id", createdId);
      }

      router.push("/user/order-successful");
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
              <span>Dropoff Contact</span>
              <input
                type="text"
                placeholder="Phone Number"
                value={dropoffContact}
                onChange={(event) =>
                  setDropoffContact(event.target.value.replace(/\D/g, ""))
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

          <div className="form-row">
            <label>
              <span>Pickup Latitude</span>
              <input
                type="number"
                step="any"
                placeholder="6.5244"
                value={pickupLat}
                onChange={(event) => setPickupLat(event.target.value)}
              />
            </label>
            <label>
              <span>Pickup Longitude</span>
              <input
                type="number"
                step="any"
                placeholder="3.3792"
                value={pickupLng}
                onChange={(event) => setPickupLng(event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Dropoff Latitude</span>
              <input
                type="number"
                step="any"
                placeholder="6.6018"
                value={dropoffLat}
                onChange={(event) => setDropoffLat(event.target.value)}
              />
            </label>
            <label>
              <span>Dropoff Longitude</span>
              <input
                type="number"
                step="any"
                placeholder="3.3515"
                value={dropoffLng}
                onChange={(event) => setDropoffLng(event.target.value)}
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
