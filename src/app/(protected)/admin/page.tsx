"use client"

import { useState, useRef } from "react"
import AdminPage from "@/components/admin-home-page"
import MenuPublish from "@/components/menu-publish"
import Notification from "@/components/notification"
import CashierDashboard from "@/components/cashier-dashboard"

export default function Page() {
  const [currentPage, setCurrentPage] = useState<"home" | "orders" | "menu">("home")
  const [notification, setNotification] = useState<{ show: boolean; message: string; orderId?: string }>({
    show: false,
    message: "",
  })
  const audioRef = useRef<HTMLAudioElement>(null)

  // Trigger notification from orders page
  const showNotification = (orderId: string, itemCount: number) => {
    setNotification({
      show: true,
      message: `New order received! ${itemCount} items - Order #${orderId}`,
      orderId,
    })

    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log("Audio autoplay prevented")
      })
    }

    // Hide after 5 seconds
    setTimeout(() => setNotification({ show: false, message: "" }), 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 border-b border-blue-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🍽️</div>
                <div>
                  <h1 className="text-2xl font-black text-white">RestaurantHub</h1>
                  <p className="text-blue-100 text-xs font-medium">Smart Order Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage("home")}
                className={`px-4 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 ${currentPage === "home"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "text-white hover:bg-white/20 backdrop-blur-sm"
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage("orders")}
                className={`px-4 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 ${currentPage === "orders"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "text-white hover:bg-white/20 backdrop-blur-sm"
                  }`}
              >
                Orders
              </button>
              <button
                onClick={() => setCurrentPage("menu")}
                className={`px-4 py-2.5 rounded-lg font-semibold transition-all transform hover:scale-105 ${currentPage === "menu"
                  ? "bg-white text-blue-600 shadow-lg"
                  : "text-white hover:bg-white/20 backdrop-blur-sm"
                  }`}
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </nav>

      {notification.show && <Notification message={notification.message} orderId={notification.orderId} />}

      {/* Hidden audio element for notification sound */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
      />

      {currentPage === "home" ? (
        <AdminPage />
      ) : currentPage === "orders" ? (
        <CashierDashboard onNewOrder={showNotification} />
      ) : (
        <MenuPublish />
      )}
    </div>
  )
}
