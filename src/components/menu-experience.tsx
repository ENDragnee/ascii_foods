"use client"

import { useState, useMemo } from "react"
import MenuCard from "./menu-card"
import CartPreview from "./cart-preview"

const MENU_ITEMS = [
  { id: 1, name: "እንቁላል ፍርፍር", price: 100, category: "breakfast", emoji: "🍳" },
  { id: 2, name: "እንቁላል ፍርፍር በአቮካዶ", price: 130, category: "breakfast", emoji: "🥑" },
  { id: 3, name: "ፓስታ በአትክልት", price: 110, category: "main", emoji: "🍝" },
  { id: 4, name: "ፓስታ በስጋ", price: 120, category: "main", emoji: "🍝" },
  { id: 5, name: "ሩዝ በአትክልት", price: 110, category: "main", emoji: "🍚" },
  { id: 6, name: "ስፔሻል ሳንዱች", price: 140, category: "main", emoji: "🥪" },
  { id: 7, name: "ተጋቢኖ", price: 130, category: "specialty", emoji: "🥘" },
  { id: 8, name: "ድፍን ምስር በአልጫ", price: 100, category: "sides", emoji: "🫘" },
  { id: 9, name: "ጎመን ጥብስ", price: 100, category: "sides", emoji: "🥬" },
  { id: 10, name: "ሞክሩ ፍትፍት", price: 120, category: "specialty", emoji: "🌶️" },
]

const CATEGORIES = ["all", "breakfast", "main", "specialty", "sides"]

export default function MenuExperience({ onOrder, onBack }: { onOrder: (order: any) => void; onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<Map<number, number>>(new Map())
  const [showCart, setShowCart] = useState(false)

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return MENU_ITEMS
    return MENU_ITEMS.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  const addToCart = (id: number) => {
    setCart((prev) => new Map(prev).set(id, (prev.get(id) || 0) + 1))
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const updated = new Map(prev)
      updated.delete(id)
      return updated
    })
  }

  const getCartItems = () => {
    return Array.from(cart.entries()).map(([id, qty]) => {
      const item = MENU_ITEMS.find((i) => i.id === id)
      return { ...item, qty }
    })
  }

  const total = getCartItems().reduce((sum, item) => sum + item.price * item.qty, 0)

  const handleCheckout = () => {
    const order = {
      id: "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: getCartItems(),
      total,
      status: "confirmed",
      eta: Math.floor(Math.random() * 20) + 10,
      createdAt: new Date(),
    }
    onOrder(order)
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-40 backdrop-blur-md"
        style={{ background: "rgba(26, 20, 16, 0.8)", borderBottom: "1px solid rgba(255, 97, 29, 0.2)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <button onClick={onBack} className="text-2xl font-bold" style={{ color: "#ff611d" }}>
            ← ዳግም
          </button>
          <h1 className="text-3xl font-bold" style={{ color: "#ffb80e" }}>
            ምናሌ
          </h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative px-4 py-2 rounded-full font-bold transition-all"
            style={{
              background: cart.size > 0 ? "#ff611d" : "rgba(255, 97, 29, 0.3)",
              color: "white",
            }}
          >
            🛒 {cart.size}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div
        className="sticky top-20 z-30 max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto"
        style={{ background: "linear-gradient(180deg, rgba(26, 20, 16, 0.9) 0%, transparent 100%)" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all"
            style={{
              background: selectedCategory === cat ? "#ff611d" : "rgba(255, 97, 29, 0.2)",
              color: selectedCategory === cat ? "white" : "#ffb80e",
              border: `1px solid ${selectedCategory === cat ? "#ff611d" : "rgba(255, 97, 29, 0.5)"}`,
            }}
          >
            {cat === "breakfast" && "🌅"}
            {cat === "main" && "🍽️"}
            {cat === "specialty" && "⭐"}
            {cat === "sides" && "🥗"}
            {cat === "all" && "📋"}
            {cat !== "all" && " "}
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              isInCart={cart.has(item.id)}
              quantity={cart.get(item.id) || 0}
              onAdd={() => addToCart(item.id)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Cart preview */}
      {showCart && <CartPreview items={getCartItems()} total={total} onCheckout={handleCheckout} />}
    </div>
  )
}
