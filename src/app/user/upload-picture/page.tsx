"use client";

import { useRouter } from "next/navigation";

export default function UploadPicturePage() {
  const router = useRouter();

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card">
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

        <h1 className="user-page-title">Upload Picture</h1>

        <div className="upload-hero">
          <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
            <g fill="none" stroke="currentColor" strokeWidth="4">
              <path d="M30 70h46l12-22H44l-7 12" />
              <path d="M74 48l12 22h20" />
              <rect x="64" y="28" width="20" height="16" rx="2" />
              <path d="M34 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
              <path d="M88 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
              <path d="M50 94h26" />
            </g>
          </svg>
        </div>

        <div className="upload-text">
          <h2>A picture of the package</h2>
          <p>
            Please upload a picture of your package. Ensure you capture all the
            sides of the package.
          </p>
        </div>

        <div className="upload-actions">
          <button
            className="user-primary-button"
            type="button"
            onClick={() => router.push("/user/upload-picture-1")}
          >
            Camera
          </button>
          <button className="user-secondary-button" type="button">
            Library
          </button>
        </div>
      </div>
    </div>
  );
}
