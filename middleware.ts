import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Keep the same list of protected routes used previously in middleware.js
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
])

// Create Clerk middleware handler (keeps the original behavior)
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth()
    return redirectToSignIn()
  }

  return NextResponse.next()
})

// Export a wrapper middleware that first handles _next CORS/headers, then
// delegates to the Clerk middleware for other routes. This ensures we only
// have a single middleware export (avoids duplicate page warnings).
export default async function middleware(request: NextRequest) {
  // Add CORS headers for static assets and chunks
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')
    response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
    response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless')
    return response
  }

  // Delegate everything else to Clerk's middleware
  return clerk(request as any)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}