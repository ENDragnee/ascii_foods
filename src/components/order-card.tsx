"use client"

import { useState, useEffect } from "react"
import type { Order, OrderItem } from "@/lib/orderUtils"
import Image from "next/image"

interface OrderCardProps {
  order: Order
  accentColor: string
  onUpdateStatus: () => void
  isNew?: boolean
}

// Helper function to format the time since the order was created.
const formatTimeAgo = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 'Invalid date';
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// A small, themed sub-component for rendering each item in the list.
const OrderItemRow = ({ item }: { item: OrderItem }) => (
  <div key={item.id} className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8 flex-shrink-0 rounded-md bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.foodName}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg text-muted-foreground">🍽️</span>
        )}
      </div>
      <span className="text-foreground">{item.foodName}</span>
    </div>
    <span className="font-medium text-foreground">x{item.quantity}</span>
  </div>
);

export default function OrderCard({ order, accentColor, onUpdateStatus, isNew }: OrderCardProps) {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(order.createdAt));

  // This effect updates the "time ago" string every 30 seconds for better performance.
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(order.createdAt))
    }, 30000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const getButtonText = () => {
    if (order.status === "new") return "Accept Order";
    if (order.status === "preparing") return "Mark as Ready";
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border-l-4 bg-card shadow-sm transition-all duration-300 ${isNew ? "animate-flash" : "border-transparent"}`}
      style={{ borderLeftColor: accentColor }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{order.userName}</span>
          <span className="text-xs font-medium text-muted-foreground">{timeAgo}</span>
        </div>
        {/* The Bono number now appears for 'preparing' and 'ready' orders */}
        {(order.status === 'preparing' || order.status === 'ready') && order.bonoNumber && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Bono</p>
            <p
              className="text-lg font-bold"
              style={{ color: accentColor }}
            >
              #{order.bonoNumber}
            </p>
          </div>
        )}
      </div>

      {/* Item List */}
      <div className="max-h-32 space-y-2 overflow-y-auto px-4 py-3">
        {order.items.map((item) => <OrderItemRow key={item.id} item={item} />)}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3">
        <span className="text-lg font-bold text-foreground">{order.totalPrice.toFixed(2)} ETB</span>

        {getButtonText() && (
          // ✅ FIX: The button is now fully themed using theme variables.
          <button
            onClick={onUpdateStatus}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  )
}
