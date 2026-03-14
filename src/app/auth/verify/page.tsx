"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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
    event: React.KeyboardEvent<HTMLInputElement>,
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
          className={`auth-submit ${canVerify ? "active" : ""}`}
          type="button"
          disabled={!canVerify}
          onClick={() => {
            if (!canVerify) return;
            router.push("/auth/verified");
          }}
        >
          Verify
        </button>

        <p className="auth-footer">
          Didn’t get a code?{" "}
          <button
            type="button"
            className={`resend ${canResend ? "active" : ""}`}
            disabled={!canResend}
            onClick={() => {
              if (!canResend) return;
              setSecondsLeft(30);
            }}
          >
            Resend{canResend ? "" : ` (${secondsLeft}s)`}
          </button>
        </p>
      </div>
    </div>
  );
}
