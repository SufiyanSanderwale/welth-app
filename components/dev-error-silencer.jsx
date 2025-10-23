"use client";

export default function DevErrorSilencer() {
  if (process.env.NODE_ENV !== "development") return null;

  // Swallow empty window error events that some third-party widgets emit
  if (typeof window !== "undefined") {
    // Only attach once
    if (!window.__welth_silencer_installed__) {
      window.__welth_silencer_installed__ = true;
      const handler = function (event) {
        try {
          const msg = (event?.message ?? "").toString();
          if (msg.trim() === "") {
            event.preventDefault?.();
            return false;
          }
        } catch {}
        return undefined;
      };
      window.addEventListener("error", handler, { capture: true });
    }
  }
  return null;
}


