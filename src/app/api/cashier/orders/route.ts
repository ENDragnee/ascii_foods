// /app/api/cashier/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all orders that are not yet delivered or returned
    const orders = await prisma.orders.findMany({
      where: {
        orderStatus: {
          in: ["PENDING", "ACCEPTED", "COMPLETED"],
        },
      },
      include: {
        food: true, // Include food details
        user: true, // Include user name
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching cashier orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
