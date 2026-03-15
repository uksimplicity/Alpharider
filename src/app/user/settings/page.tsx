"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserFcmToken } from "@/lib/user-api";

const settingsItems = [
  { label: "Change Password", route: "/user/change-password" },
  { label: "Change Transaction PIN", route: "/user/change-pin" },
  { label: "Permissions" },
  { label: "Notification" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [fcmToken, setFcmToken] = useState("");
  const [isSavingFcm, setIsSavingFcm] = useState(false);
  const [fcmMessage, setFcmMessage] = useState("");
  const [fcmError, setFcmError] = useState("");

  const handleSaveFcm = async () => {
    if (!fcmToken.trim() || isSavingFcm) return;

    const authToken = localStorage.getItem("alpharider_token");
    if (!authToken) {
      setFcmError("Please log in first.");
      return;
    }

    setIsSavingFcm(true);
    setFcmError("");
    setFcmMessage("");

    try {
      await updateUserFcmToken(authToken, fcmToken.trim());
      setFcmMessage("FCM token updated.");
    } catch (error) {
      setFcmError(
        error instanceof Error
          ? error.message
          : "Unable to update FCM token right now."
      );
    } finally {
      setIsSavingFcm(false);
    }
  };

  return (
    <div className="auth-page user-dashboard-page">
      <div className="auth-card user-page-card settings-card">
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

        <h1 className="user-page-title">Settings</h1>

        <div className="settings-list">
          {settingsItems.map((item) => (
            <button
              className="settings-item"
              type="button"
              key={item.label}
              onClick={() => {
                if (item.route) {
                  router.push(item.route);
                }
              }}
            >
              {item.label}
            </button>
          ))}
          <button className="settings-item danger" type="button">
            Delete Account
          </button>
        </div>

        <div className="edit-form">
          <label>
            <span>FCM Token</span>
            <div className="input-group">
              <input
                type="text"
                placeholder="Paste FCM token"
                value={fcmToken}
                onChange={(event) => setFcmToken(event.target.value)}
              />
            </div>
          </label>
          <button
            className="user-primary-button form-cta"
            type="button"
            onClick={handleSaveFcm}
            disabled={!fcmToken.trim() || isSavingFcm}
          >
            {isSavingFcm ? "Saving..." : "Update FCM Token"}
          </button>
          {fcmError ? (
            <p className="helper danger" role="alert">
              {fcmError}
            </p>
          ) : null}
          {fcmMessage ? <p className="helper met">{fcmMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}
