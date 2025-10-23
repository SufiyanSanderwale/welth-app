"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading briefly when pathname changes
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="flex items-center justify-center py-2">
        <LoadingSpinner size="sm" text="Loading..." />
      </div>
    </div>
  );
}
