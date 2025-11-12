import "better-auth";

declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null;
      role: "USER" | "ADMIN" | "CASHIER";
    };
  }
}
