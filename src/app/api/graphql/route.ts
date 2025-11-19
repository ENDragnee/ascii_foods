// app/api/graphql/route.ts

import { createYoga, createSchema } from "graphql-yoga";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

// 1. Define your GraphQL Schema (as a plain string)
const typeDefs = `
  type AdminDashboardStats {
    newOrdersCount: Int!
    preparingCount: Int!
    readyCount: Int!
    totalOrdersCompletedToday: Int!
    completionRate: Float!
  }

  type Query {
    getAdminDashboardStats: AdminDashboardStats!
  }
`;

const resolvers = {
  Query: {
    getAdminDashboardStats: async (parent: any, args: any, context: any) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all unique batches where status is PENDING
      const pendingBatches = await context.prisma.orders.groupBy({
        by: ['batchId'],
        where: { orderStatus: "PENDING" },
      });
      const newOrdersCount = pendingBatches.length;

      // Get all unique batches where status is ACCEPTED
      const preparingBatches = await context.prisma.orders.groupBy({
        by: ['batchId'],
        where: { orderStatus: "ACCEPTED" },
      });
      const preparingCount = preparingBatches.length;

      // Get all unique batches where status is COMPLETED
      const readyBatches = await context.prisma.orders.groupBy({
        by: ['batchId'],
        where: { orderStatus: "COMPLETED" },
      });
      const readyCount = readyBatches.length;
      const totalOrdersCompletedToday = await context.prisma.orders.count({
        where: {
          orderStatus: "COMPLETED",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const totalOrdersToday = await context.prisma.orders.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const completionRate =
        totalOrdersToday > 0
          ? (totalOrdersCompletedToday / totalOrdersToday) * 100
          : 0;

      return {
        newOrdersCount,
        preparingCount,
        readyCount,
        totalOrdersCompletedToday,
        completionRate: parseFloat(completionRate.toFixed(1)),
      };
    },
  },
};

// 3. Create the Yoga server
const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  // Pass our prisma instance into the context for every request
  context: {
    prisma,
  },
  // This is the endpoint path
  graphqlEndpoint: "/api/graphql",

  graphiql: true, // for testing

  fetchAPI: {
    Response,
    Request,
  },
});

export { handleRequest as GET, handleRequest as POST };