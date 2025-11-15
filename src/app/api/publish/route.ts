import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import { DAY, PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

// A simple interface for type-safety on the input
interface MenuInput {
  date: string;
  foodIds: (string)[];
  name: string;
  day: DAY;
}

export async function POST(req: Request) {
    const session = await requireAuth();
    
    if (!session || session.user?.role !== 'ADMIN') {
        redirect('/auth?view=signin');
    }

    try {
        const { menus }: { menus: MenuInput[] } = await req.json();

        if (!Array.isArray(menus) || menus.length === 0) {
            return NextResponse.json({ error: "No menu data provided" }, { status: 400 });
        }

        for (const menu of menus) {
            if (!Array.isArray(menu.foodIds) || menu.foodIds.length === 0) {
                return NextResponse.json({ error: `Menu for date ${menu.date} has no food items` }, { status: 400 });
            }
        }

        // map incoming day strings to Prisma DAY enum
        const dayMap: Record<string, DAY> = {
          Sunday: DAY.SUNDAY,
          Monday: DAY.MONDAY,
          Tuesday: DAY.TUESDAY,
          Wednesday: DAY.WEDNESDAY,
          Thursday: DAY.THURSDAY,
          Friday: DAY.FRIDAY,
          Saturday: DAY.SATURDAY,
        };

        const createActions = menus.map((menu: MenuInput) => {
            
            // Destructure the properties for *this specific menu*
            const { date, foodIds, name, day } = menu;

            const prismaDay = dayMap[day];
            return prisma.dailyMenu.create({
                data: {
                    date: new Date(date), 
                    name,                                    
                    day: prismaDay,
                    items: {
                        create: foodIds.map((foodId: string ) => ({
                            food: {
                                connect: { id: String(foodId) }
                            }
                        }))
                    }
                }
            });
        });

        const newDailyMenus = await prisma.$transaction(createActions);

        return NextResponse.json(newDailyMenus, { status: 201 });
    } catch (error: any) {
        console.error("Error publishing menus:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}