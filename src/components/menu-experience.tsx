"use client"

import { useState, useMemo } from "react"
import { LayoutGrid, List, Search, X as CloseIcon } from "lucide-react"
import MenuCard from "./menu-card"
import CartPreview from "./cart-preview"
import { MenuTableRow } from "./menu-table-row"
import { cn } from "@/lib/utils"

// --- MOCK DATA ---
const MENU_ITEMS = [
    { id: 1, name: "እንቁላል ፍርፍር", price: 100, category: "breakfast", emoji: "🍳" },
    { id: 2, name: "እንቁላል ፍርፍር በአቮካዶ", price: 130, category: "breakfast", emoji: "🥑" },
    { id: 3, name: "ፓስታ በአትክልት", price: 110, category: "main", emoji: "🍝" },
    { id: 4, name: "ፓስታ በስጋ", price: 120, category: "main", emoji: "🍝" },
    { id: 5, "name": "ሩዝ በአትክልት", price: 110, category: "main", emoji: "🍚" },
    { id: 6, name: "ስፔሻል ሳንዱች", price: 140, category: "main", emoji: "🥪" },
    { id: 7, name: "ተጋቢኖ", price: 130, category: "specialty", emoji: "🥘" },
    { id: 8, name: "ድፍን ምስር በአልጫ", price: 100, category: "sides", emoji: "🫘" },
    { id: 9, name: "ጎመን ጥብስ", price: 100, category: "sides", emoji: "🥬" },
    { id: 10, name: "ሞክሩ ፍትፍት", price: 120, category: "specialty", emoji: "🌶️" },
]

const CATEGORIES = ["all", "favorites", "breakfast", "main", "specialty", "sides"]
const MOCK_FAVORITES = [2, 7, 10]

export default function MenuExperience({ onOrder, onBack }: { onOrder: (order: any) => void; onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<Map<number, number>>(new Map())
  const [showCart, setShowCart] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  const filteredItems = useMemo(() => {
    let items = MENU_ITEMS
    if (selectedCategory === "favorites") {
      items = items.filter(item => MOCK_FAVORITES.includes(item.id))
    } else if (selectedCategory !== "all") {
      items = items.filter((item) => item.category === selectedCategory)
    }
    if (searchQuery.trim() !== "") {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return items
  }, [selectedCategory, searchQuery])

  const addToCart = (id: number) => setCart((prev) => new Map(prev).set(id, (prev.get(id) || 0) + 1));
  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const newCart = new Map(prev)
      const currentQty = newCart.get(id)
      if (currentQty && currentQty > 1) newCart.set(id, currentQty - 1);
      else newCart.delete(id);
      return newCart
    })
  }

  const getCartItems = () => Array.from(cart.entries()).map(([id, qty]) => ({ ...MENU_ITEMS.find((i) => i.id === id)!, qty }));
  const total = getCartItems().reduce((sum, item) => sum + item.price * item.qty, 0)
  const handleCheckout = () => onOrder({ /* ... order data ... */ });

  return (
    <div className="min-h-screen" style={{ background: "#f9f5f5" }}>
      <header className="sticky top-0 z-40 bg-[#f9f5f5]/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          {isSearchVisible ? (
            <div className="flex items-center gap-2 w-full">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="ምግብ ፈልግ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent focus:outline-none"
              />
              <button onClick={() => { setIsSearchVisible(false); setSearchQuery(""); }} className="text-sm font-semibold" style={{color: "#db1020"}}>Cancel</button>
            </div>
          ) : (
            <>
              <button onClick={onBack} className="text-2xl font-bold transition-transform hover:scale-105" style={{ color: "#db1020" }}>
                ←
              </button>
              <h1 className="text-xl font-bold" style={{ color: "#27742d" }}>
                Menu
              </h1>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsSearchVisible(true)} className="p-2">
                    <Search className="h-5 w-5 text-gray-600"/>
                </button>
                <button onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')} className="p-2">
                  {viewMode === 'grid' ? <List className="h-5 w-5 text-gray-600"/> : <LayoutGrid className="h-5 w-5 text-gray-600"/>}
                </button>
                <button onClick={() => setShowCart(!showCart)} className="relative p-2">
                  <span className="font-bold">🛒</span>
                  {cart.size > 0 && <span className="absolute top-0 right-0 block h-4 w-4 rounded-full text-xs text-white text-center" style={{ background: '#db1020', transform: 'translate(25%, -25%)' }}>{cart.size}</span>}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="sticky top-16 z-30 bg-gradient-to-b from-[#f9f5f5] via-[#f9f5f5] to-transparent">
        <div className="flex gap-3 overflow-x-auto p-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105"
              style={{
                background: selectedCategory === cat ? "#db1020" : "white",
                color: selectedCategory === cat ? "white" : "#27742d",
                border: `2px solid ${selectedCategory === cat ? "#db1020" : "rgba(39, 116, 45, 0.2)"}`,
                boxShadow: `0 2px 8px ${selectedCategory === cat ? "rgba(219, 16, 32, 0.2)" : "rgba(0,0,0,0.05)"}`
              }}
            >
              <span className="mr-2">
                {cat === 'all' && '📋'}
                {cat === 'favorites' && '⭐'}
                {cat === 'breakfast' && '🌅'}
                {cat === 'main' && '🍽️'}
                {cat === 'specialty' && '✨'}
                {cat === 'sides' && '🥗'}
              </span>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <main className="px-4 pb-48">
        {filteredItems.length > 0 ? (
          viewMode === 'grid' ? (
            // --- MODIFIED LINE ---
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4"> 
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} isInCart={cart.has(item.id)} quantity={cart.get(item.id) || 0} onAdd={() => addToCart(item.id)} onRemove={() => removeFromCart(item.id)} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <MenuTableRow key={item.id} item={item} isInCart={cart.has(item.id)} quantity={cart.get(item.id) || 0} onAdd={() => addToCart(item.id)} onRemove={() => removeFromCart(item.id)} />
              ))}
            </div>
          )
        ) : (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🍽️</p>
              <h3 className="text-2xl font-bold text-gray-700">No Dishes Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or category filters.</p>
            </div>
        )}
      </main>

      {showCart && cart.size > 0 && <CartPreview items={getCartItems()} total={total} onCheckout={handleCheckout} />}
    </div>
  )
}