"use client";

import { useRouter } from "next/navigation";

const profileLinks = [
  { label: "Edit Profile", route: "/user/edit-profile" },
  { label: "My Rides" },
  { label: "History", route: "/user/delivery-history-pending" },
  { label: "Settings", route: "/user/settings" },
  { label: "Rate App" },
  { label: "Share App" },
];

export default function CustomerDashboardPage() {
  const router = useRouter();

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
          <img className="profile-avatar" src="/icons/user.svg" alt="Oluwatobi" />
          <div>
            <p className="profile-name">Oluwatobi</p>
            <p className="profile-rating">
              <span className="rating-star">&#9733;</span> 4.8
            </p>
          </div>
        </div>

        <div className="profile-links">
          {profileLinks.map((link) => (
            <button
              className="profile-link"
              type="button"
              key={link.label}
              onClick={() => {
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
