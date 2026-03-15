"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/user-api";

export default function EditProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setErrorMessage("Please log in first.");
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      setErrorMessage("");

      try {
        const profile = await getUserProfile(token);
        setFirstName(profile.first_name ?? "");
        setLastName(profile.last_name ?? "");
        setPhone(profile.phone ?? "");
        setEmail(profile.email ?? "");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load profile right now."
        );
      } finally {
        setIsFetching(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await updateUserProfile(token, {
        first_name: firstName,
        last_name: lastName,
      });
      setStatusMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update profile right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page user-dashboard-page">
      <div className="auth-card user-page-card edit-profile-card">
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

        <div className="edit-profile-hero">
          <img className="edit-profile-avatar" src="/icons/user.svg" alt="Profile" />
          <div className="edit-profile-actions">
            <button className="user-secondary-button" type="button">
              Delete
            </button>
            <button className="user-primary-button" type="button">
              Change
            </button>
          </div>
        </div>

        <form className="edit-form" onSubmit={handleSubmit}>
          <label>
            <span>First Name</span>
            <div className="input-group">
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Last Name</span>
            <div className="input-group">
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Phone Number</span>
            <div className="input-group split">
              <span className="country-code">+234</span>
              <input type="text" value={phone} readOnly />
            </div>
          </label>

          <label>
            <span>Email</span>
            <div className="input-group">
              <input type="email" value={email} readOnly />
            </div>
          </label>

          <button className="user-primary-button form-cta" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          {isFetching ? <p className="helper">Loading profile...</p> : null}
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
