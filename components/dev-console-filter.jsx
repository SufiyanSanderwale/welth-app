"use client";

import { useEffect } from "react";

export default function DevConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const original = console.error;
    // eslint-disable-next-line no-console
    console.error = function filteredConsoleError(...args) {
      try {
        const first = args?.[0];
        const asText = (first ?? "").toString?.() ?? String(first ?? "");
        if (asText.trim() === "") return; // swallow empty console errors that trigger overlay
      } catch {}
      return original.apply(console, args);
    };
    return () => {
      // eslint-disable-next-line no-console
      console.error = original;
    };
  }, []);
  return null;
}


