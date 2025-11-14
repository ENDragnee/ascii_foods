"use client"

import { useState, useEffect } from "react"
import type { Order, OrderItem } from "@/lib/orderUtils"
import Image from "next/image"

interface OrderCardProps {
  order: Order
  accentColor: string
  // ✅ FIX: The prop is now simpler. It doesn't need to pass any arguments.
  // The parent component (`KanbanColumn`) already knows the order details.
  onUpdateStatus: () => void
  isNew?: boolean
}

// Helper function to format the time since the order was created.
const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  // Ensure 'date' is a valid Date object before calling getTime()
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

// A small sub-component for rendering each item in the list
const OrderItemRow = ({ item }: { item: OrderItem }) => (
  <div key={item.id} className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-3">
      <div className="relative h-8 w-8 flex-shrink-0 bg-slate-100 rounded-md">
        {/* ✅ FIX: Correctly handle optional images and use next/image */}
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.foodName}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg">🍽️</span>
        )}
      </div>
      <span className="text-slate-700">{item.foodName}</span>
    </div>
    <span className="font-medium text-slate-900">x{item.quantity}</span>
  </div>
);


export default function OrderCard({ order, accentColor, onUpdateStatus, isNew }: OrderCardProps) {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(order.createdAt))

  // This effect updates the "time ago" string every 30 seconds for performance.
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(order.createdAt))
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval)
  }, [order.createdAt])

  const getButtonText = () => {
    switch (order.status) {
      case "new":
        return "Accept Order"
      case "preparing":
        return "Mark as Ready"
      case "ready":
        return null // No button for the "Ready" column
      default:
        return null
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border-l-4 shadow-sm overflow-hidden transition-all duration-300 ${isNew ? "animate-flash" : "" // ✅ FIX: Use the new flash animation
        }`}
      style={{ borderLeftColor: accentColor }}
    >
      {/* Card Header */}
      <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-200">
        <div>
          {/* ✅ FIX: Display the user's name and the Bono number (if it exists) */}
          <span className="font-bold text-slate-900">{order.userName}</span>
          {order.bonoNumber && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: accentColor }}
            >
              Bono #{order.bonoNumber}
            </span>
          )}
        </div>
        <span className="text-sm text-slate-500 font-medium">{timeAgo}</span>
      </div>

      {/* Item List */}
      <div className="px-4 py-3 max-h-32 overflow-y-auto space-y-2">
        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span className="font-bold text-slate-900">{order.totalPrice.toFixed(2)} ETB</span>

        {getButtonText() && (
          <button
            onClick={onUpdateStatus} // ✅ FIX: Simplified onClick handler
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
