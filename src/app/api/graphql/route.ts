import { createYoga, createSchema } from "graphql-yoga";
import { prisma } from "@/lib/prisma";
import { PrismaClient, Prisma, DAY } from "@/generated/prisma/client";
import { OrderStatus } from "@/types";

interface GraphQLContext {
  prisma: PrismaClient;
}

// 1. Define your GraphQL Schema
const typeDefs = `
  type FoodItem {
    id: String!
    name: String!
    price: Float!
    imageUrl: String
  }

  type RecentMenu {
    id: String!
    date: String!
    name: String
    itemCount: Int!
    items: [FoodItem!]!
  }

  type UserInfo {
    id: String!
    name: String!
    email: String!
  }

  type OrderItem {
    id: String!
    food: FoodItem!
    quantity: Int!
    totalPrice: Float!
    createdAt: String!
    bonoNumber: Int
    orderStatus: String!
    user: UserInfo!
  }
  
  type PaginatedOrders {
    orders: [OrderItem!]!
    totalCount: Int!
  }

  type PaginatedFoods {
    foods: [FoodItem!]!
    totalCount: Int!
  }

  type TimeDataPoint {
    time: String!
    value: Int!
  }

  type RankedFoodItem {
    food: FoodItem!
    value: Float!
  }

  type RankedUser {
    user: UserInfo!
    value: Float!
  }

  type AnalyticsData {
    ordersOverTime: [TimeDataPoint!]!
    topSellingFoods: [RankedFoodItem!]!
    topRevenueFoods: [RankedFoodItem!]!
    topCustomers: [RankedUser!]!
  }
  
  type TopSeller {
    food: FoodItem!
    sales: Int!
  }

  type Query {
    getAdminDashboardStats: AdminDashboardStats!
    getRecentMenus: [RecentMenu!]!
    
    getOrders(
      skip: Int!, 
      take: Int!, 
      search: String, 
      startDate: String, 
      endDate: String, 
      status: String,
      sortBy: String,
      sortOrder: String
    ): PaginatedOrders!

    getFoods(skip: Int!, take: Int!): PaginatedFoods!
    getAdminAnalytics: AnalyticsData!
    getTopSellingItems: [TopSeller!]!
    getTodaysMenu: [FoodItem!]!
  }

  type AdminDashboardStats {
    newOrdersCount: Int!
    preparingCount: Int!
    readyCount: Int!
    totalOrdersCompletedToday: Int!
    completionRate: Float!
    averageCompletionTime: Float!
  }
`;

// Helper to get Prisma Enum DAY from JS Date
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

