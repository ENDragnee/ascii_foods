"use client"

interface CartItem {
  id: number
  name: string
  price: number
  qty: number
  emoji: string
}

export default function CartPreview({
  items,
  total,
  onCheckout,
}: {
  items: CartItem[]
  total: number
  onCheckout: () => void
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(26, 20, 16, 0.95)", borderTop: "2px solid #ff611d" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: "#ffb80e" }}>
          የተመረጡ ምግቦች
        </h3>

        <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: "rgba(255, 97, 29, 0.1)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold" style={{ color: "#ffb80e" }}>
                    {item.name}
                  </p>
                  <p className="text-sm opacity-70">
                    {item.price} ብር × {item.qty}
                  </p>
                </div>
              </div>
              <p className="font-bold" style={{ color: "#ff611d" }}>
                {item.price * item.qty} ብር
              </p>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between mb-4 p-4 rounded-lg"
          style={{ background: "rgba(255, 184, 14, 0.1)" }}
        >
          <p className="text-lg font-bold" style={{ color: "#ffb80e" }}>
            አጠቃላይ:
          </p>
          <p className="text-2xl font-bold" style={{ color: "#ff611d" }}>
            {total} ብር
          </p>
        </div>

        <button
          onClick={onCheckout}
          className="w-full py-4 rounded-full font-bold text-lg transition-all hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #ff611d 0%, #e32929 100%)",
            color: "white",
          }}
        >
          መፈጸም 📦
        </button>
      </div>
    </div>
  )
}
