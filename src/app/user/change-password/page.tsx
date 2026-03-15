"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { changeUserPassword } from "@/lib/user-api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const canSubmit =
    currentPassword.trim() &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await changeUserPassword(token, {
        currentPassword,
        newPassword,
      });
      setStatusMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to change password right now."
      );
    } finally {
      setIsLoading(false);
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

        <h1 className="user-page-title">Change Password</h1>

        <form className="edit-form" onSubmit={handleSubmit}>
          <label>
            <span>Current Password</span>
            <div className="input-group">
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
          </label>
          <label>
            <span>New Password</span>
            <div className="input-group">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </label>
          <label>
            <span>Confirm New Password</span>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </label>

          <button
            className="user-primary-button form-cta"
            type="submit"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          {errorMessage ? (
            <p className="helper danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {statusMessage ? <p className="helper met">{statusMessage}</p> : null}
        </form>
      </div>
    </div>
  );
}
