"use client"

import { useState, useEffect } from "react"

// An array of dishes to be displayed in the hero section.
const DISHES = ["እንቁላል ፍርፍር", "ፓስታ በአትክልት", "ሩዝ በአትክልት", "ሶያ", "ተጋቢኖ", "የቤቱ ስፔሻል", "ጨጨብሳ", "ስፔሻል ሳንዱች"]

export default function RestaurantHero({ onEnter }: { onEnter: () => void }) {
  const [displayText, setDisplayText] = useState("")
  const [dishIndex, setDishIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentDish = DISHES[dishIndex]
    const typingSpeed = isDeleting ? 50 : 100

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === currentDish) {
        // Pause before deleting
        setTimeout(() => setIsDeleting(true), 1500)
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false)
        setDishIndex((prevIndex) => (prevIndex + 1) % DISHES.length)
      } else {
        setDisplayText(
          isDeleting
            ? currentDish.substring(0, displayText.length - 1)
            : currentDish.substring(0, displayText.length + 1),
        )
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayText, dishIndex, isDeleting])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden" style={{ background: "radial-gradient(circle, #f9f5f5 0%, #f0e5e5 100%)" }}>
      {/* Textured background element */}
      <div className="absolute inset-0 bg-[url('/path-to-your-subtle-food-texture.svg')] opacity-5" />

      {/* Interactive background elements with parallax effect */}
      <div
        className="absolute top-10 left-10 w-32 h-32 rounded-full transition-transform duration-500 transform hover:scale-110"
        style={{ background: "radial-gradient(circle, #ffd700 0%, transparent 70%)", opacity: 0.5 }}
      />
      <div
        className="absolute bottom-10 right-10 w-40 h-40 rounded-full transition-transform duration-500 transform hover:scale-110"
        style={{ background: "radial-gradient(circle, #db1020 0%, transparent 70%)", opacity: 0.5 }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full transition-transform duration-500 transform hover:scale-110"
        style={{ background: "radial-gradient(circle, #27742d 0%, transparent 70%)", opacity: 0.4 }}
      />


      <div className="relative z-10 text-center max-w-3xl">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-4 tracking-tighter" style={{ color: "#db1020" }}>
          KK yellow
        </h1>

        <p className="text-lg md:text-xl mb-8 opacity-80 leading-relaxed" style={{ lineHeight: 1.6 }}>ትኩስ እጅ የሚያሰቆረጥም ጣእም!!!</p>

        <div className="mb-12 h-24 flex items-center justify-center">
          <p className="text-3xl md:text-5xl font-light" style={{ color: "#27742d", minHeight: "3rem" }}>
            {displayText}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        <button
          onClick={onEnter}
          className="group relative px-8 py-4 text-lg font-bold rounded-full overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
          style={{
            background: "linear-gradient(135deg, #ffd700 0%, #db1020 100%)",
            color: "#f9f5f5",
            boxShadow: "0 4px 15px 0 rgba(219, 16, 32, 0.75)",
          }}
        >
          <span className="relative z-10"> ጀምር</span>
          <div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          />
        </button>

        <div className="mt-16 flex justify-center gap-4">
          {["🌶️", "🍚", "🥘"].map((emoji, idx) => (
            <div
              key={idx}
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-transform duration-300 transform hover:rotate-12 hover:scale-110"
              style={{
                background: "rgba(39, 116, 45, 0.1)",
                animation: `bounce 2s infinite ${idx * 0.2}s`,
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
