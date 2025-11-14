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
  const { newStatus } = (await request.json()) as { newStatus: OrderStatus };

  try {
    let bonoNumber: number | undefined = undefined;

    // Bono Number Generation Logic
    if (newStatus === "ACCEPTED") {
      const lastOrderWithBono = await prisma.orders.findFirst({
        where: { bonoNumber: { not: null } },
        orderBy: { createdAt: "desc" },
      });

      const lastBono = lastOrderWithBono?.bonoNumber ?? 0;
      bonoNumber = lastBono >= 100 ? 1 : lastBono + 1;
    }

    // Update all items in the batch
    await prisma.orders.updateMany({
      where: { batchId },
      data: {
        orderStatus: newStatus,
        // Only update bonoNumber if it was generated
        ...(bonoNumber !== undefined && { bonoNumber }),
      },
    });

    // Fetch the updated batch to publish
    const updatedBatch = await prisma.orders.findMany({
      where: { batchId },
      include: { food: true, user: true },
    });

    // Publish update to Ably
    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Rest(process.env.ABLY_API_KEY);
      const channel = ably.channels.get("orders");
      await channel.publish("order-update", updatedBatch);

      // If order is ready, push a notification to the specific user
      if (newStatus === "COMPLETED" && updatedBatch.length > 0) {
        const userChannel = ably.channels.get(`user:${updatedBatch[0].userId}`);
        await userChannel.publish("notification", {
          title: "Your Order is Ready!",
          body: `Order with Bono #${bonoNumber ?? updatedBatch[0].bonoNumber} is now ready for pickup.`,
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
