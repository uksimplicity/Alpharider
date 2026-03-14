"use client";

import { useRouter } from "next/navigation";

export default function DeliveryDeclinedPage() {
  const router = useRouter();

  return (
    <div className="auth-page delivery-declined-page">
      <div className="auth-card delivery-declined-card">
        <button
          className="declined-close"
          type="button"
          aria-label="Close"
          onClick={() => router.push("/dashboard")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M6 6l12 12M18 6l-12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <p className="declined-label">Delivery Declined</p>
        <p className="declined-subtitle">
          You have declined this delivery request.
        </p>
      </div>
    </div>
  );
}
