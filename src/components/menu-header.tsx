"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"

interface MenuHeaderProps {
  cartCount?: number
}

export function MenuHeader({ cartCount = 0 }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <span className="text-white font-bold text-lg">FF</span>
          </div>
          <h1 className="text-xl font-bold text-primary">FastFood</h1>
        </Link>

        <Link href="/cart">
          <button className="relative p-2 hover:bg-muted rounded-lg transition">
            <ShoppingCart className="w-6 h-6 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </Link>
      </div>
    </header>
  )
}
