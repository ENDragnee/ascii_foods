"use client"

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChefHat, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type Ably from "ably";

import DashboardHeader from "./dashboard-header";
import KanbanColumn from "./kanban-column";
import { Order, groupOrders } from "@/lib/orderUtils";
import { useAbly } from "@/components/ably-provider";
import { Orders as DbOrder, Foods, User, OrderStatus } from "@/generated/prisma/client";

type FullDbOrder = DbOrder & { food: Foods; user: User; isNew?: boolean };

async function fetchCashierOrders(): Promise<FullDbOrder[]> {
  const res = await fetch('/api/cashier/orders');
  if (!res.ok) throw new Error("Failed to fetch orders");
  const orders = await res.json() as FullDbOrder[];
  return orders.map((order) => ({ ...order, createdAt: new Date(order.createdAt) }));
}

async function updateOrderStatus({ batchId, newStatus }: { batchId: string; newStatus: OrderStatus }) {
  const res = await fetch(`/api/cashier/orders/${batchId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newStatus }),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

export default function CashierDashboard() {
  const [activeColumn, setActiveColumn] = useState<"new" | "preparing" | "ready">("new");
  const [isMuted, setIsMuted] = useState(false);
  const queryClient = useQueryClient();
  const ably = useAbly();

  const notificationAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationAudio.current = new Audio('/sounds/notification.wav');
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const { data: dbOrders, isLoading, isError } = useQuery<FullDbOrder[]>({
    queryKey: ['cashierOrders'],
    queryFn: fetchCashierOrders,
  });

  useEffect(() => {
    if (!ably) return;
    const channel = ably.channels.get('orders');

    const handleNewOrder = (message: Ably.Message) => {
      const newOrderBatch: FullDbOrder[] = message.data;
      if (!isMuted && notificationAudio.current) {
        notificationAudio.current.play().catch(e => console.error("Audio play failed:", e));
      }
      if (Notification.permission === "granted") {
        new Notification("New Order Received!", {
          body: `An order from ${newOrderBatch[0]?.user?.name} is waiting.`,
          icon: '/favicon.ico',
        });
      }
      queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) => {
        const withFlash = newOrderBatch.map(o => ({ ...o, isNew: true, createdAt: new Date(o.createdAt) }));
        return [...withFlash, ...oldData];
      });
    };

    const handleOrderUpdate = (message: Ably.Message) => {
      const updatedBatch: FullDbOrder[] = message.data;
      if (updatedBatch.length === 0) return;
      queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) => {
        // We map updates but also filter out statuses that shouldn't be on the board anymore (like Delivered/Returned)
        const updateMap = new Map(updatedBatch.map(item => [item.id, { ...item, createdAt: new Date(item.createdAt) }]));

        // Apply updates
        const updatedList = oldData.map(order => updateMap.get(order.id) || order);

        // Filter out orders that are now Delivered, Returned, or Rejected from the active board view
        // (Assuming the backend sends the update before removing it from the 'active' fetch list)
        return updatedList.filter(o =>
          o.orderStatus !== 'DEILVERED' &&
          o.orderStatus !== 'RETURNED' &&
          o.orderStatus !== 'REJECTED'
        );
      });
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['cashierOrders'] });
    };

    channel.subscribe('new-order', handleNewOrder);
    channel.subscribe('order-update', handleOrderUpdate);

    return () => channel.unsubscribe();
  }, [ably, queryClient, isMuted]);

  // Flash effect for new items
  useEffect(() => {
    const hasNewItems = dbOrders?.some(o => o.isNew);
    if (hasNewItems) {
      const timer = setTimeout(() => {
        queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) =>
          oldData.map(o => ({ ...o, isNew: false }))
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [dbOrders, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      // Optimistic updates are handled via Ably, but we can invalidate here too
      queryClient.invalidateQueries({ queryKey: ['cashierOrders'] });
    },
    onError: (error) => {
      console.error("Failed to update order status:", error);
      alert("Error: Could not update the order.");
    },
  });

  // ✅ Updated to accept specific target status
  const handleUpdateOrderStatus = (batchId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ batchId, newStatus });
  };

  const orders: Order[] = dbOrders ? groupOrders(dbOrders) : [];
  const newOrders = orders.filter((o) => o.status === "new");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
  }
  if (isError) {
    return <div className="flex h-full w-full flex-col items-center justify-center text-destructive"><AlertCircle className="h-12 w-12" /><p className="mt-4 text-lg">Could not load orders.</p></div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <DashboardHeader isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />

      <main className="flex-1 p-4 md:p-6 min-h-0">
        <div className="grid grid-cols-12 gap-4 md:gap-6 h-full">
          <KanbanColumn
            title="New Orders"
            icon={ChefHat}
            count={newOrders.length}
            accentColor="var(--color-destructive)"
            orders={newOrders}
            onUpdateStatus={handleUpdateOrderStatus}
            isActive={activeColumn === "new"}
            onColumnSelect={() => setActiveColumn("new")}
          />
          <KanbanColumn
            title="In Progress"
            icon={Clock}
            count={preparingOrders.length}
            accentColor="var(--color-chart-1)"
            orders={preparingOrders}
            onUpdateStatus={handleUpdateOrderStatus}
            isActive={activeColumn === "preparing"}
            onColumnSelect={() => setActiveColumn("preparing")}
          />
          <KanbanColumn
            title="Ready for Pickup"
            icon={CheckCircle}
            count={readyOrders.length}
            accentColor="var(--color-primary)"
            orders={readyOrders}
            onUpdateStatus={handleUpdateOrderStatus}
            isActive={activeColumn === "ready"}
            onColumnSelect={() => setActiveColumn("ready")}
          />
        </div>
      </main>
    </div>
  );
}
