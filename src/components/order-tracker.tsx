"use client"

import { useState, useEffect } from "react"

const STATUSES = [
  { key: "confirmed", label: "ተጋብዟል", icon: "✓", description: "ትዕዛዝዎ ተሰናበተ" },
  { key: "preparing", label: "እየዘጋ", icon: "👨‍🍳", description: "ሙቀትን በማከልኩ ላይ" },
  { key: "ready", label: "ዝግጁ", icon: "🔔", description: "ውሰድ!" },
  { key: "completed", label: "ተጠናቀቀ", icon: "🎉", description: "ተስኖ ይሁን!" },
]

export function OrderTracker({ order, onNewOrder }: { order: any; onNewOrder: () => void }) {
  const [currentStatus, setCurrentStatus] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(order.eta * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus((prev) => {
        if (prev < STATUSES.length - 1) {
          return prev + 1
        }
        return prev
      })
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Order number */}
        <div className="text-center mb-8">
          <p className="text-sm opacity-70 mb-2">ትዕዛዝ ቁጥር</p>
          <h1 className="text-4xl font-bold" style={{ color: "#ffb80e" }}>
            {order.id}
          </h1>
        </div>

        {/* Main content */}
        <div
          className="p-8 rounded-3xl backdrop-blur-md mb-8"
          style={{
            background: "linear-gradient(135deg, rgba(255, 97, 29, 0.15) 0%, rgba(227, 41, 41, 0.1) 100%)",
            border: "2px solid rgba(255, 97, 29, 0.3)",
          }}
        >
          {/* Large status emoji/icon */}
          <div className="text-7xl text-center mb-6 animate-pulse">{STATUSES[currentStatus].icon}</div>

          {/* Status label */}
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: "#ff611d" }}>
            {STATUSES[currentStatus].label}
          </h2>

          <p className="text-center opacity-80 mb-8">{STATUSES[currentStatus].description}</p>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between gap-2">
              {STATUSES.map((status, idx) => (
                <div
                  key={status.key}
                  className="flex-1 h-2 rounded-full transition-all"
                  style={{
                    background: idx <= currentStatus ? "#ff611d" : "rgba(255, 97, 29, 0.2)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          {currentStatus < STATUSES.length - 1 && (
            <div className="text-center">
              <p className="text-sm opacity-70 mb-2">ወደ ተስተካከለ ነው</p>
              <p className="text-4xl font-bold" style={{ color: "#ffb80e" }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </p>
            </div>
          )}

          {/* Order items */}
          <div className="mt-8 pt-8 border-t border-orange-500 border-opacity-30">
            <p className="text-sm opacity-70 mb-4">ምግብ</p>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <span>{item.name}</span>
                  </span>
                  <span className="font-semibold" style={{ color: "#ffb80e" }}>
                    ×{item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order complete message */}
        {currentStatus === STATUSES.length - 1 && (
          <div className="text-center mb-8 p-6 rounded-2xl" style={{ background: "rgba(255, 184, 14, 0.1)" }}>
            <p className="text-lg font-bold mb-4" style={{ color: "#ffb80e" }}>
              ምግብዎ ዝግጁ ነው! 🎉
            </p>
            <p className="text-sm opacity-80">ሰላም ነው! ምግብዎን ውሰዱ።</p>
          </div>
        )}

        {/* New order button */}
        {currentStatus === STATUSES.length - 1 && (
          <button
            onClick={onNewOrder}
            className="w-full py-4 rounded-full font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #ffb80e 0%, #ff611d 100%)",
              color: "#1a1410",
            }}
          >
            ሌላ ትዕዛዝ መደርደር? 🍽️
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderTracker
