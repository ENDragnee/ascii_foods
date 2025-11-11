"use client"

import { useState } from "react"

interface MenuCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    emoji: string;
  };
  isInCart: boolean
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

/**
 * A compact card component to display a single menu item.
 * Optimized for a 2-column mobile layout.
 */
export default function MenuCard({ item, isInCart, quantity, onAdd, onRemove }: MenuCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer transition-all duration-300 transform"
      style={{
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
      }}
    >
      <div
        className="relative p-4 rounded-2xl overflow-hidden transition-all duration-300 space-y-3 flex flex-col justify-between h-full"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          border: `2px solid ${isInCart ? "#db1020" : "transparent"}`,
          boxShadow: isHovered ? "0 12px 24px rgba(219, 16, 32, 0.15)" : "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Top section: Emoji, Name, Price */}
        <div className="text-center">
            <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
            <h3 className="text-base font-bold leading-tight" style={{ color: "#27742d" }}>
                {item.name}
            </h3>
            <p className="text-lg font-bold mt-1" style={{ color: "#db1020" }}>
                {item.price} ብር
            </p>
        </div>

        {/* Bottom section: Cart Controls */}
        <div className="mt-2">
          {!isInCart ? (
            <button
              onClick={onAdd}
              className="w-full py-2 px-3 rounded-lg font-bold text-sm text-white transition-all transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #ffd700 0%, #db1020 100%)",
              }}
            >
              ጨምር
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-between p-1 rounded-lg"
              style={{ background: "rgba(219, 16, 32, 0.1)" }}
            >
              <button onClick={onRemove} className="px-2 text-xl font-bold rounded-md transition-colors" style={{ color: "#db1020" }}>
                −
              </button>
              <span className="font-bold text-base" style={{ color: "#db1020" }}>
                {quantity}
              </span>
              <button onClick={onAdd} className="px-2 text-xl font-bold rounded-md transition-colors" style={{ color: "#27742d" }}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}