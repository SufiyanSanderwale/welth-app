"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ 
  size = "default", 
  className = "",
  text = "Loading...",
  showText = true 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Loader2 spinner: force smooth infinite rotation with custom keyframes and fallback to Tailwind animate-spin */}
      <Loader2
        className={cn("animate-spin loader", sizeClasses[size])}
        style={{
          willChange: 'transform',
          transition: 'none',
          animation: 'spin 1s linear infinite !important',
          display: 'block',
        }}
      />
      {showText && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

export function PageLoadingSpinner({ text = "Loading page..." }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        {/* Loader2 spinner: force smooth infinite rotation with custom keyframes and fallback to Tailwind animate-spin */}
        <Loader2
          className="h-12 w-12 animate-spin loader text-primary"
          style={{
            willChange: 'transform',
            transition: 'none',
            animation: 'spin 1s linear infinite !important',
            display: 'block',
          }}
        />
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

export function ButtonLoadingSpinner({ size = "sm" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6"
  };

  // Loader2 spinner: force smooth infinite rotation with custom keyframes and fallback to Tailwind animate-spin
  return (
    <Loader2
      className={cn("animate-spin loader", sizeClasses[size])}
      style={{
        willChange: 'transform',
        transition: 'none',
        animation: 'spin 1s linear infinite !important',
        display: 'block',
      }}
    />
  );
}
