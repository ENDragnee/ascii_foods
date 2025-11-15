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

const formatTimeAgo = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return 'Invalid date';
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

const OrderItemRow = ({ item }: { item: OrderItem }) => (
  <div key={item.id} className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8 flex-shrink-0 bg-muted rounded-md">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.foodName} layout="fill" objectFit="cover" className="rounded-md" />
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

  useEffect(() => {
    const interval = setInterval(() => setTimeAgo(formatTimeAgo(order.createdAt)), 30000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const getButtonText = () => {
    if (order.status === "new") return "Accept Order";
    if (order.status === "preparing") return "Mark as Ready";
    return null;
  }

  return (
    // ✅ STYLE: Uses theme variables for consistent styling.
    <div
      className={`bg-card rounded-lg border-l-4 shadow-sm overflow-hidden transition-all duration-300 ${isNew ? "animate-flash" : ""}`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className="px-4 py-3 bg-muted/50 flex items-center justify-between border-b border-border">
        <div>
          <span className="font-bold text-foreground">{order.userName}</span>
          {order.bonoNumber && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: accentColor }}>
              Bono #{order.bonoNumber}
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground font-medium">{timeAgo}</span>
      </div>

      <div className="px-4 py-3 max-h-32 overflow-y-auto space-y-2">
        {order.items.map((item) => <OrderItemRow key={item.id} item={item} />)}
      </div>

      <div className="px-4 py-3 bg-muted/50 border-t border-border flex items-center justify-between">
        <span className="font-bold text-foreground">{order.totalPrice.toFixed(2)} ETB</span>
        {getButtonText() && (
          <button
            onClick={onUpdateStatus}
            className="px-3 py-1.5 rounded text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
  )
}
