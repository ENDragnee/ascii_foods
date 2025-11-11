"use client"

import { useState, useCallback } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  extras?: string[]
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (ci) => ci.id === item.id && ci.size === item.size && JSON.stringify(ci.extras) === JSON.stringify(item.extras),
      )

      if (existingItem) {
        return prev.map((ci) => (ci === existingItem ? { ...ci, quantity: ci.quantity + item.quantity } : ci))
      }

      return [...prev, item]
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }
}
