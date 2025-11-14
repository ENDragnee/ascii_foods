// /app/api/session/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // Your better-auth instance

export async function GET(request: NextRequest) {
  try {
    // Use the correct better-auth method to get the session from the incoming request's headers
    const session = await auth.api.getSession({ headers: request.headers });

    // If there is no valid session, it's not an error.
    // We simply return a null session object, which is the expected state for a logged-out user.
    if (!session) {
      return NextResponse.json({ session: null });
    }

    // If a session exists, return it inside a 'session' property to match the client's expectation.
    return NextResponse.json({ session });
  } catch (error) {
    // If any unexpected error occurs during session validation, log it and return a null session.
    console.error("API Session Error:", error);
    return NextResponse.json(
      { session: null, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
