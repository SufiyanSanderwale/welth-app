"use client";

import { lazy, Suspense } from "react";
import { CardSkeleton } from "@/components/ui/loading-wrapper";

// Lazy load the surplus suggestions component
const SurplusSuggestions = lazy(() => import("./surplus-suggestions"));

export function LazySurplusSuggestions(props) {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <SurplusSuggestions {...props} />
    </Suspense>
  );
}
