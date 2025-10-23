"use client";

import { lazy, Suspense } from "react";
import { CardSkeleton } from "@/components/ui/loading-wrapper";

// Lazy load the economic calendar component
const EconomicCalendar = lazy(() => import("./economic-calendar"));

export function LazyEconomicCalendar(props) {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <EconomicCalendar {...props} />
    </Suspense>
  );
}


