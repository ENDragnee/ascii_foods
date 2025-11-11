"use client"

import { useState } from "react"
import { MenuHeader } from "@/components/menu-header"
import { MenuCategory } from "@/components/menu-category"
import { ItemModal } from "@/components/item-modal"
import { useCart } from "@/hooks/use-cart"

const MENU_DATA = [
  {
    id: "burgers",
    name: "Burgers",
    items: [
      {
        id: "classic-burger",
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, and our special sauce",
        price: 8.99,
        image: "/classic-burger.jpg",
        rating: 4.8,
        reviews: 324,
      },
      {
        id: "double-burger",
        name: "Double Deluxe",
        description: "Two beef patties with cheese, bacon, and grilled onions",
        price: 11.99,
        image: "/double-deluxe-burger.jpg",
        rating: 4.9,
        reviews: 512,
      },
      {
        id: "spicy-burger",
        name: "Spicy Inferno",
        description: "Bold and fiery with jalapeños, pepper jack cheese, and sriracha mayo",
        price: 9.99,
        image: "/spicy-burger.jpg",
        rating: 4.7,
        reviews: 208,
      },
    ],
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      {
        id: "fries",
        name: "Golden Fries",
        description: "Crispy hand-cut fries with sea salt",
        price: 3.99,
        image: "/golden-fries.jpg",
        rating: 4.9,
        reviews: 1200,
      },
      {
        id: "onion-rings",
        name: "Onion Rings",
        description: "Battered and fried golden brown",
        price: 4.49,
        image: "/onion-rings.jpg",
        rating: 4.6,
        reviews: 445,
      },
      {
        id: "coleslaw",
        name: "Coleslaw",
        description: "Fresh cabbage slaw with creamy dressing",
        price: 2.99,
        image: "/creamy-coleslaw.png",
        rating: 4.5,
        reviews: 167,
      },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      {
        id: "soda",
        name: "Soft Drinks",
        description: "Choose from: Cola, Lemon, Orange, or Grape",
        price: 2.49,
        image: "/soft-drink-soda.jpg",
        rating: 4.4,
        reviews: 890,
      },
      {
        id: "milkshake",
        name: "Milkshake",
        description: "Vanilla, Chocolate, or Strawberry flavors",
        price: 4.99,
        image: "/classic-milkshake.png",
        rating: 4.8,
        reviews: 556,
      },
      {
        id: "juice",
        name: "Fresh Juice",
        description: "Freshly squeezed orange or apple juice",
        price: 3.99,
        image: "/fresh-juice.jpg",
        rating: 4.7,
        reviews: 334,
      },
    ],
  },
]

export default function MenuPage() {
  const [selectedItem, setSelectedItem] = useState(null)
  const { cart, addToCart } = useCart()

  const handleAddToCart = (item, quantity) => {
    addToCart({
      ...item,
      quantity,
    })
    setSelectedItem(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-muted-foreground">Fresh, delicious food made to order</p>
        </div>

        <div className="space-y-16">
          {MENU_DATA.map((category) => (
            <MenuCategory key={category.id} category={category} onSelectItem={(item) => setSelectedItem(item)} />
          ))}
        </div>
      </main>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} />
      )}
    </div>
  )
}
