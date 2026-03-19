"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/session";
import { getUserProfile } from "@/lib/user-api";

const profileLinks = [
  { label: "Edit Profile", route: "/user/edit-profile" },
  { label: "History", route: "/user/delivery-history-pending" },
  { label: "Settings", route: "/user/settings" },
  { label: "Logout", route: "/auth/login" },
];

const normalizeDisplayName = (value: string) => {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (/^\S+\s+User$/i.test(cleaned)) {
    return cleaned.replace(/\s+User$/i, "");
  }
  return cleaned;
};

const toDisplayName = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";
  if (first && /^user$/i.test(last)) return first;
  return normalizeDisplayName(`${first} ${last}`.trim());
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("User");
  const [contactText, setContactText] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("alpharider_token");
      if (!token) {
        setProfileError("Please log in first.");
        return;
      }

      try {
        const profile = await getUserProfile(token);
        const fullName = toDisplayName(profile.first_name, profile.last_name);
        if (fullName) {
          setDisplayName(fullName);
          localStorage.setItem("alpharider_display_name", fullName);
        }
        const contact = profile.email?.trim() || profile.phone?.trim() || "";
        setContactText(contact);
      } catch (error) {
        setProfileError(
          error instanceof Error
            ? error.message
            : "Unable to load profile right now."
        );
      }
    };

    void loadProfile();
  }, []);

  return (
    <div className="auth-page user-dashboard-page">
      <div className="auth-card user-page-card profile-drawer-card">
        <header className="profile-header">
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

        <div className="profile-hero">
          <img className="profile-avatar" src="/icons/user.svg" alt={displayName} />
          <div>
            <p className="profile-name">{displayName}</p>
            <p className="profile-rating">
              {contactText || "Profile details"}
            </p>
          </div>
        </div>
        {profileError ? (
          <p className="helper danger" role="alert">
            {profileError}
          </p>
        ) : null}

        <div className="profile-links">
          {profileLinks.map((link) => (
            <button
              className="profile-link"
              type="button"
              key={link.label}
              onClick={() => {
                if (link.label === "Logout") {
                  clearAuthSession();
                }
                if (link.route) {
                  router.push(link.route);
                }
              }}
            >
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        <div className="profile-footer">
          <div>
            <p>Become a Driver/Rider</p>
            <span>More income for you</span>
          </div>
          <button className="profile-action" type="button" aria-label="Notification">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
