// /app/api/ably/token/route.ts
import { NextResponse } from "next/server";
import Ably from "ably";

export async function GET() {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json(
      { error: "Ably API key not configured" },
      { status: 500 },
    );
  }

  // Use a generic clientId for the cashier dashboard for simplicity
  const clientId = `cashier-dashboard-${Math.random().toString(36).substr(2, 9)}`;

  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId });

  return NextResponse.json(tokenRequestData);
}
