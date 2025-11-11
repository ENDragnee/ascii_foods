// /lib/prisma.ts
import { PrismaClient } from "../generated/prisma/client";

// This declaration extends the global scope of NodeJS to include our prisma instance.
// It tells TypeScript that we're adding a new property to the globalThis object.
declare global {
  var prisma: PrismaClient | undefined;
}

// The core of the solution:
// 1. Check if an instance of Prisma Client already exists on the global object.
// 2. If it does, reuse that existing instance.
// 3. If it does not, create a new PrismaClient instance.
export const prisma = globalThis.prisma || new PrismaClient();

// In a non-production environment (i.e., development), we assign the created
// prisma instance to globalThis.prisma. This ensures that on the next hot-reload,
// the check `globalThis.prisma` will find the existing instance and reuse it.
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
