import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// NOTE: ArcJet (@arcjet/next) was removed from middleware to keep the Edge
// Function bundle below Vercel's free plan 1 MB limit. ArcJet is a relatively
// large dependency and can push the middleware bundle over the limit when
// included here. If you need ArcJet protections, consider one of these options:
//  - Move ArcJet usage to a separate Edge Function or serverless API route
//    (deploy that function only where needed). Edge Function size limits
//    differ by plan and separate functions reduce the global middleware size.
//  - Integrate ArcJet on the server (not middleware) or use a smaller bot
//    detection library in the middleware.

// Create base Clerk middleware
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

// Export Clerk middleware as the default middleware. This keeps the middleware
// bundle lightweight and within Vercel limits.
export default clerk;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
