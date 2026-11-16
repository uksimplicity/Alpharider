"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createDelivery, extractDeliveryId, getUserProfile } from "@/lib/services";
import { normalizeRide } from "@/lib/booking-api";
import MobilityShell from "@/app/components/MobilityShell";
import Link from "next/link";
import { checkSession } from "@/lib/account-client";
import PackageLocationField from "@/app/components/PackageLocationField";
import { packageRoute, type PackageLocation } from "@/lib/package-location";

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
  const [pickupPoint, setPickupPoint] = useState<PackageLocation | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<PackageLocation | null>(null);
  const [packageName, setPackageName] = useState("Package");
  const [quantity, setQuantity] = useState(1);
  const submissionLock = useRef(false);

  const canSubmit =
    pickupAddress.trim() &&
    dropoffAddress.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;
    if (!canSubmit) { setErrorMessage("Enter your pickup and destination addresses."); return; }

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

    let route: ReturnType<typeof packageRoute>;
    try { route = packageRoute(pickupAddress, dropoffAddress, pickupPoint, destinationPoint); }
    catch (cause) { setErrorMessage(cause instanceof Error ? cause.message : "Confirm pickup and destination locations."); return; }

    setIsLoading(true);
    submissionLock.current = true;
    setErrorMessage("");

    try {
      const profile = await getUserProfile(token);
      checkSession(token);
      const customerId = profile.id ?? profile._id ?? profile.user_id ?? profile.customer_id;
      if (!customerId) throw new Error("Your profile is missing a customer identifier.");
      const response = await createDelivery(token, {
        customer_id: customerId,
        items: [{ name: packageName.trim() || "Package", quantity }],
        ...route,
        receiver_name: receiverName.trim() || undefined,
        pickup_contact: pickupContact.trim() || undefined,
        other_contact: otherContact.trim() || undefined,
        dropoff_contact: otherContact.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      const createdId = extractDeliveryId(normalizeRide(response));
      checkSession(token);
      if (!createdId) throw new Error("The server did not return a delivery reference. Check delivery history before trying again.");

      router.push(`/user/delivery-details?id=${encodeURIComponent(createdId)}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create delivery order."
      );
      submissionLock.current = false;
      setIsLoading(false);
    }
  };

  return (
    <MobilityShell>
      <div className="mobility-panel">
        <Link className="mobility-back" href="/user/delivery">Back to Alpha Send</Link>

        <h1>Send a package</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group"><h2>Package</h2>
            <label><span>Package description</span><input required maxLength={200} value={packageName} onChange={event => setPackageName(event.target.value)} /></label>
            <label><span>Quantity</span><input type="number" required min={1} max={100} step={1} value={quantity} onChange={event => setQuantity(Number(event.target.value))} /></label>
          </div>
          <div className="form-group">
            <h2>Pickup and destination</h2>
            <PackageLocationField label="Pickup" placeholder="Enter Pick up location" address={pickupAddress} point={pickupPoint} disabled={isLoading} onAddressChange={value => { setPickupAddress(value); setPickupPoint(null); setErrorMessage(""); }} onConfirm={point => { setPickupPoint(point); setErrorMessage(""); }} />
            <PackageLocationField label="Destination" placeholder="Enter Destination" address={dropoffAddress} point={destinationPoint} disabled={isLoading} onAddressChange={value => { setDropoffAddress(value); setDestinationPoint(null); setErrorMessage(""); }} onConfirm={point => { setDestinationPoint(point); setErrorMessage(""); }} />
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
            className={`user-primary-button form-cta ${!isLoading ? "active" : ""}`}
            type="submit"
            disabled={isLoading}
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
    </MobilityShell>
  );
}
