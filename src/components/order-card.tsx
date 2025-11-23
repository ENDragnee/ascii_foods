"use client"

import { useState, useEffect } from "react"
import type { Order, OrderItem } from "@/lib/orderUtils"
import Image from "next/image"
import { OrderStatus } from "@/generated/prisma/client"

interface OrderCardProps {
  order: Order
  accentColor: string
  // ✅ Updated signature
  onUpdateStatus: (status: OrderStatus) => void
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(order.createdAt))
    }, 30000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  // ✅ NEW: Logic to render different buttons based on status
  const renderActionButtons = () => {
    if (order.status === "new") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateStatus('REJECTED'); }}
            className="rounded-md border border-destructive bg-transparent px-3 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            Reject
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateStatus('ACCEPTED'); }}
            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      );
    }

    if (order.status === "preparing") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onUpdateStatus('COMPLETED'); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Mark as Ready
        </button>
      );
    }

    if (order.status === "ready") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateStatus('RETURNED'); }}
            className="rounded-md border border-orange-500 text-orange-500 bg-transparent px-3 py-2 text-sm font-semibold transition-colors hover:bg-orange-500/10"
          >
            Returned
          </button>
          <button
            // Note: Using 'DEILVERED' to match the provided schema typo in previous prompts
            onClick={(e) => { e.stopPropagation(); onUpdateStatus('DEILVERED'); }}
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            Delivered
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border-l-4 bg-card shadow-sm transition-all duration-300 ${isNew ? "animate-flash" : "border-transparent"}`}
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{order.userName}</span>
          <span className="text-xs font-medium text-muted-foreground">{timeAgo}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-muted-foreground">{order.type}</span>
        </div>
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

      <div className="max-h-32 space-y-2 overflow-y-auto px-4 py-3">
        {order.items.map((item) => <OrderItemRow key={item.id} item={item} />)}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3">
        <span className="text-lg font-bold text-foreground">{order.totalPrice.toFixed(2)} ETB</span>

        {/* ✅ Render specific buttons */}
        {renderActionButtons()}
      </div>
    </div>
  )
}
