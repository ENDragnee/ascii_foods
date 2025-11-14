// /app/api/orders/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/types";
import Ably from "ably";
import { createId as cuid } from "@paralleldrive/cuid2";

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

    // ✅ FIX: Generate a single batchId for this entire transaction.
    // This now correctly returns a 'string'.
    const batchId = cuid();

    const ordersData = items.map((item) => {
      const price = priceMap.get(item.id);
      if (price === undefined) throw new Error(`Invalid food item: ${item.id}`);
      return {
        userId: session.user!.id,
        foodId: item.id,
        quantity: item.quantity,
        totalPrice: price * item.quantity,
        batchId, // This is now a string, which matches the Prisma model.
      };
    });

    // ✅ FIX: This line no longer causes an error because ordersData has the correct shape.
    await prisma.orders.createMany({ data: ordersData });

    // ✅ Publish the new order to Ably for the cashier
    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Rest(process.env.ABLY_API_KEY);
      const channel = ably.channels.get("orders");
      // We fetch the full order details to send to the cashier
      // ✅ FIX: This query now works because batchId is a string.
      const newOrderBatch = await prisma.orders.findMany({
        where: { batchId },
        include: { food: true, user: true },
      });
      await channel.publish("new-order", newOrderBatch);
    }

    // ✅ FIX: The batchId returned here is also a simple string.
    return NextResponse.json({ success: true, batchId }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
