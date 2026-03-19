"use client";

import { useRouter } from "next/navigation";

export default function OrderSuccessfulPage() {
  const router = useRouter();

  const handleViewDetails = () => {
    const deliveryId = localStorage.getItem("alpharider_active_delivery_id");
    if (deliveryId) {
      router.push(`/user/delivery-details?id=${deliveryId}`);
      return;
    }
    router.push("/user/delivery-details");
  };

  return (
    <div className="auth-page user-delivery-page">
      <div className="auth-card user-page-card order-success-card">
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
          <button
            className="user-header-button"
            type="button"
            aria-label="Close"
            onClick={() => router.back()}
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
        </header>

        <div className="success-body">
          <div className="success-icon">
            <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <g fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M30 70h46l12-22H44l-7 12" />
                <path d="M74 48l12 22h20" />
                <rect x="64" y="28" width="20" height="16" rx="2" />
                <path d="M34 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                <path d="M88 70a12 12 0 1 0 0 24a12 12 0 0 0 0-24Z" />
                <path d="M50 94h26" />
              </g>
              <circle cx="86" cy="78" r="16" fill="#ffffff" />
              <circle cx="86" cy="78" r="16" fill="none" stroke="#16a34a" strokeWidth="4" />
              <path
                d="M79 78l5 5 9-10"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="success-text">
            You have successfully placed your delivery order
          </p>
        </div>

        <button
          className="user-secondary-button success-button"
          type="button"
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
