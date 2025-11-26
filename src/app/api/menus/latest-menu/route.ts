// app/api/daily-menu/latest/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // group by date and get the latest createdAt for each
    const latestByDate = await prisma.dailyMenu.groupBy({
      by: ["date"],
      where: {
        date: { gte: today },
      },
      _max: {
        createdAt: true,
      },
    });

    // fetch ONLY those menus (matching date + latest createdAt)
    const orWhere = latestByDate
      .filter((item) => item._max.createdAt)
      .map((item) => ({
        date: item.date,
        createdAt: item._max.createdAt as Date, // ensures latest one (non-null)
      }));

    const latestMenus = await prisma.dailyMenu.findMany({
      where: {
        OR: orWhere,
      },
      include: {
        items: {
          include: {
            food: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({ menus: latestMenus }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch menus", error },
      { status: 500 },
    );
  }
}
