import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FoodCategory } from "@/generated/prisma/client";

export async function GET() {
  const foods = await prisma.foods.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(foods);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, price, category, imageUrl } = body;

    const food = await prisma.foods.create({
      data: {
        name,
        price: parseFloat(price),
        category: category as FoodCategory,
        imageUrl,
      },
    });
    return NextResponse.json(food);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create food" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.foods.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, name, price, category, imageUrl } = body;

    const food = await prisma.foods.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        category: category as FoodCategory,
        imageUrl,
      },
    });
    return NextResponse.json(food);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update food" },
      { status: 500 },
    );
  }
}
