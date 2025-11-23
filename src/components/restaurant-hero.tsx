"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 md:p-8">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/path-to-your-subtle-food-texture.svg')] opacity-5" />

      {/* Decorative blobs */}
      <div
        className="absolute top-10 left-10 h-32 w-32 rounded-full opacity-30 transition-transform duration-500 hover:scale-110"
        style={{ background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-20 right-10 h-40 w-40 rounded-full opacity-40 transition-transform duration-500 hover:scale-110"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)" }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-grow flex-col items-center justify-center text-center max-w-3xl">
        <h1 className="mb-4 text-6xl font-extrabold tracking-tighter text-primary md:text-8xl">
          KK yellow
        </h1>

        <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
          ትኩስ እጅ የሚያሰቆረጥም ጣእም!!!
        </p>

        <div className="mb-12 flex h-20 items-center justify-center md:h-24">
          <p className="min-h-[3rem] text-3xl font-light text-foreground md:text-5xl">
            {displayText}
            <span className="animate-pulse text-primary">|</span>
          </p>
        </div>

        <button
          onClick={onEnter}
          className="rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50"
        >
          ጀምር (Get Started)
        </button>

        <div className="mt-16 flex justify-center gap-4">
          {["🌶️", "🍚", "🥘"].map((emoji, idx) => (
            <div
              key={idx}
              className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-secondary/10 text-3xl transition-transform duration-300 hover:rotate-12 hover:scale-110"
              style={{ animationDelay: `${idx * 0.2}s`, animationDuration: '2s' }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ FOOTER: Added credit section at the absolute bottom */}
      <footer className="relative z-10 mt-auto w-full text-center">
        <p className="text-sm text-muted-foreground">
          Powered by{" "}
          <Link
            href="/about"
            className="font-semibold text-foreground transition-colors hover:text-primary hover:underline underline-offset-4"
          >
            ASCII Technologies PLC
          </Link>
        </p>
      </footer>
    </div>
  )
}
