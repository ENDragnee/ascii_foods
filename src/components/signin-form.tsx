"use client";

import type React from "react";
import { useQueryClient } from "@tanstack/react-query"; // ✅ Import useQueryClient
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthErrorDisplay } from "@/components/auth-error-display";
import Link from "next/link";

export function SignInForm({
  onSubmit,
  isLoading = false,
  handleSocial,
  error = "",
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<boolean>; // ✅ Changed to return a boolean
  isLoading?: boolean;
  handleSocial: (provider: "google" | "apple") => Promise<void>;
  error?: string;
}) {
  const queryClient = useQueryClient(); // ✅ Get the query client instance

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const success = await onSubmit(event);

    // ✅ If the onSubmit function (from the parent) returns true...
    if (success) {
      // ✅ Invalidate the session query to trigger a global refetch.
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {error && <AuthErrorDisplay error={error} />}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" placeholder="name@example.com" type="email" required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" placeholder="••••••••" type="password" required disabled={isLoading} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button type="button" onClick={() => handleSocial("google")} variant="outline" disabled={isLoading} className="w-full">
        Google
      </Button>
    </form>
  );
}
