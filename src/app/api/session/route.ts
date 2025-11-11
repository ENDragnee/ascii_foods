// /app/api/session/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Use the correct better-auth method to get the session from the request
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      // Return a consistent structure for a "not logged in" state
      return NextResponse.json({ session: null });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("API Session Error:", error);
    // In case of an error, assume no valid session
    return NextResponse.json({ session: null }, { status: 500 });
  }
}
