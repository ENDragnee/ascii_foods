//@/src/app/(user_protected)/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Foods, OrderStatus } from "@/generated/prisma/client";
import { Loader2, AlertCircle } from "lucide-react";
import type Ably from 'ably';

import { useAbly } from "@/components/ably-provider";
import { Session } from "@/types";
import NotificationToast from "@/components/notification-toast";

// --- Type Definitions ---
type FullOrderItem = {
  id: string;
  quantity: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  createdAt: string;
  bonoNumber: number | null; // Bono can be null initially
  food: Foods;
};

interface NotificationPayload {
  title: string;
  body: string;
}

// --- API Fetcher Functions ---
async function fetchOrders(): Promise<FullOrderItem[]> {
  const response = await fetch('/api/orders');
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

async function fetchSession(): Promise<{ session: Session | null }> {
  const res = await fetch('/api/session'); // We reuse the session API here
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

// --- Helper Components & Functions ---
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const ably = useAbly();
  const [toast, setToast] = useState<NotificationPayload & { show: boolean }>({ show: false, title: '', body: '' });

  // --- Data Fetching ---
  const { data: orders, isLoading, isError } = useQuery<FullOrderItem[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const { data: sessionData } = useQuery<{ session: Session | null }>({
    queryKey: ['session'],
    queryFn: fetchSession,
  });
  const session = sessionData?.session;

  // --- Effects for Notifications and Real-time Updates ---

  // 1. Effect to request browser notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 2. Effect to subscribe to the user-specific Ably channel
  useEffect(() => {
    // We must have both the Ably client and the user's session ID to subscribe
    if (!ably || !session?.user?.id) return;

    const channelName = `user:${session.user.id}`;
    const channel = ably.channels.get(channelName);

    const handleNotification = (message: Ably.Message) => {
      const payload: NotificationPayload = message.data;
      console.log(`Received notification for user ${session.user.id}:`, payload);

      // A. Show an in-app toast
      setToast({ ...payload, show: true });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);

      // B. Show a browser notification (if permission was granted)
      if (Notification.permission === "granted") {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico', // Optional: path to an icon
        });
      }

      // C. Invalidate the orders query to refetch and show the updated status
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };

    channel.subscribe('notification', handleNotification);

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      channel.unsubscribe('notification', handleNotification);
    };
  }, [ably, session, queryClient]);


  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-gray-500" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">Failed to load orders.</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <NotificationToast
        show={toast.show}
        title={toast.title}
        body={toast.body}
        onClose={() => setToast({ show: false, title: '', body: '' })}
      />
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">My Recent Orders</h1>
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm transition-colors duration-500">
                <div className="relative h-20 w-20 flex-shrink-0">
                  {order.food.imageUrl ? (
                    <Image src={order.food.imageUrl} alt={order.food.name} layout="fill" objectFit="cover" className="rounded-md" />
                  ) : (
                    <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-3xl">🍽️</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h2 className="font-bold text-lg text-gray-900">{order.food.name}</h2>
                  <p className="text-sm text-gray-500">
                    {order.quantity} x {order.food.price} ብር = <span className="font-semibold">{order.totalPrice} ብር</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  {order.bonoNumber && (
                    <p className="text-sm text-gray-700 font-bold mt-1">Bono: #{order.bonoNumber}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700">No Orders Found</h3>
            <p className="text-gray-500 mt-2">You haven not placed any orders yet. Start by adding items to your cart!</p>
          </div>
        )}
      </div>
    </>
  );
}
