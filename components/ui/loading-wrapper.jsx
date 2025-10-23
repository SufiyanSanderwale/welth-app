"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "./loading-spinner";

export function LoadingWrapper({ 
  children, 
  isLoading, 
  fallback = null,
  delay = 200,
  className = ""
}) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, delay]);

  if (isLoading && showLoading) {
    return fallback || (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return children;
}

export function SkeletonLoader({ className = "", lines = 3 }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export function PageLoadingSpinner({ text = "Loading page..." }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
}
