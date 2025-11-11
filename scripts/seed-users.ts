import "dotenv/config"; // Add this line
import { PrismaClient } from "../src/generated/prisma/client";
import cuid from "cuid";

const prisma = new PrismaClient();

interface SeedUser {
  name: string;
  email: string;
  password: string; // plain text, will be hashed
  role: "USER" | "ADMIN" | "CASHIER";
}

async function main() {
  const usersToSeed: SeedUser[] = [
    {
      name: "Regular User",
      email: "user@example.com",
      password: "user123",
      role: "USER",
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN",
    },
    {
      name: "Cashier User",
      email: "cashier@example.com",
      password: "cashier123",
      role: "CASHIER",
    },
  ];

  console.log("Starting user seeding with password hashing...\n");

  for (const seed of usersToSeed) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: seed.email },
        include: { accounts: true },
      });

      if (existingUser) {
        console.log(`User ${seed.email} already exists. Skipping.`);
        continue;
      }

      // Generate IDs
      const userId = cuid();
      const accountId = cuid();

      // Hash password using Better Auth
      const hashedPassword = await hashPassword(seed.password);

      // Create User + Account in a transaction
      await prisma.$transaction(async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
          data: {
            id: userId,
            name: seed.name,
            email: seed.email,
            emailVerified: true, // Set true for seeding
            role: seed.role,
          },
        });

        // 2. Create Local Account (email/password)
        await tx.account.create({
          data: {
            id: accountId,
            accountId: userId, // same as user.id for local accounts
            providerId: "email",
            userId: userId,
            password: hashedPassword,
          },
        });

        console.log(
          `Created ${seed.role}: ${user.name} (${user.email}) | Password: ${seed.password}`,
        );
      });
    } catch (error) {
      console.error(`Failed to seed ${seed.email}:`, error);
    }
  }

  console.log("\nSeeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
