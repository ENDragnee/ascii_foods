// /app/api/favorites/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // Your better-auth instance
import { prisma } from "@/lib/prisma";

// GET: Fetch the current user's favorite food IDs
export async function GET(request: NextRequest) {
  // ✅ CORRECT: Use auth.api.getSession and pass the request headers
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const favorites = await prisma.favouriteFoods.findMany({
      where: { userId: session.user.id },
      select: { foodId: true },
    });
    return NextResponse.json(favorites.map((fav) => fav.foodId));
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Add or remove a favorite for the current user
export async function POST(request: NextRequest) {
  // ✅ CORRECT: Use auth.api.getSession and pass the request headers
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { foodId } = (await request.json()) as { foodId: string };
    if (!foodId) {
      return NextResponse.json(
        { error: "Food ID is required" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    const existingFavorite = await prisma.favouriteFoods.findUnique({
      where: { userId_foodId: { userId, foodId } },
    });

    if (existingFavorite) {
      await prisma.favouriteFoods.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ message: "Favorite removed" });
    } else {
      await prisma.favouriteFoods.create({
        data: { userId, foodId },
      });
      return NextResponse.json({ message: "Favorite added" });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
