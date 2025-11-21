"use client"

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, X } from "lucide-react";
import OrderCard from "./order-card";
import type { Order } from "@/lib/orderUtils";
import { OrderStatus } from "@/generated/prisma/client";

interface KanbanColumnProps {
  title: string;
  icon: LucideIcon;
  count: number;
  accentColor: string;
  orders: Order[];
  // ✅ Updated to accept specific status
  onUpdateStatus: (batchId: string, newStatus: OrderStatus) => void;
  isActive: boolean;
  onColumnSelect: () => void;
}

export default function KanbanColumn({
  title,
  icon: Icon,
  count,
  accentColor,
  orders,
  onUpdateStatus,
  isActive,
  onColumnSelect,
}: KanbanColumnProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter(
    (order) =>
      order.bonoNumber?.toString().includes(searchQuery) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.foodName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div
      onClick={onColumnSelect}
      className={`flex flex-col bg-card rounded-lg shadow-sm overflow-hidden transition-all duration-500 ease-in-out cursor-pointer border border-border ${isActive ? "col-span-12 md:col-span-8" : "col-span-12 md:col-span-2 hover:shadow-md hover:border-border/80"}`}
    >
      <div
        className={`px-6 py-4 border-b border-border transition-all duration-500 ${isActive ? "opacity-100" : "opacity-60"}`}
        style={{ borderTopColor: accentColor, borderTopWidth: "4px" }}
      >
        <div className={`flex items-center justify-between transition-all duration-500 ${isActive ? "flex-row" : "md:flex-col md:gap-2"}`}>
          <div className={`flex items-center gap-2 transition-all duration-500 ${isActive ? "flex-row" : "md:flex-col"}`}>
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
            <h2
              className={`font-semibold text-foreground transition-all duration-500 ${isActive ? "text-base whitespace-nowrap" : "text-sm md:text-xs md:whitespace-nowrap"}`}
              style={!isActive && window.innerWidth >= 768 ? { writingMode: "vertical-rl", transform: "rotate(-180deg)", letterSpacing: "0.05em" } : {}}
            >
              {title}
            </h2>
          </div>
          {isActive && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white flex-shrink-0" style={{ backgroundColor: accentColor }}>
              {filteredOrders.length}
            </span>
          )}
        </div>

        {isActive && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by bono, name, or food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-10 pr-10 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-3 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">{searchQuery ? "No orders match your search" : "No orders in this column"}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              accentColor={accentColor}
              // ✅ Pass the function to update specific status
              onUpdateStatus={(status) => onUpdateStatus(order.id, status)}
              isNew={order.isNew}
            />
          ))
        )}
      </div>
    </div>
  );
}
