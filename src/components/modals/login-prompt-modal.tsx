"use client";

import { SignInForm } from "@/components/signin-form";
import { useRouter } from "next/navigation";
import { useEmailAuth } from "@/hooks/use-email-auth";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({
  isOpen,
  onClose,
}: LoginPromptModalProps) {
  const router = useRouter();
  const { handleEmailAuth, error, isLoading } = useEmailAuth();

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await handleEmailAuth(e);

    if (success) {
      onClose();
      router.refresh(); // optional, mostly for server-rendered state
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
          onSubmit={handleFormSubmit}
          handleSocial={handleSocialSignIn}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
