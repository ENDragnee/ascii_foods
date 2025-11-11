"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Minus, Plus, Star } from "lucide-react"

interface ItemModalProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    image: string
    rating: number
    reviews: number
  }
  onClose: () => void
  onAddToCart: (item: any, quantity: number) => void
}

const CUSTOMIZATIONS = [
  {
    id: "size",
    name: "Size",
    options: ["Small (+$0)", "Regular (+$0)", "Large (+$1.50)", "Extra Large (+$2.00)"],
    default: "Regular",
  },
  {
    id: "extras",
    name: "Extras",
    options: ["Extra Cheese (+$0.50)", "Bacon (+$0.75)", "Grilled Onions (+$0.50)", "Mushrooms (+$0.50)"],
    default: [],
  },
]

export function ItemModal({ item, onClose, onAddToCart }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("Regular")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  const handleAddToCart = () => {
    onAddToCart(
      {
        ...item,
        size: selectedSize,
        extras: selectedExtras,
      },
      quantity,
    )
  }

  const calculatePrice = () => {
    let total = item.price

    // Add size price
    const sizeOption = CUSTOMIZATIONS[0].options.find((opt) => opt.includes(selectedSize))
    if (sizeOption && sizeOption.includes("+$")) {
      const match = sizeOption.match(/\+\$(\d+\.?\d*)/)
      if (match) total += Number.parseFloat(match[1])
    }

    // Add extras price
    selectedExtras.forEach((extra) => {
      const match = extra.match(/\+\$(\d+\.?\d*)/)
      if (match) total += Number.parseFloat(match[1])
    })

    return total
  }

  const handleToggleExtra = (extra: string) => {
    setSelectedExtras((prev) => (prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg z-10">
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="relative h-64 md:h-80 overflow-hidden bg-muted">
          <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2">{item.name}</h2>
            <p className="text-muted-foreground text-lg">{item.description}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-accent text-accent" />
              <span className="font-semibold">{item.rating}</span>
            </div>
            <span className="text-muted-foreground">({item.reviews} reviews)</span>
          </div>

          {/* Customization Sections */}
          <div className="space-y-6">
            {/* Size Selection */}
            <div>
              <h3 className="font-semibold text-lg mb-3">{CUSTOMIZATIONS[0].name}</h3>
              <div className="grid grid-cols-2 gap-3">
                {CUSTOMIZATIONS[0].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedSize(option.split(" (")[0])}
                    className={`p-3 rounded-lg border-2 transition font-medium ${
                      selectedSize === option.split(" (")[0]
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {option.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras Selection */}
            <div>
              <h3 className="font-semibold text-lg mb-3">{CUSTOMIZATIONS[1].name}</h3>
              <div className="space-y-2">
                {CUSTOMIZATIONS[1].options.map((extra) => (
                  <label
                    key={extra}
                    className="flex items-center p-3 rounded-lg border border-border hover:border-muted-foreground cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra)}
                      onChange={() => handleToggleExtra(extra)}
                      className="w-5 h-5 rounded border-border cursor-pointer accent-primary"
                    />
                    <span className="ml-3 font-medium">{extra}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity and Price */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Quantity:</span>
              <div className="flex items-center gap-3 bg-muted rounded-lg p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-background rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:bg-background rounded">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total Price</p>
              <p className="text-3xl font-bold text-primary">${(calculatePrice() * quantity).toFixed(2)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 border-2 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
