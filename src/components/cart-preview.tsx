"use client";

import Image from "next/image";
import { CartItem } from "@/types";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming Shadcn UI

interface CartPreviewProps {
  items: CartItem[];
  total: number;
  isPlacingOrder: boolean;
  onCheckout: () => void;
  onClose: () => void; // Added a close handler
}

export default function CartPreview({ items, total, isPlacingOrder, onCheckout, onClose }: CartPreviewProps) {
  return (
    // ✅ STYLE: Fully themed with CSS variables
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Your Order</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Item List */}
        <div className="mb-4 max-h-48 space-y-2 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" className="rounded-md" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-2xl text-muted-foreground">🍽️</div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.price.toFixed(2)} ETB × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-bold text-foreground">
                {(item.price * item.quantity).toFixed(2)} ETB
              </p>
            </div>
          ))}
        </div>

        {/* Total Section */}
        <div className="mb-4 flex items-center justify-between rounded-lg bg-muted p-4">
          <p className="text-lg font-bold text-foreground">Total:</p>
          <p className="text-2xl font-bold text-primary">{total.toFixed(2)} ETB</p>
        </div>

        {/* Checkout Button */}
        <Button
          size="lg"
          className="w-full text-lg"
          onClick={onCheckout}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>Checkout 📦</>
          )}
        </Button>
      </div>
    </div>
  );
}
