"use client";

import Image from "next/image";
import { CartItem } from "@/types";
import { Loader2 } from "lucide-react"; // A nice loading spinner icon

interface CartPreviewProps {
  items: CartItem[];
  total: number;
  isPlacingOrder: boolean; // New prop to indicate loading state
  onCheckout: () => void;
}

export default function CartPreview({ items, total, isPlacingOrder, onCheckout }: CartPreviewProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-sm"
      style={{ background: "rgba(255, 255, 255, 0.8)", borderTop: "2px solid #db1020" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-5">
        <h3 className="text-xl font-bold mb-4" style={{ color: "#27742d" }}>
          Your Order
        </h3>

        <div className="max-h-48 overflow-y-auto mb-4 space-y-2 pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-lg"
              style={{ background: "rgba(39, 116, 45, 0.05)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0">
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
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "#27742d" }}>
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.price} ብር × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-bold text-gray-800">
                {item.price * item.quantity} ብር
              </p>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between mb-4 p-4 rounded-lg"
          style={{ background: "rgba(39, 116, 45, 0.1)" }}
        >
          <p className="text-lg font-bold" style={{ color: "#27742d" }}>
            Total:
          </p>
          <p className="text-2xl font-bold" style={{ color: "#db1020" }}>
            {total} ብር
          </p>
        </div>

        <button
          onClick={onCheckout}
          disabled={isPlacingOrder} // Disable the button while the order is being placed
          className="w-full py-3 rounded-full font-bold text-lg text-white transition-all hover:shadow-lg hover:scale-105 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #db1020 0%, #a80c18 100%)",
          }}
        >
          {isPlacingOrder ? (
            <Loader2 className="animate-spin" /> // Show spinner when loading
          ) : (
            'Checkout 📦'
          )}
        </button>
      </div>
    </div>
  );
}
