"use client";

import { useRouter } from "next/navigation";

export default function AccountVerifiedPage() {
  const router = useRouter();

  return (
    <div className="verify-page verified-page">
      <div className="verify-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="AlphaRide" />
        </div>
        <h1>Account created successfully</h1>
        <p className="auth-subtitle">
          Your account is verified. You can now continue to login.
        </p>

        <button
          className="auth-submit active"
          type="button"
          onClick={() => router.push("/auth/login")}
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}
