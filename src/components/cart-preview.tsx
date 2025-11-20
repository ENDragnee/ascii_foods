"use client";

import Image from "next/image";
import { CartItem } from "@/types";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartPreviewProps {
  items: CartItem[];
  total: number;
  isPlacingOrder: boolean;
  isAuthenticated: boolean;
  routeToSignIn: () => void;
  onCheckout: () => void;
  onClose: () => void;
}

export default function CartPreview({
  items,
  total,
  isPlacingOrder,
  isAuthenticated,
  routeToSignIn,
  onCheckout,
  onClose
}: CartPreviewProps) {

  return (
    // ✅ LAYOUT: Full-screen overlay for the modal. `items-end` pushes the sheet to the bottom.
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ✅ LAYOUT: The main "bottom sheet" container. */}
      <div
        className="relative flex h-full w-full max-w-2xl flex-col rounded-t-lg border-t border-border bg-card shadow-lg animate-in slide-in-from-bottom-full duration-300 md:mx-auto md:h-auto md:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the sheet
      >
        {/* Header */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border p-4">
          <h3 className="text-xl font-bold text-foreground">Your Order</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cart preview">
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </header>

        {/* ✅ LAYOUT: This is the scrollable content area. */}
        <div className="flex-grow overflow-y-auto p-4 min-h-0">
          <div className="space-y-3">
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
        </div>

        {/* ✅ LAYOUT: The footer is fixed at the bottom of the sheet. */}
        <footer className="flex flex-shrink-0 flex-col gap-3 border-t border-border bg-card p-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <p className="text-lg font-bold text-foreground">Total:</p>
            <p className="text-2xl font-bold text-primary">{total.toFixed(2)} ETB</p>
          </div>

          {isAuthenticated ? (
            <Button size="lg" className="w-full text-lg" onClick={onCheckout} disabled={isPlacingOrder}>
              {isPlacingOrder ? <Loader2 className="animate-spin" /> : <>Checkout 📦</>}
            </Button>
          ) : (
            <Button size="lg" className="w-full text-lg" onClick={routeToSignIn}>
              Sign in to Checkout
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
