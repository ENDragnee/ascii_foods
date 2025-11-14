import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import { PrismaClient, DAY } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const session = await requireAuth();
    
    if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth?view=signin');
    }

    try {
      const { date, foodIds, name, day } = await req.json();

      if (!Array.isArray(foodIds) || foodIds.length === 0) {
        return NextResponse.json({ error: "No menu items selected" }, { status: 400 });
      }

      const newDailyMenu = await prisma.dailyMenu.create({
        data: {
          date: new Date(date),
          name,
          day,
          items: {
            create: foodIds.map(foodId => ({
              food: {
                connect: { id: foodId } // Connects the DailyMenuItem to the Food
              }
            }))
          }
        },
        include: {
          items: true
        }
      });

      return NextResponse.json(newDailyMenu, { status: 201 });
  } catch (error: any) {
      console.error("Error publishing menu:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}