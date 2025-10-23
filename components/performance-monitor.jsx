"use client";

import { useEffect, useState } from "react";

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "navigation") {
          setMetrics({
            loadTime: entry.loadEventEnd - entry.loadEventStart,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByType("paint").find(entry => entry.name === "first-paint")?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByType("paint").find(entry => entry.name === "first-contentful-paint")?.startTime || 0,
          });
        }
      });
    });

    observer.observe({ entryTypes: ["navigation", "paint"] });

    return () => observer.disconnect();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development" || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
      <div>Load: {metrics.loadTime?.toFixed(0)}ms</div>
      <div>DOM: {metrics.domContentLoaded?.toFixed(0)}ms</div>
      <div>FP: {metrics.firstPaint?.toFixed(0)}ms</div>
      <div>FCP: {metrics.firstContentfulPaint?.toFixed(0)}ms</div>
    </div>
  );
}
