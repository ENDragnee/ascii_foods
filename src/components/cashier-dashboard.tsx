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

// --- API Functions for this Page ---
async function fetchCashierOrders(): Promise<FullDbOrder[]> {
  const res = await fetch('/api/cashier/orders');
  if (!res.ok) throw new Error("Failed to fetch orders");
  // ✅ FIX: Explicitly cast the JSON response to the expected type to resolve the 'any' error.
  const orders = await res.json() as FullDbOrder[];
  // Ensure createdAt is a Date object right after fetching
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
  const [isMuted, setIsMuted] = useState(false); // State for the mute toggle
  const queryClient = useQueryClient();
  const ably = useAbly();

  // A ref to hold the audio object to prevent re-creation on re-renders
  const notificationAudio = useRef<HTMLAudioElement | null>(null);

  // --- Initialize Audio and Notification Permissions ---
  useEffect(() => {
    // Create the audio object only on the client side
    notificationAudio.current = new Audio('/sounds/notification.wav');

    // Request notification permission on component mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // --- Data Fetching with React Query ---
  const { data: dbOrders, isLoading, isError } = useQuery<FullDbOrder[]>({
    queryKey: ['cashierOrders'],
    queryFn: fetchCashierOrders,
  });

  // --- Real-time Subscriptions with Ably ---
  useEffect(() => {
    if (!ably) return;
    const channel = ably.channels.get('orders');

    const handleNewOrder = (message: Ably.Message) => {
      const newOrderBatch: FullDbOrder[] = message.data;
      console.log("BEEP! New order received via Ably.", newOrderBatch);

      // 1. Play sound if not muted
      if (!isMuted && notificationAudio.current) {
        notificationAudio.current.play().catch(e => console.error("Audio play failed:", e));
      }

      // 2. Show browser notification
      if (Notification.permission === "granted") {
        new Notification("New Order Received!", {
          body: `A new order from ${newOrderBatch[0]?.user?.name} is waiting for acceptance.`,
          icon: '/favicon.ico', // Optional
        });
      }

      // 3. Update React Query cache to show the new order
      queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) => {
        const withFlash = newOrderBatch.map(o => ({ ...o, isNew: true, createdAt: new Date(o.createdAt) }));
        return [...withFlash, ...oldData];
      });
    };

    const handleOrderUpdate = (message: Ably.Message) => {
      const updatedBatch: FullDbOrder[] = message.data;
      if (updatedBatch.length === 0) return;
      console.log(`Order ${updatedBatch[0].batchId} updated via Ably.`);

      queryClient.setQueryData<FullDbOrder[]>(['cashierOrders'], (oldData = []) => {
        const updateMap = new Map(updatedBatch.map(item => [item.id, { ...item, createdAt: new Date(item.createdAt) }]));
        return oldData.map(order => updateMap.get(order.id) || order);
      });
    };

    channel.subscribe('new-order', handleNewOrder);
    channel.subscribe('order-update', handleOrderUpdate);

    return () => {
      channel.unsubscribe();
    };
  }, [ably, queryClient, isMuted]); // Add isMuted to dependencies

  // --- Effect to remove the "isNew" flash animation ---
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

  // --- Mutation for updating order status ---
  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onError: (error) => {
      console.error("Failed to update order status:", error);
      alert("Error: Could not update the order.");
    },
  });

  const handleUpdateOrderStatus = (batchId: string, currentStatus: "new" | "preparing" | "ready") => {
    let newStatus: OrderStatus;
    if (currentStatus === "new") newStatus = "ACCEPTED";
    else if (currentStatus === "preparing") newStatus = "COMPLETED";
    else return;
    updateStatusMutation.mutate({ batchId, newStatus });
  };

  // --- Data Transformation for Display ---
  // ✅ FIX: The check now correctly passes dbOrders to groupOrders, resolving the type error.
  const orders: Order[] = dbOrders ? groupOrders(dbOrders) : [];
  const newOrders = orders.filter((o) => o.status === "new");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-slate-500" /></div>;
  }
  if (isError) {
    return <div className="flex h-screen w-full flex-col items-center justify-center text-red-600"><AlertCircle className="h-12 w-12" /><p className="mt-4 text-lg">Could not load orders.</p></div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(45deg,#000_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none"></div>
      {/* Pass the mute state and toggle function to the header */}
      <DashboardHeader isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
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
