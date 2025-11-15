"use client"

import { Volume2, VolumeX } from "lucide-react"

interface DashboardHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function DashboardHeader({ isMuted, onToggleMute }: DashboardHeaderProps) {
  return (
    // ✅ STYLE: Uses theme variables for background, border, and text colors.
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Order Dashboard</h1>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Live</span>
          </div>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={!isMuted ? "Mute notifications" : "Unmute notifications"}
          >
            {!isMuted ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
