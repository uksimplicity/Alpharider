"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const isEmailValid = /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEmailValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await forgotPassword(email);
      localStorage.setItem("alpharider_reset_email", email);
      setStatusMessage("OTP sent. Continue to reset your password.");
      router.push("/auth/verify-reset");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send reset OTP right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Image src="/logo.png" alt="AlphaRide" width={160} height={48} priority />
        </div>
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset OTP</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>

          <button
            className={`auth-submit ${isEmailValid && !isLoading ? "active" : ""}`}
            type="submit"
            disabled={!isEmailValid || isLoading}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
          {errorMessage ? (
            <span className="helper danger" role="alert">
              {errorMessage}
            </span>
          ) : null}
          {statusMessage ? <span className="helper met">{statusMessage}</span> : null}
        </form>

        <div className="auth-meta">
          <button
            type="button"
            className="text-link-button"
            onClick={() => router.push("/auth/verify-reset")}
          >
            I have an OTP, reset now
          </button>
        </div>
        <p className="auth-footer">
          Remembered your password? <Link href="/auth/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
