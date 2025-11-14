// /lib/orderUtils.ts
import { Foods, Orders, User } from "@/generated/prisma/client"; // Use your updated import path

// This is the shape of a single order item in our UI
export interface OrderItem {
  id: string; // The original order ID
  foodName: string;
  quantity: number;
  imageUrl?: string | null;
}

// This is the shape of an order BATCH in our UI
export interface Order {
  id: string; // The batchId
  status: "new" | "preparing" | "ready";
  items: OrderItem[];
  totalPrice: number;
  createdAt: Date; // This type is a promise we must fulfill
  bonoNumber?: number | null;
  userName: string;
  isNew?: boolean; // For flashing animation
}

// This type represents the raw data coming from our API after JSON parsing
// Note that createdAt is a string here, which is the cause of the error.
type DbOrderFromApi = Omit<Orders, "createdAt"> & {
  createdAt: string;
  food: Foods;
  user: User;
  isNew?: boolean;
};

// The core logic to group flat database rows into displayable order batches
export const groupOrders = (dbOrders: DbOrderFromApi[]): Order[] => {
  const grouped = new Map<string, Order>();

  for (const order of dbOrders) {
    const batchId = order.batchId;
    if (!grouped.has(batchId)) {
      // Initialize a new group if this is the first item of the batch
      grouped.set(batchId, {
        id: batchId,
        status:
          order.orderStatus === "PENDING"
            ? "new"
            : order.orderStatus === "ACCEPTED"
              ? "preparing"
              : "ready",
        bonoNumber: order.bonoNumber,
        // ✅ FIX: Convert the createdAt string back into a Date object.
        createdAt: new Date(order.createdAt),
        userName: order.user.name,
        items: [],
        totalPrice: 0,
        isNew: order.isNew || false,
      });
    }

    const group = grouped.get(batchId)!;
    group.items.push({
      id: order.id,
      foodName: order.food.name,
      quantity: order.quantity,
      imageUrl: order.food.imageUrl,
    });
    group.totalPrice += order.totalPrice;
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  ); // Sort by the new Date object
};
