// /app/api/ably/token/route.ts
import { NextResponse, NextRequest } from "next/server";
import Ably from "ably";
import { auth } from "@/lib/auth"; // Your better-auth instance

export async function GET(request: NextRequest) {
  // Ensure the Ably API key is configured on the server
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json(
      { error: "Ably API key not configured" },
      { status: 500 },
    );
  }

  // Get the current user's session from the request headers
  const session = await auth.api.getSession({ headers: request.headers });

  // If there is no session, the user is not authenticated. Deny the token request.
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the secure userId from the session as the clientId for Ably.
  // This ensures the user can only access resources permitted for this ID.
  const clientId = session.user.id;

  const client = new Ably.Rest(process.env.ABLY_API_KEY);

  // Create a token request for this specific clientId
  const tokenRequestData = await client.auth.createTokenRequest({ clientId });

  return NextResponse.json(tokenRequestData);
}
