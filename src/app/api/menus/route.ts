// /app/api/menus/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const menus = await prisma.foods.findMany();
    return NextResponse.json(menus, { status: 200 });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
