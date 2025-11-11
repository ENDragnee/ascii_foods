"use client"

import MenuExperience from "@/components/menu-experience"
import { useRouter } from "next/navigation"

export default function Menu() {
  const router = useRouter();

  const onBackAction = () => {
    router.push("/")
  }

  const onOrderAction = () => {
    router.push("/orders")
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1f17 100%)" }}>
      <MenuExperience onBackAction={onBackAction} onOrderAction={onOrderAction} />
    </div>
  )
}
