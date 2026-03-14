"use client";

import { useRouter } from "next/navigation";

const settingsItems = [
  { label: "Change Password", route: "/user/change-password" },
  { label: "Change Transaction PIN", route: "/user/change-pin" },
  { label: "Permissions" },
  { label: "Notification" },
];

export default function SettingsPage() {
  const router = useRouter();

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
      </div>
    </div>
  );
}
