"use client"

import { MenuItem } from "./menu-item"

interface Category {
  id: string
  name: string
  items: Array<{
    id: string
    name: string
    description: string
    price: number
    image: string
    rating: number
    reviews: number
  }>
}

interface MenuCategoryProps {
  category: Category
  onSelectItem: (item: any) => void
}

export function MenuCategory({ category, onSelectItem }: MenuCategoryProps) {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-primary">{category.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.items.map((item) => (
          <MenuItem key={item.id} item={item} onSelect={() => onSelectItem(item)} />
        ))}
      </div>
    </section>
  )
}
