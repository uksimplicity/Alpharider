"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPicturePreviewPage() {
  const router = useRouter();
  const [imageUrl] = useState(() => {
    if (typeof window === "undefined") {
      return "/office-delivery.svg";
    }
    return (
      localStorage.getItem("alpharider_package_image_url") ??
      "/office-delivery.svg"
    );
  });

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

        <div className="upload-preview">
          <img src={imageUrl} alt="Package" />
        </div>

        <div className="upload-actions">
          <button
            className="user-primary-button"
            type="button"
            onClick={() => router.push("/user/package-information-3")}
          >
            Continue
          </button>
          <button
            className="user-secondary-link"
            type="button"
            onClick={() => router.push("/user/upload-picture")}
          >
            Retake
          </button>
        </div>
      </div>
    </div>
  );
}
