import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// ✅ FIX: Import the 'Prisma' namespace from your generated client.
import { Prisma } from "@/generated/prisma/client";
import { CartItem } from "@/types";
import Ably from "ably";
import { createId as cuid } from "@paralleldrive/cuid2";

// --- GET: Fetch the current user's recent orders ---
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // e.g., '2025-11-15'

  // ✅ FIX: Use the specific Prisma type instead of 'any' for full type safety.
  const whereClause: Prisma.OrdersWhereInput = {
    userId: session.user.id,
  };

  if (date && !isNaN(new Date(date).getTime())) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    whereClause.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  try {
    const orders = await prisma.orders.findMany({
      where: whereClause,
      include: {
        food: true,
      },
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
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { items } = (await request.json()) as { items: CartItem[] };
    if (!items || items.length === 0)
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const foodIds = items.map((item) => item.id);
    const foodsFromDb = await prisma.foods.findMany({
      where: { id: { in: foodIds } },
    });
    const priceMap = new Map(foodsFromDb.map((food) => [food.id, food.price]));

    const batchId = cuid();

    const ordersData = items.map((item) => {
      const price = priceMap.get(item.id);
      if (price === undefined) throw new Error(`Invalid food item: ${item.id}`);
      return {
        userId: session.user!.id,
        foodId: item.id,
        quantity: item.quantity,
        totalPrice: price * item.quantity,
        batchId,
      };
    });

    await prisma.orders.createMany({ data: ordersData });

    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Rest(process.env.ABLY_API_KEY);
      const channel = ably.channels.get("orders");
      const newOrderBatch = await prisma.orders.findMany({
        where: { batchId },
        include: { food: true, user: true },
      });
      await channel.publish("new-order", newOrderBatch);
    }

    return NextResponse.json({ success: true, batchId }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
