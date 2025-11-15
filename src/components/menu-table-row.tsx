"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { MenuItem } from "@/types";

interface MenuTableRowProps {
  item: MenuItem;
  isInCart: boolean;
  quantity: number;
  isFavorite: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onToggleFavorite: (foodId: string) => void;
}

export function MenuTableRow({
  item,
  isInCart,
  quantity,
  isFavorite,
  onAdd,
  onRemove,
  onToggleFavorite,
}: MenuTableRowProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(item.id);
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border bg-card p-3 shadow-sm transition-all duration-300 ${isInCart ? "border-primary/50 ring-2 ring-primary/20" : "border-border"
        }`}
    >
      <div className="relative h-16 w-16 flex-shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-3xl text-muted-foreground">
            🍽️
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
        <p className="text-base font-semibold text-primary">{item.price.toFixed(2)} ETB</p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-4">
        <button
          onClick={handleFavoriteClick}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle Favorite"
        >
          <Star
            className={`h-6 w-6 transition-all ${isFavorite ? "text-yellow-400 fill-yellow-400" : ""}`}
          />
        </button>

        {!isInCart ? (
          <button
            onClick={onAdd}
            className="transform rounded-md bg-primary py-2 px-5 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-md bg-muted p-1">
            <button
              onClick={onRemove}
              className="rounded-md px-2 text-xl font-bold text-destructive transition-colors hover:bg-destructive/10"
            >
              −
            </button>
            <span className="text-lg font-bold text-primary">{quantity}</span>
            <button
              onClick={onAdd}
              className="rounded-md px-2 text-xl font-bold text-primary transition-colors hover:bg-primary/10"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
