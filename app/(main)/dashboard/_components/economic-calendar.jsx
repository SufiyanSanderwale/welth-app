"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Uses TradingView free embed
// Terms: https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/

export default function EconomicCalendar() {
  const containerRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;
    
    // Ensure we only load the script once
    if (scriptLoaded.current) return;
    
    // Use a small timeout to ensure the DOM is fully rendered
    const timeoutId = setTimeout(() => {
      try {
        // Use the ref instead of getElementById for more reliable access
        const container = containerRef.current;
        if (!container) return;
        
        // Guard against TradingView iframe race condition in dev
        const originalConsoleError = console.error;
        // eslint-disable-next-line no-console
        console.error = function patchedConsoleError(...args) {
          try {
            const msg = (args?.[0] ?? "")?.toString?.() ?? "";
            if (msg.includes("contentWindow is not available")) return; // suppress noisy embed error
          } catch {}
          return originalConsoleError.apply(console, args);
        };
        
        // Create and configure the script
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        script.async = true;
        // Force light theme for higher-contrast dark text on light background
        script.innerHTML = JSON.stringify({
          colorTheme: "light",
          isTransparent: true,
          width: "100%",
          height: 400,
          locale: "en",
          importanceFilter: "0,1",
        });
        
        // Append the script and mark as loaded
        container.appendChild(script);
        scriptLoaded.current = true;
        
        // Cleanup function
        return () => {
          try {
            if (script.parentElement === container) container.removeChild(script);
            // eslint-disable-next-line no-console
            console.error = originalConsoleError;
            scriptLoaded.current = false;
          } catch {}
        };
      } catch (error) {
        console.error("Error loading TradingView widget:", error);
      }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Economic Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="tv-econ-calendar" ref={containerRef} className="w-full"></div>
      </CardContent>
    </Card>
  );
}


