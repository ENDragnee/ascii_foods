"use client"

import { useState } from "react"
import RestaurantHero from "@/components/restaurant-hero"
import MenuExperience from "@/components/menu-experience"
import OrderTracker from "@/components/order-tracker"

export default function Home() {
  const [currentView, setCurrentView] = useState("hero")
  const [order, setOrder] = useState(null)

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1f17 100%)" }}>
      {currentView === "hero" && <RestaurantHero onEnter={() => setCurrentView("menu")} />}
      {currentView === "menu" && (
        <MenuExperience
          onOrder={(newOrder) => {
            setOrder(newOrder)
            setCurrentView("tracker")
          }}
          onBack={() => setCurrentView("hero")}
        />
      )}
      {currentView === "tracker" && order && <OrderTracker order={order} onNewOrder={() => setCurrentView("menu")} />}
    </div>
  )
}
