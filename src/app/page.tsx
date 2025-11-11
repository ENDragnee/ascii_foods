"use client"

import RestaurantHero from "@/components/restaurant-hero"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1f17 100%)" }}>
      <RestaurantHero onEnter={() => router.push("/menu")} />
    </div>
  )
}
