"use client";

import Image from "next/image";

// --- TYPE DEFINITIONS ---
interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

interface MenuTableRowProps {
  item: MenuItem;
  isInCart: boolean;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

/**
 * A row component to display a single menu item in a list/table format.
 */
export function MenuTableRow({ item, isInCart, quantity, onAdd, onRemove }: MenuTableRowProps) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl transition-all duration-300"
      style={{
        background: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        border: `2px solid ${isInCart ? "rgba(219, 16, 32, 0.5)" : "transparent"}`
      }}
    >
      {/* Left Section: Image and Info */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: "#27742d" }}>
            {item.name}
          </h3>
          <p className="font-semibold text-base" style={{ color: "#db1020" }}>
            {item.price} ብር
          </p>
        </div>
      </div>

      {/* Right Section: Cart Controls */}
      <div className="flex-shrink-0">
        {!isInCart ? (
          <button
            onClick={onAdd}
            className="py-2 px-5 rounded-lg font-bold text-sm text-white transition-all transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #27742d 0%, #1f5c23 100%)",
            }}
          >
            Add
          </button>
        ) : (
          <div
            className="flex items-center justify-between p-1 rounded-lg gap-3"
            style={{ background: "rgba(39, 116, 45, 0.05)" }}
          >
            <button onClick={onRemove} className="px-2 text-xl font-bold rounded-md transition-colors" style={{ color: "#db1020" }}>
              −
            </button>
            <span className="font-bold text-lg" style={{ color: "#27742d" }}>
              {quantity}
            </span>
            <button onClick={onAdd} className="px-2 text-xl font-bold rounded-md transition-colors" style={{ color: "#27742d" }}>
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
