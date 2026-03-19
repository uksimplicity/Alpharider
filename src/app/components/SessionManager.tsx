"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthSession,
  isSessionExpired,
  markSessionActivity,
} from "@/lib/session";

const PUBLIC_PATH_PREFIXES = ["/auth"];
const PUBLIC_EXACT_PATHS = ["/", "/rider"];

const isPublicPath = (pathname: string) =>
  PUBLIC_EXACT_PATHS.includes(pathname) ||
  PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export default function SessionManager() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isPublicPath(pathname)) return;

    const token = localStorage.getItem("alpharider_token");
    if (!token) return;

    if (isSessionExpired()) {
      clearAuthSession();
      router.replace("/auth/login");
      return;
    }

    markSessionActivity();

    const events: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "scroll",
      "touchstart",
    ];
    const onActivity = () => markSessionActivity();
    events.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    );

    const intervalId = window.setInterval(() => {
      if (!localStorage.getItem("alpharider_token")) return;
      if (!isSessionExpired()) return;
      clearAuthSession();
      router.replace("/auth/login");
    }, 60_000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(intervalId);
    };
  }, [pathname, router]);

  return null;
}

