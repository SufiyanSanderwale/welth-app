"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";

export function LoadingButton({ 
  href, 
  children, 
  className = "", 
  size = "default",
  variant = "default",
  loadingText = "Loading...",
  onClick,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e) => {
    // Prevent default behavior and stop propagation so parent handlers don't run
    e.preventDefault();
    e.stopPropagation();

    // If an onClick handler was provided, call it and await if it returns a promise
    const runHandler = async () => {
      if (onClick) {
        try {
          const result = onClick(e);
          if (result && typeof result.then === 'function') {
            setIsLoading(true);
            await result;
            setIsLoading(false);
          }
        } catch (err) {
          // ensure loading state is cleared on error
          setIsLoading(false);
          throw err;
        }
      }
    };

    // Run handler and then navigate if href is present
    (async () => {
      try {
        await runHandler();
        if (href) {
          setIsLoading(true);
          router.push(href);
          // keep the loading state briefly to avoid flicker
          setTimeout(() => setIsLoading(false), 2000);
        }
      } catch (err) {
        // swallow here; caller's try/catch should show messages
        console.error('LoadingButton handler error:', err);
        setIsLoading(false);
      }
    })();
  };

  // Reset loading state when component unmounts or href changes
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, [href]);

  return (
    <Button
      size={size}
      variant={variant}
      className={`${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" showText={false} />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
