"use client"

import { X, AlertCircle } from "lucide-react"
import { useState } from "react"

interface NotificationProps {
  message: string
  orderId?: string
}

export default function Notification({ message, orderId }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-full duration-300">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-4 max-w-sm border border-red-400">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{message}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
