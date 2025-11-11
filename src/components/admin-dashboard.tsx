"use client"

import { useState, useEffect } from "react"
import DashboardHeader from "./dashboard-header"
import KanbanColumn from "./kanban-column"
import { ChefHat, Clock, CheckCircle } from "lucide-react"

export interface OrderItem {
  id: string
  emoji: string
  name: string
  quantity: number
}

export interface Order {
  id: string
  status: "new" | "preparing" | "ready"
  items: OrderItem[]
  totalPrice: number
  createdAt: Date
  isNew?: boolean
}

const mockOrderItems = [
  { id: "1", emoji: "🍕", name: "Margherita Pizza", quantity: 1 },
  { id: "2", emoji: "🍔", name: "Classic Burger", quantity: 2 },
  { id: "3", emoji: "🍟", name: "French Fries", quantity: 1 },
  { id: "4", emoji: "🥤", name: "Coke", quantity: 3 },
  { id: "5", emoji: "🍝", name: "Pasta Carbonara", quantity: 1 },
  { id: "6", emoji: "🥗", name: "Caesar Salad", quantity: 2 },
]

const generateMockOrder = (status: "new" | "preparing" | "ready"): Order => {
  const itemCount = Math.floor(Math.random() * 4) + 1
  const selectedItems = mockOrderItems.sort(() => Math.random() - 0.5).slice(0, itemCount)
  const totalPrice = Math.floor(Math.random() * 8000 + 3000) / 100

  return {
    id: `ORD-${Date.now()}`,
    status,
    items: selectedItems,
    totalPrice,
    createdAt: new Date(),
    isNew: true,
  }
}

interface AdminDashboardProps {
  onNewOrder?: (orderId: string, itemCount: number) => void
}

export default function AdminDashboard({ onNewOrder }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([
    generateMockOrder("new"),
    generateMockOrder("new"),
    generateMockOrder("preparing"),
    generateMockOrder("preparing"),
    generateMockOrder("ready"),
  ])

  const [activeColumn, setActiveColumn] = useState<"new" | "preparing" | "ready">("new")

  useEffect(() => {
    const interval = setInterval(
      () => {
        const newOrder = generateMockOrder("new")
        setOrders((prev) => [newOrder, ...prev])
        console.log("BEEP! New order received.")

        // Trigger notification
        if (onNewOrder) {
          onNewOrder(newOrder.id, newOrder.items.length)
        }
      },
      Math.random() * 5000 + 15000,
    )

    return () => clearInterval(interval)
  }, [onNewOrder])

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders((prev) => prev.map((order) => ({ ...order, isNew: false })))
    }, 1500)

    return () => clearTimeout(timer)
  }, [orders[0]?.id])

  const handleUpdateOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          if (order.status === "new") {
            return { ...order, status: "preparing" }
          } else if (order.status === "preparing") {
            return { ...order, status: "ready" }
          }
        }
        return order
      }),
    )
  }

  const newOrders = orders.filter((o) => o.status === "new")
  const preparingOrders = orders.filter((o) => o.status === "preparing")
  const readyOrders = orders.filter((o) => o.status === "ready")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(45deg,#000_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

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
  )
}
