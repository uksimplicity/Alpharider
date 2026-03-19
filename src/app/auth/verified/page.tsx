"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AccountVerifiedPage() {
  const router = useRouter();

  return (
    <div className="verify-page verified-page">
      <div className="verify-card">
        <div className="auth-logo">
          <Image src="/logo.png" alt="AlphaRide" width={160} height={48} priority />
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
