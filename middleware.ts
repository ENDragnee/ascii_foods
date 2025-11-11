import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth?view=signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protected routes
  matcher: ["/admin", "/orders"],
};

