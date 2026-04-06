"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/services";

export default function VerifyResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("alpharider_reset_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const focusInput = (index: number) => {
    const target = inputsRef.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleChange = (value: string, index: number) => {
    const nextOtp = [...otp];
    const sanitized = value.replace(/\D/g, "");
    nextOtp[index] = sanitized.slice(-1);
    setOtp(nextOtp);
    if (sanitized && index < nextOtp.length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, otp.length);
    if (!digits) return;
    const nextOtp = Array(otp.length).fill("");
    digits.split("").forEach((digit, idx) => {
      nextOtp[idx] = digit;
    });
    setOtp(nextOtp);
    focusInput(Math.min(digits.length, otp.length - 1));
  };

  const otpIsValid = otp.every((digit) => digit !== "");
  const passwordIsValid = password.length >= 8;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = otpIsValid && passwordIsValid && passwordsMatch;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;
    if (!email) {
      setErrorMessage("Missing email. Please request a new OTP.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await resetPassword({
        email,
        otp: Number(otp.join("")),
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="AlphaRide" />
        </div>
        <h1>VERIFY EMAIL ADDRESS</h1>
        <p className="auth-subtitle">
          {email
            ? `Enter OTP sent to ${email}`
            : "Enter OTP sent to your email"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="otp-row">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                className="otp-input"
                inputMode="numeric"
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                value={otp[index]}
                onChange={(event) => handleChange(event.target.value, index)}
                onPaste={(event) => {
                  event.preventDefault();
                  handlePaste(event.clipboardData.getData("text"));
                }}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
              />
            ))}
          </div>

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
            className={`auth-submit ${canSubmit && !isSubmitting ? "active" : ""}`}
            type="submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>

          {errorMessage ? (
            <span className="helper danger" role="alert">
              {errorMessage}
            </span>
          ) : null}
          {statusMessage ? <span className="helper met">{statusMessage}</span> : null}
        </form>

        <p className="auth-footer">
          Didnâ€™t get an OTP?{" "}
          <Link href="/auth/forgot-password">Request a new one</Link>
        </p>
      </div>
    </div>
  );
}

