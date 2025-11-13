"use client"

import { useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

export default function DashboardHeader() {
  const [soundEnabled, setSoundEnabled] = useState(true)

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">KK yellow - Order Dashboard</h1>

        <div className="flex items-center gap-6">
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-slate-600">Live Orders</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-slate-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
