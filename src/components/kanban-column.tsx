"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, X } from "lucide-react";
import OrderCard from "./order-card"; // Assuming this component exists
import type { Order } from "@/lib/orderUtils"; // Use our new, real data type

interface KanbanColumnProps {
  title: string;
  icon: LucideIcon;
  count: number;
  accentColor: string;
  orders: Order[];
  // ✅ UPDATED PROP: Now receives the current status to pass to the mutation
  onUpdateStatus: (batchId: string, currentStatus: "new" | "preparing" | "ready") => void;
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
      // Search by Bono Number or User Name
      order.bonoNumber?.toString().includes(searchQuery) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.foodName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div
      onClick={onColumnSelect}
      className={`flex flex-col bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 ease-in-out cursor-pointer border border-slate-200 ${isActive ? "col-span-8" : "col-span-2 hover:shadow-lg hover:border-slate-300"
        }`}
    >
      <div
        className={`px-6 py-4 border-b border-slate-200 transition-all duration-500 ${isActive ? "opacity-100" : "opacity-60"
          }`}
        style={{ borderTopColor: accentColor, borderTopWidth: "4px" }}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 ${isActive ? "flex-row" : "flex-col gap-2"
            }`}
        >
          <div className={`flex items-center gap-2 transition-all duration-500 ${isActive ? "flex-row" : "flex-col"}`}>
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
            <h2
              className={`font-semibold text-slate-900 transition-all duration-500 ${isActive ? "text-base whitespace-nowrap" : "text-xs whitespace-nowrap"
                }`}
              style={
                !isActive
                  ? {
                    writingMode: "vertical-rl",
                    transform: "rotate(-180deg)",
                    letterSpacing: "0.05em",
                  }
                  : {}
              }
            >
              {title}
            </h2>
          </div>
          {isActive && (
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {filteredOrders.length}
            </span>
          )}
        </div>

        {isActive && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by bono, name, or food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto p-6 space-y-3 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">{searchQuery ? "No orders match your search" : "No orders"}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              accentColor={accentColor}
              // ✅ UPDATED PROP: Pass the function that will trigger the parent's mutation
              onUpdateStatus={() => onUpdateStatus(order.id, order.status)}
              isNew={order.isNew}
            />
          ))
        )}
      </div>
    </div>
  );
}
