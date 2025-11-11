"use client"

import { Button } from "@/components/ui/button"
import { MenuHeader } from "@/components/menu-header"
import { CartItem } from "@/components/cart-item"
import { useCart } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const router = useRouter()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleCheckout = () => {
    // In a real app, this would process payment
    // For now, we'll just redirect to order tracking
    localStorage.setItem(
      "lastOrder",
      JSON.stringify({
        items: cart,
        subtotal,
        tax,
        total,
        orderNumber: Math.random().toString(36).substring(7).toUpperCase(),
        timestamp: new Date().toISOString(),
      }),
    )
    clearCart()
    router.push("/orders")
  }

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader cartCount={cart.length} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {cart.length === 0 ? (
          // Empty Cart State
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="bg-muted rounded-full p-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Your cart is empty</h2>
              <p className="text-muted-foreground">Start adding items to your order</p>
            </div>
            <Link href="/menu">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-3xl font-bold mb-6">Your Order</h1>
              {cart.map((item, index) => (
                <CartItem
                  key={`${item.id}-${index}`}
                  item={item}
                  onRemove={() => removeFromCart(item.id)}
                  onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                />
              ))}
              <Link href="/menu">
                <Button variant="outline" className="w-full mt-6 border-2 bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                <Button onClick={clearCart} variant="ghost" className="w-full text-destructive">
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
