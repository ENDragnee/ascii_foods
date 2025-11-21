export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
} as const;

export const FoodCategory = {
  NORMAL: "NORMAL",
  SPECIAL: "SPECIAL",
  HOTDRINK: "HOTDRINK",
  JUICE: "JUICE",
} as const;

export const OrderStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  FAILED: "FAILED",
  COMPLETED: "COMPLETED",
  DEILVERED: "DEILVERED",
  RETURNED: "RETURNED",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type FoodCategory = (typeof FoodCategory)[keyof typeof FoodCategory];

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: FoodCategory;
  imageUrl?: string | null;
}

export interface Foods extends MenuItem {
  createdAt?: Date | string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Session {
  session: {
    id: string;
    expiresAt: Date;
  };
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}
