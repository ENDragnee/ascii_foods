import "dotenv/config";
import { Role } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password-utils";
import { createId as cuid } from "@paralleldrive/cuid2";
import { prisma } from "../src/lib/prisma";

const usersToSeed = [
  {
    name: "Regular User",
    email: "user@example.com",
    password: "user123",
    role: Role.USER,
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: Role.ADMIN,
  },
  {
    name: "Cashier User",
    email: "cashier@example.com",
    password: "cashier123",
    role: Role.CASHIER,
  },
];

async function main() {
  console.log("Starting user seeding with password hashing...\n");

  for (const seed of usersToSeed) {
    const existingUser = await prisma.user.findUnique({
      where: { email: seed.email },
    });
    if (existingUser) {
      console.log(`User ${seed.email} already exists. Skipping.`);
      continue;
    }

    const userId = cuid();
    const accountId = cuid();
    const hashedPassword = await hashPassword(seed.password);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          name: seed.name,
          email: seed.email,
          emailVerified: true,
          role: seed.role,
        },
      });

      await tx.account.create({
        data: {
          id: accountId,
          accountId: userId,
          providerId: "email",
          userId,
          password: hashedPassword,
        },
      });
    });

    console.log(`Created ${seed.role}: ${seed.email}`);
  }

  console.log("\n✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
