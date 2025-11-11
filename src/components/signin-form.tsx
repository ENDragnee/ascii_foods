"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export function SignInForm({
  onSubmit,
  isLoading = false,
  handleSocial
}: { onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; isLoading?: boolean; handleSocial: (provider: "google" | "apple") => Promise<void> }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            className="border-2 focus-visible:ring-[#D4FF00] focus-visible:border-[#D4FF00]"
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
            className="border-2 focus-visible:ring-[#D4FF00] focus-visible:border-[#D4FF00]"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          className="data-[state=checked]:bg-[#D4FF00] data-[state=checked]:border-[#D4FF00] data-[state=checked]:text-foreground"
        />
        <label htmlFor="remember" className="text-sm text-muted-foreground">
          Remember me
        </label>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#D4FF00] hover:bg-[#D4FF00]/90 text-foreground font-bold uppercase tracking-wider h-12"
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

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={() => handleSocial("google")}
          variant="outline"
          disabled={isLoading}
          className="border-2 hover:border-[#D4FF00] hover:bg-[#D4FF00]/10 bg-transparent"
        >
          Google
        </Button>
        <Button
          type="button"
          onClick={() => handleSocial("google")}
          variant="outline"
          disabled={isLoading}
          className="border-2 hover:border-[#D4FF00] hover:bg-[#D4FF00]/10 bg-transparent"
        >
          Apple
        </Button>
      </div>
    </form>
  )
}
