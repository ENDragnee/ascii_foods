import { Role } from "@/generated/prisma/client"; // Import the Prisma enum

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  // It's better to use the specific enum here too for maximum type safety
  category: "NORMAL" | "SPECIAL" | "HOTDRINK" | "JUICE";
  imageUrl?: string | null;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

// ✅ FIX: Redefine the Session interface to match the actual object structure from better-auth.
export interface Session {
  // This nested `session` object contains the session metadata.
  session: {
    id: string;
    expiresAt: Date;
    // Add any other properties from the raw session object you might need
  };
  // The `user` object contains the user's details.
  user: {
    id: string;
    email: string;
    name: string;
    // The `role` property uses the actual Prisma Role enum.
    role: Role;
  };
}