// 2. Define your Resolvers
const resolvers = {
  Query: {
    getAdminDashboardStats: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

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
        const batchIds = lastCompletedBatches.map((b) => b.batchId);

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
            totalCompletionTimeMs +=
              lastUpdatedItem.updatedAt.getTime() -
              firstItem.createdAt.getTime();
            processedBatchCount++;
          }
        }
        if (processedBatchCount > 0) {
          averageCompletionTime =
            totalCompletionTimeMs / processedBatchCount / (1000 * 60);
        }
      }
      return {
        newOrdersCount: pendingBatches.length,
        preparingCount: preparingBatches.length,
        readyCount: readyBatches.length,
        totalOrdersCompletedToday,
        completionRate: parseFloat(completionRate.toFixed(1)),
        averageCompletionTime: parseFloat(averageCompletionTime.toFixed(1)),
      };
    },

    getOrders: async (
      _: unknown,
      args: {
        skip: number;
        take: number;
        search?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      },
      context: GraphQLContext,
    ) => {
      const {
        skip,
        take,
        search,
        startDate,
        endDate,
        status,
        sortBy,
        sortOrder,
      } = args;
      const where: Prisma.OrdersWhereInput = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
      if (status && status !== "ALL") where.orderStatus = status as OrderStatus;
      if (search) {
        where.OR = [
          { user: { name: { contains: search, mode: "insensitive" } } },
          { food: { name: { contains: search, mode: "insensitive" } } },
        ];
      }
      const orderBy: Prisma.OrdersOrderByWithRelationInput = {};
      if (sortBy) {
        if (sortBy === "user") orderBy.user = { name: sortOrder || "asc" };
        else if (sortBy === "food") orderBy.food = { name: sortOrder || "asc" };
        else
          (orderBy as unknown as Record<string, Prisma.SortOrder>)[sortBy] =
            sortOrder || "desc";
      } else {
        orderBy.createdAt = "desc";
      }
      const [orders, totalCount] = await Promise.all([
        context.prisma.orders.findMany({
          skip,
          take,
          where,
          orderBy,
          include: { food: true, user: true },
        }),
        context.prisma.orders.count({ where }),
      ]);
      return { orders, totalCount };
    },

    getFoods: async (
      _: unknown,
      { skip, take }: { skip: number; take: number },
      context: GraphQLContext,
    ) => {
      const [foods, totalCount] = await Promise.all([
        context.prisma.foods.findMany({ skip, take, orderBy: { name: "asc" } }),
        context.prisma.foods.count(),
      ]);
      return { foods, totalCount };
    },

    getRecentMenus: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => {
      const recentMenus = await context.prisma.dailyMenu.findMany({
        take: 7,
        orderBy: { date: "desc" },
        include: {
          items: {
            include: {
              food: true,
            },
          },
        },
      });

      return recentMenus.map((menu) => ({
        id: menu.id,
        date: menu.date.toISOString(),
        name:
          menu.name ||
          new Date(menu.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          }),
        itemCount: menu.items.length,
        items: menu.items.map((i) => i.food),
      }));
    },

    getAdminAnalytics: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const dailyOrders = await context.prisma.orders.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: { _all: true },
        orderBy: { createdAt: "asc" },
      });
      const ordersMap = new Map<string, number>();
      dailyOrders.forEach((order) => {
        const day = order.createdAt.toISOString().split("T")[0];
        ordersMap.set(day, (ordersMap.get(day) || 0) + order._count._all);
      });
      const ordersOverTime = Array.from(ordersMap.entries()).map(
        ([time, value]) => ({ time, value }),
      );

      const topSellers = await context.prisma.orders.groupBy({
        by: ["foodId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      });
      const topSellerFoods = await context.prisma.foods.findMany({
        where: { id: { in: topSellers.map((f) => f.foodId) } },
      });
      const topSellingFoods = topSellers.map((seller) => ({
        food: topSellerFoods.find((f) => f.id === seller.foodId),
        value: seller._sum.quantity || 0,
      }));

      const topRevenue = await context.prisma.orders.groupBy({
        by: ["foodId"],
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
      });
      const topRevenueFoodsData = await context.prisma.foods.findMany({
        where: { id: { in: topRevenue.map((f) => f.foodId) } },
      });
      const topRevenueFoods = topRevenue.map((item) => ({
        food: topRevenueFoodsData.find((f) => f.id === item.foodId),
        value: item._sum.totalPrice || 0,
      }));

      const topSpenders = await context.prisma.orders.groupBy({
        by: ["userId"],
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
      });
      const topUsers = await context.prisma.user.findMany({
        where: { id: { in: topSpenders.map((u) => u.userId) } },
        select: { id: true, name: true },
      });
      const topCustomers = topSpenders.map((spender) => ({
        user: topUsers.find((u) => u.id === spender.userId),
        value: spender._sum.totalPrice || 0,
      }));

      return { ordersOverTime, topSellingFoods, topRevenueFoods, topCustomers };
    },

    getTopSellingItems: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => {
      const sales = await context.prisma.orders.groupBy({
        by: ["foodId"],
        where: {
          orderStatus: "COMPLETED",
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 3,
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

    getTodaysMenu: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentDayEnum = getDayEnum(new Date());

      const dailyMenu = await context.prisma.dailyMenu.findFirst({
        where: {
          OR: [
            {
              date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
              },
            },
            {
              day: currentDayEnum,
            },
          ],
        },
        orderBy: {
          date: "desc",
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

// ------------------------------------------------------------------
// FIX IS HERE:
// ------------------------------------------------------------------

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
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

interface NextRouteContext {
  params: Promise<Record<string, string | string[] | undefined>>;
}

const handle = (request: Request, context: NextRouteContext) => {
  return yoga.fetch(request, context);
};

export { handle as GET, handle as POST };
