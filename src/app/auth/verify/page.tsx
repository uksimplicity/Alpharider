"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resendOtp, verifyOtp, verifyPhoneOtp } from "@/lib/auth-api";

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [verificationMode, setVerificationMode] = useState<"email" | "phone">(
    "email"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const savedPendingEmail = localStorage.getItem("alpharider_pending_email");
    const savedPendingPhone = localStorage.getItem("alpharider_pending_phone");
    if (savedPendingEmail) {
      setPendingEmail(savedPendingEmail);
    }
    if (savedPendingPhone) {
      setPendingPhone(savedPendingPhone);
      setVerificationMode("phone");
    }
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

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

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
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

  const canVerify = otp.every((digit) => digit !== "");
  const canResend = secondsLeft === 0;

  const verificationIdentity =
    verificationMode === "phone"
      ? pendingPhone || pendingEmail
      : pendingEmail || pendingPhone;

  const handleVerify = async () => {
    if (!canVerify || isSubmitting) return;
    if (!verificationIdentity) {
      setErrorMessage("Missing verification identity. Please sign up again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      if (verificationMode === "phone") {
        await verifyPhoneOtp({
          otp: otp.join(""),
          email: verificationIdentity,
        });
      } else {
        await verifyOtp({
          otp: otp.join(""),
          email: verificationIdentity,
        });
      }

      localStorage.removeItem("alpharider_pending_email");
      localStorage.removeItem("alpharider_pending_phone");
      router.push("/auth/verified");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify OTP right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    if (!verificationIdentity) {
      setErrorMessage("Missing verification identity. Please sign up again.");
      return;
    }

    setIsResending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await resendOtp({
        email: verificationIdentity,
        type: "resend_verification",
      });
      setSecondsLeft(30);
      setStatusMessage("A new OTP has been sent.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to resend OTP right now."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="AlphaRide" />
        </div>
        <h1>Verify your account</h1>
        <p className="auth-subtitle">
          Enter OTP sent to your email and phone number
        </p>

        <div className="sheet-actions">
          <button
            className={`sheet-btn ${verificationMode === "email" ? "primary" : "outline"}`}
            type="button"
            onClick={() => setVerificationMode("email")}
          >
            Verify Email
          </button>
          <button
            className={`sheet-btn ${verificationMode === "phone" ? "primary" : "outline"}`}
            type="button"
            onClick={() => setVerificationMode("phone")}
          >
            Verify Phone
          </button>
        </div>

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
              onKeyDown={(event) => handleKeyDown(event, index)}
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

        <button
          className={`auth-submit ${canVerify && !isSubmitting ? "active" : ""}`}
          type="button"
          disabled={!canVerify || isSubmitting}
          onClick={handleVerify}
        >
          {isSubmitting ? "Verifying..." : "Verify"}
        </button>
        {errorMessage ? (
          <span className="helper danger" role="alert">
            {errorMessage}
          </span>
        ) : null}
        {statusMessage ? <span className="helper met">{statusMessage}</span> : null}

        <p className="auth-footer">
          Didn’t get a code?{" "}
          <button
            type="button"
            className={`resend ${canResend && !isResending ? "active" : ""}`}
            disabled={!canResend || isResending}
            onClick={handleResend}
          >
            {isResending
              ? "Resending..."
              : `Resend${canResend ? "" : ` (${secondsLeft}s)`}`}
          </button>
        </p>
      </div>
    </div>
  );
}
