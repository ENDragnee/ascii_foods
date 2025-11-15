"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { MenuItem } from "@/types";

interface MenuCardProps {
  item: MenuItem;
  isInCart: boolean;
  quantity: number;
  isFavorite: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onToggleFavorite: (foodId: string) => void;
}

export default function MenuCard({
  item,
  isInCart,
  quantity,
  isFavorite,
  onAdd,
  onRemove,
  onToggleFavorite,
}: MenuCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(item.id);
  };

  return (
    <div className="group relative flex h-full flex-col cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 z-10 rounded-full bg-card/50 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Toggle Favorite"
      >
        <Star
          className={`h-5 w-5 transition-all duration-200 ${isFavorite ? "text-yellow-400 fill-yellow-400" : ""
            }`}
        />
      </button>

      <div className="flex-grow p-4 text-center">
        <div className="relative mx-auto mb-3 h-24 w-24 transition-transform duration-300 group-hover:scale-110">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-4xl text-muted-foreground">
              🍽️
            </span>
          )}
        </div>
        <h3 className="text-base font-bold leading-tight text-foreground">{item.name}</h3>
        <p className="mt-1 text-lg font-bold text-primary">{item.price.toFixed(2)} ETB</p>
      </div>

      <div className="mt-auto flex-shrink-0 p-3 pt-0">
        {!isInCart ? (
          <button
            onClick={onAdd}
            className="w-full transform rounded-md bg-primary py-2 px-3 text-sm font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
          >
            Add
          </button>
        ) : (
          <div className="flex w-full items-center justify-between rounded-md bg-muted p-1">
            <button
              onClick={onRemove}
              className="rounded-md px-3 py-1 text-xl font-bold text-destructive transition-colors hover:bg-destructive/10"
            >
              −
            </button>
            <span className="text-base font-bold text-primary">{quantity}</span>
            <button
              onClick={onAdd}
              className="rounded-md px-3 py-1 text-xl font-bold text-primary transition-colors hover:bg-primary/10"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
