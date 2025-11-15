"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Foods, OrderStatus } from "@/generated/prisma/client";
import { Loader2, AlertCircle, Search, X } from "lucide-react";
import type Ably from 'ably';

import { useAbly } from "@/components/ably-provider";
import { Session } from "@/types";
import NotificationToast from "@/components/notification-toast";
import { PaginationControls } from "@/components/pagination-controls";

const ITEMS_PER_PAGE = 6;

type FullOrderItem = {
  id: string;
  quantity: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  createdAt: string;
  bonoNumber: number | null;
  food: Foods;
};

interface NotificationPayload {
  title: string;
  body: string;
}

// --- API Fetcher Functions ---
async function fetchOrders(filter: 'today' | 'all'): Promise<FullOrderItem[]> {
  let url = '/api/orders';
  if (filter === 'today') {
    const today = new Date();
    const dateString = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    url += `?date=${dateString}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

async function fetchSession(): Promise<{ session: Session | null }> {
  const res = await fetch('/api/session');
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

// --- Themed Status Component ---
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles = useMemo(() => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500';
      case 'ACCEPTED': return 'bg-blue-500/10 text-blue-500';
      case 'COMPLETED': return 'bg-green-500/10 text-green-500';
      case 'REJECTED': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  }, [status]);
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles}`}>{status}</span>;
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const ably = useAbly();

  const [toast, setToast] = useState<NotificationPayload & { show: boolean }>({ show: false, title: '', body: '' });
  const [filter, setFilter] = useState<'today' | 'all'>('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // ✅ NEW: State for search

  // --- Data Fetching ---
  const { data: orders = [], isLoading, isError } = useQuery<FullOrderItem[]>({
    queryKey: ['orders', filter],
    queryFn: () => fetchOrders(filter),
  });

  const { data: sessionData } = useQuery<{ session: Session | null }>({ queryKey: ['session'], queryFn: fetchSession });
  const session = sessionData?.session;

  // --- Effects ---
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!ably || !session?.user?.id) return;
    const channelName = `user:${session.user.id}`;
    const channel = ably.channels.get(channelName);
    const handleNotification = (message: Ably.Message) => {
      const payload: NotificationPayload = message.data;
      setToast({ ...payload, show: true });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
      if (Notification.permission === "granted") new Notification(payload.title, { body: payload.body, icon: '/favicon.ico' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };
    channel.subscribe('notification', handleNotification);
    return () => channel.unsubscribe('notification', handleNotification);
  }, [ably, session, queryClient]);

  // --- Search, Filtering, and Pagination Logic ---
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) {
      return orders;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return orders.filter(order =>
      order.food.name.toLowerCase().includes(lowercasedQuery) ||
      order.bonoNumber?.toString().includes(lowercasedQuery)
    );
  }, [orders, searchQuery]);

  const totalSpent = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  }, [filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
  }
  if (isError) {
    return <div className="flex h-full w-full flex-col items-center justify-center text-destructive"><AlertCircle className="h-12 w-12" /><p className="mt-4 text-lg">Failed to load orders.</p></div>;
  }

  return (
    <>
      <NotificationToast show={toast.show} title={toast.title} body={toast.body} onClose={() => setToast({ show: false, title: '', body: '' })} />
      <div className="flex h-full flex-col bg-background">
        {/* Header with Title, Stats, Search, and Filters */}
        <header className="flex-shrink-0 border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">My Orders</h1>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
              <button onClick={() => { setFilter('today'); setCurrentPage(1); }} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'today' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Today</button>
              <button onClick={() => { setFilter('all'); setCurrentPage(1); }} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All History</button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4">
            {/* Total Spent */}
            <div>
              <p className="text-sm text-muted-foreground">{filter === 'today' ? 'Total Spent Today' : 'Total from History'}</p>
              <p className="text-2xl font-bold text-primary">{totalSpent.toFixed(2)} ETB</p>
            </div>
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by food or bono..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </header>

        {/* Main Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {paginatedOrders.length > 0 ? (
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    {order.food.imageUrl ? (
                      <Image src={order.food.imageUrl} alt={order.food.name} layout="fill" objectFit="cover" className="rounded-md" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-3xl text-muted-foreground">🍽️</div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h2 className="font-bold text-lg text-foreground">{order.food.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} x {order.food.price.toFixed(2)} ETB = <span className="font-semibold text-foreground">{order.totalPrice.toFixed(2)} ETB</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.orderStatus} />
                    {order.bonoNumber && (
                      <p className="mt-1 text-sm font-bold text-foreground">Bono: #{order.bonoNumber}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg bg-card text-center">
              <h3 className="text-xl font-semibold text-foreground">
                {searchQuery ? "No Orders Match Your Search" : "No Orders Found"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery ? "Try a different search term." : `You haven't placed any orders ${filter === 'today' ? 'today' : 'yet'}.`}
              </p>
            </div>
          )}
        </main>

        {/* Footer (Pagination) */}
        <footer className="flex-shrink-0 border-t border-border bg-card">
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </footer>
      </div>
    </>
  );
}
