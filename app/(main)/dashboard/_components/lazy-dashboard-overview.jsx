"use client";

import { lazy, Suspense } from "react";
import { CardSkeleton } from "@/components/ui/loading-wrapper";

// Lazy load the heavy dashboard overview component
const DashboardOverview = lazy(() => import("./transaction-overview"));

export function LazyDashboardOverview(props) {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <DashboardOverview {...props} />
    </Suspense>
  );
}
