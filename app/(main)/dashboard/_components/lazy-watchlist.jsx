"use client";

import { lazy, Suspense } from "react";
import { CardSkeleton } from "@/components/ui/loading-wrapper";

// Lazy load the watchlist component
const Watchlist = lazy(() => import("./watchlist"));

export function LazyWatchlist(props) {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <Watchlist {...props} />
    </Suspense>
  );
}
