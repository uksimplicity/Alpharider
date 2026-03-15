"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import {
  getRiderProfile,
  registerRider,
  updateRiderLocation,
  updateRiderStatus,
} from "@/lib/rider-api";

export default function RiderPage() {
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [documentsText, setDocumentsText] = useState("");
  const [riderStatus, setRiderStatus] = useState<"available" | "busy" | "offline">(
    "offline"
  );
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canRegister = vehicleType.trim() && vehicleNumber.trim();

  useEffect(() => {
    const loadRiderProfile = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) return;

      try {
        await getRiderProfile(token);
      } catch {
        // Keep page usable even if profile endpoint is unavailable.
      }
    };

    void loadRiderProfile();
  }, []);

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canRegister || isLoading) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const documents = documentsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await registerRider(token, {
        vehicle_type: vehicleType.trim(),
        vehicle_number: vehicleNumber.trim(),
        vehicle_model: vehicleModel.trim() || undefined,
        documents: documents.length > 0 ? documents : undefined,
      });
      setStatusMessage("Rider profile submitted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to register rider profile right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    try {
      await updateRiderStatus(token, riderStatus);
      setStatusMessage("Rider status updated.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update rider status."
      );
    }
  };

  const handleLocationUpdate = async () => {
    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }
    if (!latitude.trim() || !longitude.trim()) {
      setErrorMessage("Latitude and longitude are required.");
      return;
    }

    try {
      await updateRiderLocation(token, {
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      setStatusMessage("Rider location updated.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update rider location."
      );
    }
  };

  return (
    <div className="shell">
      <header className="shell-header">
        <h1>Rider Hub</h1>
        <p>Everything you need before going online.</p>
      </header>

      <div className="card-grid">
        <div className="card">
          <h2>Shift status</h2>
          <p className="metric">{riderStatus}</p>
          <p className="subtext">Update your availability below.</p>
          <div className="input-group">
            <select
              value={riderStatus}
              onChange={(event) =>
                setRiderStatus(
                  event.target.value as "available" | "busy" | "offline"
                )
              }
            >
              <option value="available">available</option>
              <option value="busy">busy</option>
              <option value="offline">offline</option>
            </select>
          </div>
          <button className="button primary" type="button" onClick={handleStatusUpdate}>
            Update Status
          </button>
        </div>
        <div className="card">
          <h2>Rider Location</h2>
          <div className="input-group">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
            />
          </div>
          <div className="input-group" style={{ marginTop: "8px" }}>
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
            />
          </div>
          <button
            className="button primary"
            type="button"
            style={{ marginTop: "10px" }}
            onClick={handleLocationUpdate}
          >
            Update Location
          </button>
        </div>
      </div>

      <section className="form-card" style={{ marginTop: "20px" }}>
        <h2>Complete Rider Registration</h2>
        <form onSubmit={handleRegisterSubmit} className="auth-form">
          <label>
            Vehicle Type
            <input
              type="text"
              placeholder="bike, car, van..."
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            />
          </label>
          <label>
            Vehicle Number
            <input
              type="text"
              placeholder="Plate number"
              value={vehicleNumber}
              onChange={(event) => setVehicleNumber(event.target.value)}
            />
          </label>
          <label>
            Vehicle Model (Optional)
            <input
              type="text"
              placeholder="Model"
              value={vehicleModel}
              onChange={(event) => setVehicleModel(event.target.value)}
            />
          </label>
          <label>
            Documents URLs (Optional)
            <input
              type="text"
              placeholder="https://... , https://..."
              value={documentsText}
              onChange={(event) => setDocumentsText(event.target.value)}
            />
          </label>
          <button
            className="button primary"
            type="submit"
            disabled={!canRegister || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Rider Profile"}
          </button>
          {errorMessage ? (
            <p className="helper danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {statusMessage ? <p className="helper met">{statusMessage}</p> : null}
        </form>
      </section>

      <Link className="text-link" href="/dashboard">
        Go to dashboard
      </Link>
    </div>
  );
}
