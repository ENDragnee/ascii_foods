"use client"

import type React from "react"

import Link from "next/link"
import { SignUpForm } from "@/components/signup-form"

interface SignUpViewProps {
  onSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  handleSocial: (provider: "google" | "apple") => Promise<void>
  error?: string
}

export function SignUpView({ onSubmit, isLoading, handleSocial, error = "" }: SignUpViewProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2 mb-8">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ backgroundColor: "var(--menu-primary)" }}
                >
                  <span className="text-white font-bold text-xl">KK</span>
                </div>
                <span
                  className="text-2xl font-bold tracking-[0.2em] uppercase"
                  style={{ color: "var(--menu-secondary)" }}
                >
                  YELLOW
                </span>
              </div>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: "var(--menu-secondary)" }}>
              Create Account
            </h1>
            <p className="text-muted-foreground">Join to order</p>
          </div>

          <SignUpForm onSubmit={onSubmit} isLoading={isLoading} handleSocial={handleSocial} error={error} />

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              href="/auth?view=signin"
              className="font-medium hover:underline underline-offset-4"
              style={{ color: "var(--menu-primary)" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Image/Brand */}
      <div className="hidden lg:flex flex-1 bg-menu-background relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-menu-primary opacity-10" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-menu-primary opacity-10" />
            <div className="relative z-10 text-center space-y-6 p-12">
              <h2 className="text-6xl font-bold tracking-[0.3em] uppercase" style={{ color: "var(--menu-secondary)" }}>
                SHELL HOOD WORLD
              </h2>
              <p className="text-xl tracking-wider uppercase" style={{ color: "var(--menu-secondary)" }}>
                Complete Look Collection
              </p>
              <div className="pt-8">
                <div className="inline-block px-8 py-4" style={{ backgroundColor: "var(--menu-primary)" }}>
                  <span className="font-bold tracking-wider uppercase text-white">Organic Cotton Blend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpView
