"use client"

import { useState } from "react"

interface MenuCardProps {
  item: any
  isInCart: boolean
  quantity: number
  onAdd: () => void
  onRemove: () => void
}

export default function MenuCard({ item, isInCart, quantity, onAdd, onRemove }: MenuCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer transition-all duration-300 transform"
      style={{
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
      }}
    >
      <div
        className="relative p-6 rounded-2xl backdrop-blur-sm overflow-hidden"
        style={{
          background: isInCart
            ? "linear-gradient(135deg, rgba(255, 97, 29, 0.3) 0%, rgba(227, 41, 41, 0.2) 100%)"
            : "linear-gradient(135deg, rgba(255, 97, 29, 0.1) 0%, rgba(255, 184, 14, 0.05) 100%)",
          border: `2px solid ${isInCart ? "#ff611d" : "rgba(255, 97, 29, 0.3)"}`,
          boxShadow: isHovered ? "0 20px 40px rgba(255, 97, 29, 0.3)" : "0 5px 15px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Emoji display */}
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.emoji}</div>

        {/* Item name */}
        <h3 className="text-xl font-bold mb-2" style={{ color: "#ffb80e" }}>
          {item.name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold" style={{ color: "#ff611d" }}>
            {item.price} ብር
          </p>
        </div>

        {/* Cart controls */}
        <div className="flex gap-2">
          {!isInCart ? (
            <button
              onClick={onAdd}
              className="flex-1 py-3 px-4 rounded-lg font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #ff611d 0%, #e32929 100%)",
                color: "white",
              }}
            >
              ጨምር
            </button>
          ) : (
            <div
              className="flex-1 flex items-center justify-between p-3 rounded-lg"
              style={{ background: "rgba(255, 97, 29, 0.2)", border: "1px solid #ff611d" }}
            >
              <button onClick={onRemove} className="text-xl font-bold" style={{ color: "#ffb80e" }}>
                −
              </button>
              <span className="font-bold" style={{ color: "#ffb80e" }}>
                {quantity}
              </span>
              <button onClick={onAdd} className="text-xl font-bold" style={{ color: "#ffb80e" }}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
