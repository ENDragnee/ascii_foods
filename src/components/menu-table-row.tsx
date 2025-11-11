"use client"

interface MenuTableRowProps {
  item: {
    id: number;
    name: string;
    price: number;
    emoji: string;
  };
  isInCart: boolean;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

/**
 * A compact row component for displaying a menu item in a table/list view.
 */
export function MenuTableRow({ item, isInCart, quantity, onAdd, onRemove }: MenuTableRowProps) {
  return (
    <div
      className="flex items-center p-4 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-[#ffd700]/50 transition-all"
    >
      {/* Emoji and Name */}
      <div className="flex items-center gap-4 flex-1">
        <span className="text-4xl">{item.emoji}</span>
        <div>
          <h4 className="font-bold text-lg" style={{ color: "#27742d" }}>{item.name}</h4>
          <p className="font-semibold text-md" style={{ color: "#db1020" }}>
            {item.price} ብር
          </p>
        </div>
      </div>

      {/* Cart Controls */}
      <div className="flex items-center gap-4">
        {!isInCart ? (
          <button
            onClick={onAdd}
            className="px-6 py-2 rounded-lg font-bold text-white transition-all transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #ffd700 0%, #db1020 100%)",
            }}
          >
            Add
          </button>
        ) : (
          <div
            className="flex items-center justify-between p-1 rounded-lg"
            style={{ background: "rgba(219, 16, 32, 0.1)", border: "2px solid #db1020" }}
          >
            <button onClick={onRemove} className="px-3 py-1 text-2xl font-bold rounded-md transition-colors hover:bg-red-200/50" style={{ color: "#db1020" }}>
              −
            </button>
            <span className="font-bold text-lg w-8 text-center" style={{ color: "#db1020" }}>
              {quantity}
            </span>
            <button onClick={onAdd} className="px-3 py-1 text-2xl font-bold rounded-md transition-colors hover:bg-green-200/50" style={{ color: "#27742d" }}>
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}