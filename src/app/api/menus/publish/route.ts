import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // ✅ Use the singleton instance
import { DAY } from "@/generated/prisma/client";

// A simple interface for type-safety on the input
interface MenuInput {
  date: string;
  items: string[]; // Changed from foodIds to match frontend or handle both
  foodIds?: string[]; // Optional fallback
  name?: string;
  day?: string;
}

// Helper to get Prisma Day Enum from a Date object
const getDayEnum = (date: Date): DAY => {
  const days: DAY[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[date.getDay()];
};

export async function POST(req: Request) {
  // ✅ FIX: Use getSession instead of requireAuth.
  // APIs should return 401 JSON, not redirect to a login HTML page.
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    let menusToProcess: MenuInput[] = [];

    // ✅ FIX: Handle both Single Menu (frontend default) and Bulk Menus
    if (body.menus && Array.isArray(body.menus)) {
      // Case A: Bulk Publish
      menusToProcess = body.menus;
    } else if (body.items && Array.isArray(body.items) && body.date) {
      // Case B: Single Publish (This fixes your "No menu data provided" error)
      menusToProcess = [
        {
          date: body.date,
          items: body.items,
          name: body.name, // might be undefined, handled below
        },
      ];
    } else {
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 },
      );
    }

    // Process logic
    const createActions = menusToProcess.map((menu) => {
      // Handle key mismatch (items vs foodIds)
      const foodIds = menu.items || menu.foodIds || [];

      if (foodIds.length === 0) {
        throw new Error(`Menu for date ${menu.date} has no food items`);
      }

      const dateObj = new Date(menu.date);

      // Determine the Day Enum automatically from the date
      const prismaDay = getDayEnum(dateObj);

      // Generate a name if one isn't provided
      const menuName =
        menu.name ||
        `${dateObj.toLocaleDateString("en-US", { weekday: "long" })} Menu`;

      // Create the DailyMenu
      return prisma.dailyMenu.create({
        data: {
          date: dateObj,
          name: menuName,
          day: prismaDay,
          items: {
            create: foodIds.map((foodId) => ({
              food: {
                connect: { id: String(foodId) },
              },
            })),
          },
        },
      });
    });

    const newDailyMenus = await prisma.$transaction(createActions);

    return NextResponse.json(newDailyMenus, { status: 201 });
  } catch (error: unknown) {
    // ✅ FIX: Typed error handling
    console.error("Error publishing menus:", error);

    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

