"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthErrorDisplay } from "@/components/auth-error-display"
import Link from "next/link"

export function SignInForm({
  onSubmit,
  isLoading = false,
  handleSocial,
  error = "",
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  isLoading?: boolean
  handleSocial: (provider: "google" | "apple") => Promise<void>
  error?: string
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <AuthErrorDisplay error={error} />}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="uppercase text-xs tracking-wider font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            required
            className="border-2 focus-visible:ring-0 focus-visible:border-menu-primary"
            style={{ borderColor: "var(--menu-border)" }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="uppercase text-xs tracking-wider font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
            autoCapitalize="none"
            autoComplete="current-password"
            disabled={isLoading}
            required
            className="border-2 focus-visible:ring-0 focus-visible:border-menu-primary"
            style={{ borderColor: "var(--menu-border)" }}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full font-bold uppercase tracking-wider h-12"
        style={{ backgroundColor: "var(--menu-primary)", color: "white" }}
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground tracking-wider">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => handleSocial("google")}
        variant="outline"
        disabled={isLoading}
        className="w-full border-2 hover:bg-opacity-10"
        style={{ borderColor: "var(--menu-border)", color: "var(--menu-secondary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(219, 16, 32, 0.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        Google
      </Button>
    </form>
  )
}
