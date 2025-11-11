// /app/api/orders/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/types";

// --- GET: Fetch the current user's recent orders ---
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId: session.user.id,
      },
      // Include the related food data for each order so we can display its name and image
      include: {
        food: true,
      },
      // Order by the most recent first
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// --- POST: Create new orders from a user's cart ---
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { items: CartItem[] };
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 },
      );
    }

    // --- Server-Side Price Calculation and Order Data Preparation ---
    // This is a CRITICAL security step. We fetch prices from our database,
    // not the client, to prevent price manipulation.
    const foodIds = items.map((item) => item.id);
    const foodsFromDb = await prisma.foods.findMany({
      where: {
        id: { in: foodIds },
      },
    });

    // Create a map for quick price lookups
    const priceMap = new Map(foodsFromDb.map((food) => [food.id, food.price]));

    // A simple, random number for this order batch. In a real app,
    // this might be a sequential, guaranteed-unique number.
    const bonoNumber = Math.floor(1000 + Math.random() * 9000);

    const ordersData = items.map((item) => {
      const price = priceMap.get(item.id);
      if (price === undefined) {
        throw new Error(`Food item with ID ${item.id} not found.`);
      }
      return {
        userId: session.user.id,
        foodId: item.id,
        quantity: item.quantity,
        totalPrice: price * item.quantity,
        bonoNumber, // All items in this checkout share the same bono number
      };
    });

    // --- Transactional Database Insert ---
    // Using a transaction ensures that either ALL orders are created, or NONE are.
    // This prevents a partial order if one of the items fails to save.
    await prisma.orders.createMany({
      data: ordersData,
    });

    return NextResponse.json({ success: true, bonoNumber }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
