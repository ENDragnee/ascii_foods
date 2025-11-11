"use client";

import { useState } from "react";
import Image from "next/image"; // Using next/image for optimization

// --- TYPE DEFINITIONS ---
interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

interface MenuCardProps {
  item: MenuItem;
  isInCart: boolean;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

/**
 * A compact card component to display a single menu item.
 * Optimized for a 2-column mobile layout.
 */
export default function MenuCard({ item, isInCart, quantity, onAdd, onRemove }: MenuCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer transition-all duration-300"
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
        {/* Top section: Image, Name, Price */}
        <div className="text-center flex-grow">
          <div className="relative h-24 w-24 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            ) : (
              // Fallback emoji or placeholder
              <span className="text-5xl flex items-center justify-center h-full w-full bg-gray-100 rounded-full">
                🍽️
              </span>
            )}
          </div>
          <h3 className="text-base font-bold leading-tight" style={{ color: "#27742d" }}>
            {item.name}
          </h3>
          <p className="text-lg font-bold mt-1" style={{ color: "#db1020" }}>
            {item.price} ብር
          </p>
        </div>

        {/* Bottom section: Cart Controls */}
        <div className="mt-2 flex-shrink-0">
          {!isInCart ? (
            <button
              onClick={onAdd}
              className="w-full py-2 px-3 rounded-lg font-bold text-sm text-white transition-all transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #27742d 0%, #1f5c23 100%)",
              }}
            >
              ጨምር (Add)
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-between p-1 rounded-lg"
              style={{ background: "rgba(219, 16, 32, 0.1)" }}
            >
              <button onClick={onRemove} className="px-3 py-1 text-xl font-bold rounded-md transition-colors" style={{ color: "#db1020" }}>
                −
              </button>
              <span className="font-bold text-base" style={{ color: "#db1020" }}>
                {quantity}
              </span>
              <button onClick={onAdd} className="px-3 py-1 text-xl font-bold rounded-md transition-colors" style={{ color: "#27742d" }}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
