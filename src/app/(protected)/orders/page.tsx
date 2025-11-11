"use client"

import { useState, useEffect } from "react"
import { MenuHeader } from "@/components/menu-header"
import { OrderTracker } from "@/components/order-tracker"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import Link from "next/link"

interface Order {
  items: any[]
  subtotal: number
  tax: number
  total: number
  orderNumber: string
  timestamp: string
}

export default function OrdersPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [orderStatus, setOrderStatus] = useState<"confirmed" | "preparing" | "ready" | "completed">("confirmed")

  useEffect(() => {
    // Get order from localStorage
    const savedOrder = localStorage.getItem("lastOrder")
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder)
      setOrder(parsedOrder)

      // Simulate order progress
      const timer1 = setTimeout(() => setOrderStatus("preparing"), 2000)
      const timer2 = setTimeout(() => setOrderStatus("ready"), 6000)
      const timer3 = setTimeout(() => setOrderStatus("completed"), 10000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [])

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <MenuHeader />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <h2 className="text-2xl font-bold">No Active Orders</h2>
            <p className="text-muted-foreground">You don't have any orders to track</p>
            <Link href="/menu">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Ordering</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const orderDate = new Date(order.timestamp)

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Order Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Order Status</h1>
          <p className="text-lg text-muted-foreground">Order #{order.orderNumber}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status Tracker */}
          <div className="lg:col-span-2">
            <OrderTracker status={orderStatus} />

            {/* Estimated Time */}
            <div className="mt-12 bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-lg">Estimated Ready Time</h3>
              </div>
              <p className="text-3xl font-bold text-primary">
                {orderStatus === "completed" ? "Ready for pickup!" : "10-12 minutes"}
              </p>
              {orderStatus !== "completed" && (
                <p className="text-muted-foreground mt-2">Your order will be ready soon. Please wait at the counter.</p>
              )}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto border-b border-border pb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.size && <p className="text-xs text-muted-foreground">{item.size}</p>}
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold">${order.tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Order Date */}
              <div className="text-xs text-muted-foreground pt-2">
                Ordered on {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
              </div>
            </div>

            {/* New Order Button */}
            {orderStatus === "completed" && (
              <Link href="/menu" className="block mt-4">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Place New Order
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
