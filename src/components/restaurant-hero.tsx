"use client"

import { useState, useEffect } from "react"

const DISHES = ["እንቁላል ፍርፍር", "ፓስታ በአትክልት", "ሩዝ በአትክልት", "ዩዟዩ ፍትፍት", "ስፔሻል ሳንዱች"]

export default function RestaurantHero({ onEnter }: { onEnter: () => void }) {
  const [displayText, setDisplayText] = useState("")
  const [dishIndex, setDishIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentDish = DISHES[dishIndex]
    const timeout = setTimeout(
      () => {
        if (!isDeleting && displayText === currentDish) {
          setIsDeleting(true)
        } else if (isDeleting && displayText === "") {
          setIsDeleting(false)
          setDishIndex((dishIndex + 1) % DISHES.length)
        } else {
          setDisplayText(
            isDeleting
              ? currentDish.substring(0, displayText.length - 1)
              : currentDish.substring(0, displayText.length + 1),
          )
        }
      },
      isDeleting ? 50 : 100,
    )

    return () => clearTimeout(timeout)
  }, [displayText, dishIndex, isDeleting])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-10 left-10 w-32 h-32 rounded-full"
          style={{ background: "radial-gradient(circle, #ff611d 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full"
          style={{ background: "radial-gradient(circle, #ffb80e 0%, transparent 70%)" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Animated title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter" style={{ color: "#ff611d" }}>
          ምናሌ
        </h1>

        {/* Animated dish carousel */}
        <div className="mb-12 h-24 flex items-center justify-center">
          <p className="text-3xl md:text-5xl font-light" style={{ color: "#ffb80e", minHeight: "3rem" }}>
            {displayText}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl mb-8 opacity-80 leading-relaxed">ሙቀት፣ ጥንካሬ እና ባህላዊ ጣዕም። ተወዳጀ አለበት።</p>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className="relative group px-8 py-4 text-lg font-bold rounded-full overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ff611d 0%, #e32929 100%)",
            color: "white",
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "linear-gradient(135deg, #ffb80e 0%, #ff611d 100%)" }}
          />
          <span className="relative">አሁን ጀምር</span>
        </button>

        {/* Floating decorative elements */}
        <div className="mt-16 flex justify-center gap-4">
          {["🌶️", "🍚", "🥘"].map((emoji, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce"
              style={{
                background: "rgba(255, 97, 29, 0.1)",
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
