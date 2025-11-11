"use client"

import { useState, useEffect } from "react"
import type { Order } from "./admin-dashboard"

interface OrderCardProps {
  order: Order
  accentColor: string
  onUpdateStatus: (orderId: string) => void
  isNew?: boolean
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

export default function OrderCard({ order, accentColor, onUpdateStatus, isNew }: OrderCardProps) {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(order.createdAt))

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(order.createdAt))
    }, 1000)

    return () => clearInterval(interval)
  }, [order.createdAt])

  const getButtonText = () => {
    switch (order.status) {
      case "new":
        return "Accept & Print Ticket"
      case "preparing":
        return "Mark as Ready"
      case "ready":
        return null
      default:
        return null
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border-l-4 shadow-sm overflow-hidden transition-all ${
        isNew ? "animate-pulse" : ""
      }`}
      style={{ borderLeftColor: accentColor }}
    >
      {/* Card Header */}
      <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-200">
        <span className="font-bold text-slate-900">{order.id}</span>
        <span className="text-sm text-slate-500">{timeAgo}</span>
      </div>

      {/* Item List */}
      <div className="px-4 py-3 max-h-32 overflow-y-auto space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-slate-700">{item.name}</span>
            </div>
            <span className="font-medium text-slate-900">x{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span className="font-bold text-slate-900">₩{order.totalPrice.toFixed(2)}</span>

        {getButtonText() && (
          <button
            onClick={() => onUpdateStatus(order.id)}
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
