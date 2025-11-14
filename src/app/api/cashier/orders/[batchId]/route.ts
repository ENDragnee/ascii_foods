// /app/api/cashier/orders/[batchId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import Ably from "ably";

interface RouteParams {
  params: Promise<{
    batchId: string;
  }>;
}

// The PATCH function to update an order's status
export async function PATCH(request: Request, { params }: RouteParams) {
  const { batchId } = await params;
  if (!batchId) {
    return NextResponse.json(
      { error: "Batch ID is required" },
      { status: 400 },
    );
  }

  const { newStatus } = (await request.json()) as { newStatus: OrderStatus };
  if (!newStatus) {
    return NextResponse.json(
      { error: "New status is required" },
      { status: 400 },
    );
  }

  try {
    let bonoNumber: number | undefined = undefined;

    // --- Bono Number Generation Logic ---
    // This logic runs ONLY when an order is first accepted.
    if (newStatus === "ACCEPTED") {
      // Find the most recently created order that has a bono number.
      const lastOrderWithBono = await prisma.orders.findFirst({
        where: { bonoNumber: { not: null } },
        orderBy: { createdAt: "desc" },
      });

      const lastBono = lastOrderWithBono?.bonoNumber ?? 0;
      bonoNumber = lastBono >= 100 ? 1 : lastBono + 1; // Reset to 1 if last was 100
    }

    // --- Update all items in the batch with the new status ---
    await prisma.orders.updateMany({
      where: { batchId },
      data: {
        orderStatus: newStatus,
        // Only update the bonoNumber field if a new one was generated
        ...(bonoNumber !== undefined && { bonoNumber }),
      },
    });

    // Fetch the full, updated batch data to send via Ably
    const updatedBatch = await prisma.orders.findMany({
      where: { batchId },
      include: { food: true, user: true },
    });

    if (updatedBatch.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // --- Ably Notification Logic ---
    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Rest(process.env.ABLY_API_KEY);

      // 1. Notify all cashiers that an order was updated
      const cashierChannel = ably.channels.get("orders");
      await cashierChannel.publish("order-update", updatedBatch);

      // ✅ FIX: This is the critical part that was missing.
      // 2. If the order is ready, send a specific notification to the user.
      if (newStatus === "COMPLETED") {
        const user = updatedBatch[0].user;
        const finalBonoNumber = bonoNumber ?? updatedBatch[0].bonoNumber; // Use the newly generated or existing bono

        // The channel name must exactly match what the client-side subscribes to.
        const userChannelName = `user:${user.id}`;
        const userChannel = ably.channels.get(userChannelName);

        console.log(`Publishing to user channel: ${userChannelName}`);

        // The event name 'notification' must also match the client-side subscription.
        await userChannel.publish("notification", {
          title: "Your Order is Ready!",
          body: `Order with Bono #${finalBonoNumber} is now ready for pickup.`,
        });
      }
    }

    return NextResponse.json(updatedBatch);
  } catch (error) {
    console.error(`Error updating order ${batchId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
