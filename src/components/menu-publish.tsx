"use client"

import { useState } from "react"
import { Check, Eye, EyeOff } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  emoji: string
  price: number
  category: string
  available: boolean
}

const availableMenuItems: MenuItem[] = [
  { id: "1", name: "Margherita Pizza", emoji: "🍕", price: 12.99, category: "Pizza", available: true },
  { id: "2", name: "Pepperoni Pizza", emoji: "🍕", price: 14.99, category: "Pizza", available: true },
  { id: "3", name: "Veggie Pizza", emoji: "🍕", price: 13.99, category: "Pizza", available: false },
  { id: "4", name: "Classic Burger", emoji: "🍔", price: 10.99, category: "Burgers", available: true },
  { id: "5", name: "Cheese Burger", emoji: "🍔", price: 11.99, category: "Burgers", available: true },
  { id: "6", name: "Bacon Burger", emoji: "🍔", price: 13.99, category: "Burgers", available: true },
  { id: "7", name: "French Fries", emoji: "🍟", price: 4.99, category: "Sides", available: true },
  { id: "8", name: "Onion Rings", emoji: "🧅", price: 5.99, category: "Sides", available: true },
  { id: "9", name: "Caesar Salad", emoji: "🥗", price: 9.99, category: "Salads", available: true },
  { id: "10", name: "Greek Salad", emoji: "🥗", price: 10.99, category: "Salads", available: true },
  { id: "11", name: "Pasta Carbonara", emoji: "🍝", price: 12.99, category: "Pasta", available: true },
  { id: "12", name: "Pasta Bolognese", emoji: "🍝", price: 11.99, category: "Pasta", available: true },
]

export default function MenuPublish() {
  const [selectedItems, setSelectedItems] = useState<string[]>(["1", "2", "4", "5", "6", "7", "9", "11"])
  const [isPublished, setIsPublished] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const publishMenu = () => {
    setIsPublished(true)
    console.log("Menu published with items:", selectedItems)
    setTimeout(() => setIsPublished(false), 3000)
  }

  const categories = [...new Set(availableMenuItems.map((item) => item.category))]
  const publishedItems = availableMenuItems.filter((item) => selectedItems.includes(item.id))

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Daily Menu Management</h1>
          <p className="text-slate-600">Select items to publish for customers today</p>
        </div>

        {/* Publish Status */}
        {isPublished && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Menu published successfully! Customers can now see your daily menu.
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Menu Items */}
          <div className="col-span-2 space-y-6">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">{category}</h2>
                <div className="space-y-3">
                  {availableMenuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                        style={{
                          borderColor: selectedItems.includes(item.id) ? "#2563eb" : "#e2e8f0",
                          backgroundColor: selectedItems.includes(item.id) ? "#eff6ff" : "white",
                        }}
                      >
                        <div className="flex-shrink-0">
                          {selectedItems.includes(item.id) ? (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-slate-300 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-2xl">{item.emoji}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Preview & Publish */}
          <div className="space-y-6">
            {/* Preview Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>

            {/* Menu Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Menu Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Items Selected:</span>
                  <span className="font-bold text-slate-900">
                    {selectedItems.length}/{availableMenuItems.length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(selectedItems.length / availableMenuItems.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Publish Button */}
              <button
                onClick={publishMenu}
                disabled={selectedItems.length === 0}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Menu Now
              </button>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Customer View</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {publishedItems.length === 0 ? (
                    <p className="text-slate-500 text-sm">No items selected for today's menu</p>
                  ) : (
                    publishedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-xl">{item.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
