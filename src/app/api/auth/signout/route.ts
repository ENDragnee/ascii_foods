// /app/api/auth/signout/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await auth.api.signOut({ headers: request.headers });

    return NextResponse.json(
      { success: true, message: "Signed out successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Sign-out error:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
