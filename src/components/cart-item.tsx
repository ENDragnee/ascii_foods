"use client"

import { Trash2, Minus, Plus } from "lucide-react"

interface CartItemProps {
  item: {
    id: string
    name: string
    price: number
    quantity: number
    size?: string
    extras?: string[]
    image?: string
  }
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const itemTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Image */}
      {/* --- MODIFIED LINE --- */}
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 space-y-2">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          {item.size && <p className="text-sm text-muted-foreground">{item.size}</p>}
          {item.extras && item.extras.length > 0 && (
            <p className="text-xs text-muted-foreground">
              +{item.extras.length} extra{item.extras.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            className="p-1 hover:bg-muted rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.quantity + 1)} className="p-1 hover:bg-muted rounded">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price and Remove */}
      <div className="flex flex-col items-end justify-between">
        <span className="font-bold text-primary">${itemTotal.toFixed(2)}</span>
        <button onClick={onRemove} className="p-2 hover:bg-destructive/10 rounded text-destructive transition">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}