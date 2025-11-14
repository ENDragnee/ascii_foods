"use client"

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChefHat, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type Ably from "ably"; // Import the Ably type for correct type annotation.

import DashboardHeader from "./dashboard-header";
import KanbanColumn from "./kanban-column";
import { Order, groupOrders } from "@/lib/orderUtils";
import { useAbly } from "@/components/ably-provider";
import { Orders as DbOrder, Foods, User, OrderStatus } from "@/generated/prisma/client";

type FullDbOrder = DbOrder & { food: Foods; user: User; isNew?: boolean };

// --- API Functions for this Page ---
async function fetchCashierOrders(): Promise<FullDbOrder[]> {
  const res = await fetch('/api/cashier/orders');
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
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
  const queryClient = useQueryClient();
  const ably = useAbly();

  // --- Data Fetching with React Query ---
  const { data: dbOrders, isLoading, isError } = useQuery<FullDbOrder[]>({
    queryKey: ['cashierOrders'],
    queryFn: fetchCashierOrders,
  });

  // --- Real-time Subscriptions with Ably ---
  useEffect(() => {
    if (!ably) return;
    const channel = ably.channels.get('orders');

    // Listener for new orders placed by customers
    const handleNewOrder = (message: Ably.Message) => { // ✅ FIX: Correct type is Ably.Message
      const newOrderBatch: FullDbOrder[] = message.data;
      console.log("BEEP! New order received via Ably.", newOrderBatch);

      queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) => {
        const withFlash = newOrderBatch.map(o => ({ ...o, isNew: true }));
        // Add new orders to the top of the list
        return [...withFlash, ...oldData];
      });
    };

    // Listener for when an order's status is updated (by this or another cashier)
    const handleOrderUpdate = (message: Ably.Message) => { // ✅ FIX: Correct type is Ably.Message
      const updatedBatch: FullDbOrder[] = message.data;
      if (updatedBatch.length === 0) return;
      console.log(`Order ${updatedBatch[0].batchId} updated via Ably.`);

      queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) => {
        // Create a map of the updated items for efficient lookup
        const updateMap = new Map(updatedBatch.map(item => [item.id, item]));
        // Replace the old items with the updated ones
        return oldData.map(order => updateMap.get(order.id) || order);
      });
    };

    channel.subscribe('new-order', handleNewOrder);
    channel.subscribe('order-update', handleOrderUpdate);

    return () => {
      channel.unsubscribe();
    };
  }, [ably, queryClient]);

  // --- Effect to remove the "isNew" flash animation after a delay ---
  useEffect(() => {
    const hasNewItems = dbOrders?.some(o => o.isNew);
    if (hasNewItems) {
      const timer = setTimeout(() => {
        queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) =>
          oldData.map(o => ({ ...o, isNew: false }))
        );
      }, 1500); // Animation lasts 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [dbOrders, queryClient]);

  // --- Mutation for updating order status when a cashier takes action ---
  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onError: (error) => {
      console.error("Failed to update order status:", error);
      // In a real app, show a toast notification
      alert("Error: Could not update the order.");
    },
    // We don't need onSuccess because Ably will send the update back to us
  });

  const handleUpdateOrderStatus = (batchId: string, currentStatus: "new" | "preparing" | "ready") => {
    let newStatus: OrderStatus;
    if (currentStatus === "new") {
      newStatus = "ACCEPTED";
    } else if (currentStatus === "preparing") {
      newStatus = "COMPLETED";
    } else {
      return; // Cannot advance from "Ready" status from this UI
    }
    updateStatusMutation.mutate({ batchId, newStatus });
  };

  // --- Data Transformation and Filtering for Display ---
  const orders: Order[] = dbOrders ? groupOrders(dbOrders) : [];
  const newOrders = orders.filter((o) => o.status === "new");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  // --- Render Logic with Loading and Error States ---
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-slate-500" /></div>;
  }
  if (isError) {
    return <div className="flex h-screen w-full flex-col items-center justify-center text-red-600"><AlertCircle className="h-12 w-12" /><p className="mt-4 text-lg">Could not load orders.</p></div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(45deg,#000_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none"></div>
      <DashboardHeader />
      <main className="p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Order Management</h2>
            <p className="text-slate-600 text-sm mt-2">Click on any column to expand and view details</p>
          </div>
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            <KanbanColumn
              title="New Orders"
              icon={ChefHat}
              count={newOrders.length}
              accentColor="#db1020"
              orders={newOrders}
              onUpdateStatus={handleUpdateOrderStatus}
              isActive={activeColumn === "new"}
              onColumnSelect={() => setActiveColumn("new")}
            />
            <KanbanColumn
              title="In Progress"
              icon={Clock}
              count={preparingOrders.length}
              accentColor="#ffd700"
              orders={preparingOrders}
              onUpdateStatus={handleUpdateOrderStatus}
              isActive={activeColumn === "preparing"}
              onColumnSelect={() => setActiveColumn("preparing")}
            />
            <KanbanColumn
              title="Ready for Pickup"
              icon={CheckCircle}
              count={readyOrders.length}
              accentColor="#27742d"
              orders={readyOrders}
              onUpdateStatus={handleUpdateOrderStatus}
              isActive={activeColumn === "ready"}
              onColumnSelect={() => setActiveColumn("ready")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
