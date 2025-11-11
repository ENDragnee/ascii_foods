import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    // Check cookie for optimistic redirects for protected routes
    // Use getSession in your RSC to protect a route via SSR or useAuthenticate client side
    const sessionCookie = getSessionCookie(request)

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/auth?view=signin", request.url))
    }

    return NextResponse.next()
}

export const config = {
    // Protected routes
    matcher: ["/shop"]
}