"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("alpharider_reset_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const otpIsValid = /^\d+$/.test(otp);
  const passwordIsValid = password.length >= 8;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    isEmailValid && otpIsValid && passwordIsValid && passwordsMatch;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await resetPassword({
        email,
        otp: Number(otp),
        newPassword: password,
      });
      localStorage.removeItem("alpharider_reset_email");
      setStatusMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to reset password right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="AlphaRide" />
        </div>
        <h1>Reset Password</h1>
        <p className="auth-subtitle">Use the OTP sent to your email</p>

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

          <label>
            OTP
            <div className="input-group">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              />
            </div>
          </label>

          <label>
            New Password
            <div className="input-group">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <span className={`helper ${passwordIsValid ? "met" : ""}`}>
              Must be at least 8 characters
            </span>
          </label>

          <label>
            Confirm Password
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            <span className={`helper ${passwordsMatch ? "met" : ""}`}>
              Must match new password
            </span>
          </label>

          <button
            className={`auth-submit ${canSubmit && !isLoading ? "active" : ""}`}
            type="submit"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          {errorMessage ? (
            <span className="helper danger" role="alert">
              {errorMessage}
            </span>
          ) : null}
          {statusMessage ? <span className="helper met">{statusMessage}</span> : null}
        </form>

        <p className="auth-footer">
          Didn’t get an OTP?{" "}
          <Link href="/auth/forgot-password">Request a new one</Link>
        </p>
      </div>
    </div>
  );
}
