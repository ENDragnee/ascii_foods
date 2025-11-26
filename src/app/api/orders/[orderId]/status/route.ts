// app/api/orders/[orderId]/status/route.ts

import { NextResponse } from "next/server";
import { OrderStatus } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/serverAuth"; // Assuming you have a session utility
import { prisma } from "@/lib/prisma";

// Helper to check if a string is a valid OrderStatus
function isValidOrderStatus(status: OrderStatus): status is OrderStatus {
  return Object.values(OrderStatus).includes(status);
}

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await requireAuth(); // Secure the endpoint

  // Ensure user is an admin or cashier
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "CASHIER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const { orderId } = await params;
  if (!orderId) {
    return NextResponse.json(
      { message: "Order ID is required" },
      { status: 400 },
    );
  }

  try {
    const { status } = (await request.json()) as { status: OrderStatus };

    // Validate the incoming status
    if (!status || !isValidOrderStatus(status)) {
      return NextResponse.json(
        { message: "Invalid status provided" },
        { status: 400 },
      );
    }

    if (status !== "DEILVERED" && status !== "RETURNED") {
      return NextResponse.json(
        { message: "Status can only be updated to DEILVERED or RETURNED" },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { message: "Failed to update order status", error },
      { status: 500 },
    );
  }
}
