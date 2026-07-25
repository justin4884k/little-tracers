"use client";

import { useEffect } from "react";

/** Registers the offline service worker (production only). */
export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is progressive enhancement; never block the app.
    });
  }, []);

  return null;
}
