"use client";

import { useState } from "react";
import { SignInForm } from "@/components/signin-form"; // Adjust path as needed
import { useRouter } from "next/navigation";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  // This function is passed to the SignInForm
  const handleSignInSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<boolean> => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Sign-in failed");
      }

      // On success, close the modal. The form will handle invalidation.
      onClose();
      return true; // ✅ Return true on success

    } catch (error) {
      console.log(error)
      return false; // ✅ Return false on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    router.push(`/api/auth/signin/${provider}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-2xl font-bold text-foreground">Sign In to Continue</h2>
        <p className="mb-6 text-muted-foreground">
          You need to be logged in to use this feature.
        </p>
        <SignInForm
          onSubmit={handleSignInSubmit}
          handleSocial={handleSocialSignIn}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
