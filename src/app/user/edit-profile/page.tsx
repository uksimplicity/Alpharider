"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/services";

const readProfileRecord = (payload: unknown): Record<string, unknown> => {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  const nested = record.user ?? record.profile ?? record.data ?? record.result;
  if (nested && typeof nested === "object") {
    return nested as Record<string, unknown>;
  }
  return record;
};

const readTextField = (
  record: Record<string, unknown>,
  ...keys: string[]
) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

export default function EditProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const buildDisplayName = (first: string, last: string) => {
    const cleanFirst = first.trim();
    const cleanLast = last.trim();
    if (cleanFirst && /^user$/i.test(cleanLast)) return cleanFirst;
    return `${cleanFirst} ${cleanLast}`.trim();
  };

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
        const record = readProfileRecord(profile);
        setFirstName(readTextField(record, "first_name", "firstName"));
        setLastName(readTextField(record, "last_name", "lastName"));
        setPhone(readTextField(record, "phone", "phone_number", "phoneNumber"));
        setEmail(readTextField(record, "email"));
        setAddress(readTextField(record, "address"));
        setCity(readTextField(record, "city"));
        setStateName(readTextField(record, "state"));
        setCountry(readTextField(record, "country"));
        setPostalCode(readTextField(record, "postal_code", "postalCode"));
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
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        country: country.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
      });
      const displayName = buildDisplayName(firstName, lastName);
      if (displayName) {
        localStorage.setItem("alpharider_display_name", displayName);
      }
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

          <label>
            <span>Address</span>
            <div className="input-group">
              <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>City</span>
            <div className="input-group">
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>State</span>
            <div className="input-group">
              <input
                type="text"
                value={stateName}
                onChange={(event) => setStateName(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Country</span>
            <div className="input-group">
              <input
                type="text"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              />
            </div>
          </label>

          <label>
            <span>Postal Code</span>
            <div className="input-group">
              <input
                type="text"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
              />
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

