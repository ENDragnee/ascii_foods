import { createYoga, createSchema } from "graphql-yoga";
import { prisma } from "@/lib/prisma";
// ✅ FIX: Import the PrismaClient type to define our context.
import type { PrismaClient } from "@/generated/prisma/client";

// ✅ FIX: Define a specific type for our GraphQL context.
// This tells TypeScript that our context will always have a `prisma` property.
interface GraphQLContext {
  prisma: PrismaClient;
}

// 1. Define your GraphQL Schema
const typeDefs = `
  type AdminDashboardStats {
    newOrdersCount: Int!
    preparingCount: Int!
    readyCount: Int!
    totalOrdersCompletedToday: Int!
    completionRate: Float!
    averageCompletionTime: Float!
  }

  type FoodItem {
    id: String!
    name: String!
    imageUrl: String
  }

  type TopSeller {
    food: FoodItem!
    sales: Int!
  }

  type Query {
    getAdminDashboardStats: AdminDashboardStats!
    getTopSellingItems: [TopSeller!]!
    getTodaysMenu: [FoodItem!]!
  }
`;

// 2. Define your Resolvers
const resolvers = {
  Query: {
    // ✅ FIX: Type the resolver arguments and prefix unused ones with '_'.
    getAdminDashboardStats: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      // --- Date Setup ---
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // --- Order Counts by Status ---
      const pendingBatches = await context.prisma.orders.groupBy({
        by: ["batchId"],
        where: { orderStatus: "PENDING" },
      });
      const preparingBatches = await context.prisma.orders.groupBy({
        by: ["batchId"],
        where: { orderStatus: "ACCEPTED" },
      });
      const readyBatches = await context.prisma.orders.groupBy({
        by: ["batchId"],
        where: { orderStatus: "COMPLETED" },
      });

      const newOrdersCount = pendingBatches.length;
      const preparingCount = preparingBatches.length;
      const readyCount = readyBatches.length;

      // --- Today's Performance Metrics ---
      const totalOrdersCompletedToday = await context.prisma.orders.count({
        where: {
          orderStatus: "COMPLETED",
          updatedAt: { gte: today, lt: tomorrow },
        },
      });

      const totalOrdersToday = await context.prisma.orders.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      });

      const completionRate =
        totalOrdersToday > 0
          ? (totalOrdersCompletedToday / totalOrdersToday) * 100
          : 0;

      // --- Average Completion Time Calculation ---
      let averageCompletionTime = 0;

      const lastCompletedBatches = await context.prisma.orders.findMany({
        where: { orderStatus: "COMPLETED" },
        distinct: ["batchId"],
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: { batchId: true },
      });

      if (lastCompletedBatches.length > 0) {
        let totalCompletionTimeMs = 0;
        let processedBatchCount = 0;
        // ✅ FIX: Explicitly type the parameter 'b' to resolve the implicit 'any' error.
        const batchIds = lastCompletedBatches.map(
          (b: { batchId: string }) => b.batchId,
        );

        for (const batchId of batchIds) {
          const firstItem = await context.prisma.orders.findFirst({
            where: { batchId },
            orderBy: { createdAt: "asc" },
          });
          const lastUpdatedItem = await context.prisma.orders.findFirst({
            where: { batchId },
            orderBy: { updatedAt: "desc" },
          });

          if (firstItem && lastUpdatedItem) {
            const timeDifference =
              lastUpdatedItem.updatedAt.getTime() -
              firstItem.createdAt.getTime();
            totalCompletionTimeMs += timeDifference;
            processedBatchCount++;
          }
        }

        if (processedBatchCount > 0) {
          averageCompletionTime =
            totalCompletionTimeMs / processedBatchCount / (1000 * 60);
        }
      }

      // --- Return the final stats object ---
      return {
        newOrdersCount,
        preparingCount,
        readyCount,
        totalOrdersCompletedToday,
        completionRate: parseFloat(completionRate.toFixed(1)),
        averageCompletionTime: parseFloat(averageCompletionTime.toFixed(1)),
      };
    },

    getTopSellingItems: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sales = await context.prisma.orders.groupBy({
        by: ["foodId"],
        where: {
          orderStatus: "COMPLETED",
          createdAt: { gte: today },
        },
        // Sum the quantity of each food item sold
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 3, // Get the top 3 sellers
      });

      if (sales.length === 0) return [];

      const foodIds = sales.map((s) => s.foodId);
      const foods = await context.prisma.foods.findMany({
        where: { id: { in: foodIds } },
      });

      const foodMap = new Map(foods.map((f) => [f.id, f]));

      return sales.map((sale) => ({
        food: foodMap.get(sale.foodId),
        sales: sale._sum.quantity || 0,
      }));
    },

    getTodaysMenu: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyMenu = await context.prisma.dailyMenu.findFirst({
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          items: {
            include: {
              food: true,
            },
          },
        },
      });

      if (!dailyMenu) return [];

      return dailyMenu.items.map((item) => item.food);
    },
  },
};

// 3. Create the Yoga server
const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  // ✅ FIX: Provide a typed context function.
  context: (): GraphQLContext => ({
    prisma,
  }),
  graphqlEndpoint: "/api/graphql",
  graphiql: process.env.NODE_ENV !== "production",
  fetchAPI: {
    Response,
    Request,
  },
});

export { handleRequest as GET, handleRequest as POST };
