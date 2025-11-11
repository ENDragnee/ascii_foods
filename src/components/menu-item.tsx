"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MenuItemProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    image: string
    rating: number
    reviews: number
  }
  onSelect: () => void
}

export function MenuItem({ item, onSelect }: MenuItemProps) {
  return (
    <div
      onClick={onSelect}
      className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer border border-border"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-semibold text-sm">{item.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({item.reviews})</span>
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</span>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
